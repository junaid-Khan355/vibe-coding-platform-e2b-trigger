import { logger, task } from "@trigger.dev/sdk";
import { Sandbox } from "e2b";

export const getCommandLogs = task({
  id: "get-command-logs",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: {
    sandboxId: string;
    commandId: string;
    fromTimestamp?: number;
  }) => {
    logger.log("Getting command logs", { payload });

    try {
      const sandbox = await Sandbox.connect(payload.sandboxId);

      // Get process list to find the command
      const processes = await sandbox.process.list();
      const targetProcess = processes.find(
        (p) => p.processID === payload.commandId
      );

      if (!targetProcess) {
        logger.warn("Command not found", { commandId: payload.commandId });
        return {
          commandId: payload.commandId,
          logs: [],
          stdout: "",
          stderr: `Command ${payload.commandId} not found`,
        };
      }

      // For completed processes, we can't get historical logs easily
      // In a production setup, you'd want to store logs as they're generated
      // For now, return process status information
      const logs: Array<{ data: string; stream: "stdout" | "stderr" }> = [];

      if (targetProcess.status === "exited" || targetProcess.exitCode !== undefined) {
        logs.push({
          data: `Process exited with code ${targetProcess.exitCode}`,
          stream: "stdout",
        });
      } else {
        logs.push({
          data: "Process is still running. Logs will be available when process completes.",
          stream: "stdout",
        });
      }

      return {
        commandId: payload.commandId,
        logs,
        stdout: logs.filter((l) => l.stream === "stdout").map((l) => l.data).join("\n"),
        stderr: logs.filter((l) => l.stream === "stderr").map((l) => l.data).join("\n"),
      };
    } catch (error) {
      logger.error("Failed to get command logs", { error, payload });
      throw error;
    }
  },
});

