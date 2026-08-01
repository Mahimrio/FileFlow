import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback if Upstash is not configured
const fallbackCache = new Map<string, number[]>();

const fallbackRatelimit = {
  limit: async (ip: string) => {
    const now = Date.now();
    const window = 60 * 60 * 1000; // 1 hour
    const maxRequests = 10;

    if (!fallbackCache.has(ip)) {
      fallbackCache.set(ip, []);
    }

    const timestamps = fallbackCache.get(ip)!;
    // Remove old timestamps
    const validTimestamps = timestamps.filter((t: number) => now - t < window);
    
    if (validTimestamps.length >= maxRequests) {
      return { success: false, limit: maxRequests, remaining: 0, reset: validTimestamps[0] + window };
    }

    validTimestamps.push(now);
    fallbackCache.set(ip, validTimestamps);
    
    return { 
      success: true, 
      limit: maxRequests, 
      remaining: maxRequests - validTimestamps.length, 
      reset: now + window 
    };
  },
};

const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

export const ratelimit = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
    })
  : fallbackRatelimit;
