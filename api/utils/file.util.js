import fs from "fs";

export async function safeUnlink(file) {
  try {
    if (file && fs.existsSync(file)) {
      await fs.promises.unlink(file);
      console.log("CLEANED:", file);
    }
  } catch (e) {
    console.error("FAILED CLEAN:", file, e.message);
  }
}