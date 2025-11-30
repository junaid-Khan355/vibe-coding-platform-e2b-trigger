import { logger, task } from "@trigger.dev/sdk";
import { Sandbox } from "e2b";

export const runCommand = task({
  id: "run-command",
  retry: {
    maxAttempts: 2,
  },
  run: async (
    payload: {
      sandboxId: string;
      command: string;
      args?: string[];
      sudo?: boolean;
      wait?: boolean;
    }
  ) => {
    logger.log("Running command in sandbox", { payload });

    try {
      const sandbox = await Sandbox.connect(payload.sandboxId);

      const fullCommand = payload.sudo
        ? `sudo ${payload.command} ${payload.args?.join(" ") || ""}`
        : `${payload.command} ${payload.args?.join(" ") || ""}`;

      if (payload.wait) {
        const result = await sandbox.process.start({
          cmd: payload.command,
          args: payload.args || [],
          rootdir: "/home/user",
        });

        const output = await result.finished;
        const stdout = output.stdout || "";
        const stderr = output.stderr || "";

        logger.log("Command finished", {
          exitCode: output.exitCode,
          stdout: stdout.substring(0, 1000), // Log first 1000 chars
          stderr: stderr.substring(0, 1000),
        });

        return {
          commandId: result.process.processID,
          exitCode: output.exitCode,
          stdout,
          stderr,
          status: "done",
        };
      } else {
        const process = await sandbox.process.start({
          cmd: payload.command,
          args: payload.args || [],
          rootdir: "/home/user",
        });

        logger.log("Command started in background", {
          commandId: process.process.processID,
        });

        return {
          commandId: process.process.processID,
          status: "running",
        };
      }
    } catch (error) {
      logger.error("Failed to run command", { error, payload });
      throw error;
    }
  },
});

