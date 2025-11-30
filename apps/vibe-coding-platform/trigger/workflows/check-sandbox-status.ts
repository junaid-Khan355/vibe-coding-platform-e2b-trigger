import { logger, task } from "@trigger.dev/sdk";
import { Sandbox } from "e2b";

export const checkSandboxStatus = task({
  id: "check-sandbox-status",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: { sandboxId: string }) => {
    logger.log("Checking sandbox status", { payload });

    try {
      const sandbox = await Sandbox.connect(payload.sandboxId);
      
      // Try to list processes to check if sandbox is alive
      await sandbox.process.list();
      
      logger.log("Sandbox is running", { sandboxId: payload.sandboxId });
      
      return {
        status: "running" as const,
        sandboxId: payload.sandboxId,
      };
    } catch (error) {
      logger.log("Sandbox is stopped or not accessible", {
        sandboxId: payload.sandboxId,
        error,
      });
      
      return {
        status: "stopped" as const,
        sandboxId: payload.sandboxId,
      };
    }
  },
});

