import { logger, task } from "@trigger.dev/sdk";
import { Sandbox } from "e2b";

export const createSandbox = task({
  id: "create-sandbox",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: { timeout?: number; ports?: number[] }) => {
    logger.log("Creating e2b sandbox", { payload });

    try {
      const sandbox = await Sandbox.create({
        template: "base",
        timeout: payload.timeout ? payload.timeout / 1000 : 600, // e2b uses seconds
      });

      logger.log("Sandbox created", { sandboxId: sandbox.sandboxId });

      return {
        sandboxId: sandbox.sandboxId,
        status: "running",
      };
    } catch (error) {
      logger.error("Failed to create sandbox", { error });
      throw error;
    }
  },
});

