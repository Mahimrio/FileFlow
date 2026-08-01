import "dotenv/config";
import { Worker, Job } from "bullmq";
import { CONVERSION_QUEUE_NAME, ConversionJobPayload } from "@repo/shared";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";
import { pipeline } from "stream/promises";
import { convertFile } from "./converters/index";

const prisma = new PrismaClient();
const s3 = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});
const bucketName = process.env.S3_BUCKET_NAME || "";

console.log("Starting BullMQ Worker on queue:", CONVERSION_QUEUE_NAME);

const connection = new IORedis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  CONVERSION_QUEUE_NAME,
  async (job: Job<ConversionJobPayload>) => {
    const { jobId, storageKeySource, sourceFormat, targetFormat } = job.data;
    
    console.log(`\n========================================`);
    console.log(`[Worker] Processing Job: ${jobId}`);
    console.log(`[Worker] ${sourceFormat.toUpperCase()} -> ${targetFormat.toUpperCase()}`);
    
    await prisma.conversionJob.update({
      where: { id: jobId },
      data: { status: "PROCESSING" }
    });

    // Create temp directory for this job
    const jobTempDir = await fs.mkdtemp(path.join(os.tmpdir(), `fileflow-${jobId}-`));
    const inputFilePath = path.join(jobTempDir, `input.${sourceFormat}`);
    
    try {
      // 1. Download from S3
      console.log(`[Worker] Downloading ${storageKeySource}...`);
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: storageKeySource,
      });
      const s3Res = await s3.send(getCommand);
      
      if (!s3Res.Body) throw new Error("Empty body from S3");
      // @ts-ignore
      await pipeline(s3Res.Body, fsSync.createWriteStream(inputFilePath));

      // 2. Convert File
      console.log(`[Worker] Converting...`);
      const { outputPath } = await convertFile(job.data, inputFilePath, jobTempDir);

      // 3. Upload to S3
      console.log(`[Worker] Uploading result...`);
      const resultKey = `results/${jobId}-${path.basename(outputPath)}`;
      const fileBuffer = await fs.readFile(outputPath);
      
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: resultKey,
        Body: fileBuffer,
      });
      await s3.send(putCommand);

      // 4. Update Database
      await prisma.conversionJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          storageKeyResult: resultKey,
        }
      });
      console.log(`[Worker] Finished ${jobId} successfully!`);
    } catch (error: any) {
      console.error(`[Worker] Failed ${jobId}:`, error);
      await prisma.conversionJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorMessage: error.message || "Unknown error occurred during conversion",
        }
      });
      throw error; // Re-throw for BullMQ to register failure
    } finally {
      // Clean up temp directory
      try {
        await fs.rm(jobTempDir, { recursive: true, force: true });
        console.log(`[Worker] Cleaned up ${jobTempDir}`);
      } catch (err) {
        console.error(`[Worker] Failed to clean up ${jobTempDir}:`, err);
      }
    }
  },
  { connection }
);
