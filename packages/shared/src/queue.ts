export const CONVERSION_QUEUE_NAME = "conversions";

export interface ConversionJobPayload {
  jobId: string;
  storageKeySource: string;
  sourceFormat: string;
  targetFormat: string;
}
