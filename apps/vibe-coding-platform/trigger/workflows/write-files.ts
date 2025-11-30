import { logger, task } from "@trigger.dev/sdk";
import { Sandbox } from "e2b";

export const writeFiles = task({
  id: "write-files",
  retry: {
    maxAttempts: 2,
  },
  run: async (
    payload: {
      sandboxId: string;
      files: Array<{ path: string; content: string }>;
    }
  ) => {
    logger.log("Writing files to sandbox", {
      sandboxId: payload.sandboxId,
      fileCount: payload.files.length,
    });

    try {
      const sandbox = await Sandbox.connect(payload.sandboxId);

      // Write files in parallel
      await Promise.all(
        payload.files.map(async (file) => {
          await sandbox.filesystem.write(file.path, file.content);
        })
      );

      logger.log("Files written successfully", {
        paths: payload.files.map((f) => f.path),
      });

      return {
        success: true,
        paths: payload.files.map((f) => f.path),
      };
    } catch (error) {
      logger.error("Failed to write files", { error, payload });
      throw error;
    }
  },
});

