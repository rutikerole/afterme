import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
  // Database (Required)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters").optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional().default("noreply@afterme.app"),

  // File Storage (Cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Cron Jobs
  CRON_SECRET: z.string().optional(),

  // Twilio SMS
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Push Notifications (Web Push)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().email().optional(),

  // Error Monitoring (Sentry)
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required for database connection");
  }

  // Check recommended variables
  if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === "production") {
      errors.push("SESSION_SECRET is required in production");
    } else {
      warnings.push("SESSION_SECRET not set, using default (not secure for production)");
    }
  }

  // Check email configuration
  if (!process.env.RESEND_API_KEY) {
    warnings.push("RESEND_API_KEY not set - emails will be logged to console");
  }

  // Check file upload configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    warnings.push("Cloudinary not fully configured - file uploads will use data URLs");
  }

  // Check rate limiting
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    warnings.push("Upstash Redis not configured - rate limiting disabled");
  }

  // Check SMS
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    warnings.push("Twilio not configured - SMS notifications disabled");
  }

  // Check push notifications
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    warnings.push("VAPID keys not configured - push notifications disabled");
  }

  // Check Sentry
  if (!process.env.SENTRY_DSN && process.env.NODE_ENV === "production") {
    warnings.push("SENTRY_DSN not set - error monitoring disabled");
  }

  // Check cron secret
  if (!process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    warnings.push("CRON_SECRET not set - cron endpoints may be vulnerable");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Log environment status on startup
export function logEnvStatus(): void {
  const { valid, errors, warnings } = validateEnv();

  console.log("\n========================================");
  console.log("Environment Configuration Status");
  console.log("========================================");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Status: ${valid ? "✅ Valid" : "❌ Invalid"}`);

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((e) => console.log(`   - ${e}`));
  }

  if (warnings.length > 0) {
    console.log("\n⚠️ Warnings:");
    warnings.forEach((w) => console.log(`   - ${w}`));
  }

  // Show configured services
  console.log("\n📦 Services:");
  console.log(`   - Database: ${process.env.DATABASE_URL ? "✅ Configured" : "❌ Missing"}`);
  console.log(`   - Email (Resend): ${process.env.RESEND_API_KEY ? "✅ Configured" : "⚠️ Not configured"}`);
  console.log(`   - Storage (Cloudinary): ${process.env.CLOUDINARY_CLOUD_NAME ? "✅ Configured" : "⚠️ Not configured"}`);
  console.log(`   - Rate Limiting (Upstash): ${process.env.UPSTASH_REDIS_REST_URL ? "✅ Configured" : "⚠️ Not configured"}`);
  console.log(`   - SMS (Twilio): ${process.env.TWILIO_ACCOUNT_SID ? "✅ Configured" : "⚠️ Not configured"}`);
  console.log(`   - Push Notifications: ${process.env.VAPID_PUBLIC_KEY ? "✅ Configured" : "⚠️ Not configured"}`);
  console.log(`   - Error Monitoring (Sentry): ${process.env.SENTRY_DSN ? "✅ Configured" : "⚠️ Not configured"}`);
  console.log("========================================\n");

  // In production, throw if invalid
  if (!valid && process.env.NODE_ENV === "production") {
    throw new Error(`Invalid environment configuration:\n${errors.join("\n")}`);
  }
}

// Helper to get typed env variables
export function getEnv<K extends keyof Env>(key: K): Env[K] | undefined {
  return process.env[key] as Env[K] | undefined;
}

// Check if a service is configured
export const isConfigured = {
  email: () => !!process.env.RESEND_API_KEY,
  storage: () => !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
  rateLimit: () => !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  sms: () => !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
  pushNotifications: () => !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
  sentry: () => !!process.env.SENTRY_DSN,
};
