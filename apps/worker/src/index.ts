import "dotenv/config";
import { Worker, Job } from "bullmq";
import { CONVERSION_QUEUE_NAME, ConversionJobPayload } from "@repo/shared";
import IORedis from "ioredis";

console.log("Starting BullMQ Worker on queue:", CONVERSION_QUEUE_NAME);

const connection = new IORedis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  CONVERSION_QUEUE_NAME,
  async (job: Job<ConversionJobPayload>) => {
    console.log(`\n========================================`);
    console.log(`[Worker] Received queue job ${job.id}`);
    console.log(`[Worker] Database Job ID: ${job.data.jobId}`);
    console.log(`[Worker] Source Key: ${job.data.storageKeySource}`);
    console.log(`[Worker] Conversion: ${job.data.sourceFormat.toUpperCase()} -> ${job.data.targetFormat.toUpperCase()}`);
    console.log(`========================================\n`);
    
    // In Prompt 10/11, we will add the actual conversion logic here
  },
  {
    connection,
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} has completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.log(`[Worker] Job ${job?.id} has failed with error: ${err.message}`);
});
