import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execFileAsync = promisify(execFile);

export async function convertDocument(
  inputPath: string,
  targetFormat: string,
  outputDir: string
): Promise<string> {
  const timeoutMs = 120000; // 120 seconds

  try {
    const { stdout, stderr } = await execFileAsync(
      "soffice",
      [
        "--headless",
        "--convert-to",
        targetFormat,
        "--outdir",
        outputDir,
        inputPath,
      ],
      { timeout: timeoutMs }
    );
    
    // LibreOffice is notorious for exiting with code 0 even if it fails.
    // Let's verify the file actually exists.
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const expectedOutputPath = path.join(outputDir, `${baseName}.${targetFormat}`);
    
    try {
      await fs.access(expectedOutputPath);
    } catch {
      throw new Error(`Conversion failed silently. Output file not found.\nStdout: ${stdout}\nStderr: ${stderr}`);
    }
    
    return expectedOutputPath;
  } catch (error: any) {
    if (error.killed) {
      throw new Error("LibreOffice process timed out after 120 seconds.");
    }
    throw error;
  }
}
