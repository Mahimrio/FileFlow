import { Queue } from "bullmq";
import { CONVERSION_QUEUE_NAME } from "@repo/shared";
import IORedis from "ioredis";

// In serverless environments, be careful with connection pooling.
// For now, this is adequate for a basic Next.js setup.
const connection = new IORedis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
});

export const conversionQueue = new Queue(CONVERSION_QUEUE_NAME, {
  connection,
});
