import { ConversionJobPayload, FORMATS } from "@repo/shared";
import { convertDocument } from "./document";

export async function convertFile(
  job: ConversionJobPayload,
  inputPath: string,
  outputDir: string
): Promise<{ outputPath: string }> {
  const sourceFormatDef = FORMATS.find((f) => f.id === job.sourceFormat);
  const targetFormatDef = FORMATS.find((f) => f.id === job.targetFormat);

  if (!sourceFormatDef || !targetFormatDef) {
    throw new Error("Invalid format specified");
  }

  // Handle documents, spreadsheets, and slides with LibreOffice
  if (
    ["documents", "spreadsheets", "slides"].includes(sourceFormatDef.category)
  ) {
    const outputPath = await convertDocument(
      inputPath,
      job.targetFormat,
      outputDir
    );
    return { outputPath };
  }

  // Images will be handled in Prompt 11
  throw new Error(`Unsupported format category: ${sourceFormatDef.category}`);
}
