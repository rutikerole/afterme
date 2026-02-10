import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Create Redis client - uses Upstash Redis
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

function getRateLimiter() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("[RateLimit] Upstash Redis not configured, rate limiting disabled");
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
      analytics: true,
      prefix: "afterme:ratelimit",
    });
  }

  return ratelimit;
}

// Different rate limits for different endpoints
export const rateLimiters = {
  // Strict limit for auth endpoints (prevent brute force)
  auth: () => {
    const rl = getRateLimiter();
    if (!rl) return null;
    return new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
      prefix: "afterme:ratelimit:auth",
    });
  },

  // Standard API limit
  api: () => getRateLimiter(),

  // Stricter limit for file uploads
  upload: () => {
    const rl = getRateLimiter();
    if (!rl) return null;
    return new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 uploads per minute
      prefix: "afterme:ratelimit:upload",
    });
  },

  // Very strict for password reset
  passwordReset: () => {
    const rl = getRateLimiter();
    if (!rl) return null;
    return new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
      prefix: "afterme:ratelimit:password-reset",
    });
  },
};

// Get identifier from request (IP or user ID)
export function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers (works with Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";
  return `ip:${ip}`;
}

// Rate limit middleware helper
export async function checkRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = "api",
  userId?: string
): Promise<{ success: boolean; response?: NextResponse }> {
  const limiter = rateLimiters[type]();

  // If rate limiting not configured, allow all requests
  if (!limiter) {
    return { success: true };
  }

  const identifier = getIdentifier(request, userId);

  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    if (!success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Too many requests",
            message: "You have exceeded the rate limit. Please try again later.",
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        ),
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[RateLimit] Error checking rate limit:", error);
    // On error, allow the request (fail open)
    return { success: true };
  }
}

// HOC for rate-limited API routes
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  type: keyof typeof rateLimiters = "api"
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const { success, response } = await checkRateLimit(request, type);

    if (!success && response) {
      return response;
    }

    return handler(request, context);
  };
}
