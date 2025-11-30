import { logger, task } from "@trigger.dev/sdk";
import { Sandbox } from "e2b";

export const readFile = task({
  id: "read-file",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: { sandboxId: string; path: string }) => {
    logger.log("Reading file from sandbox", { payload });

    try {
      const sandbox = await Sandbox.connect(payload.sandboxId);

      const content = await sandbox.filesystem.read(payload.path);

      logger.log("File read successfully", {
        path: payload.path,
        size: content.length,
      });

      return {
        content,
        path: payload.path,
      };
    } catch (error) {
      logger.error("Failed to read file", { error, payload });
      throw error;
    }
  },
});

