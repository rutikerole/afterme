import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Allow data URLs for base64 images
    unoptimized: true,
  },
  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build (can be fixed later)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG || "afterme",
  project: process.env.SENTRY_PROJECT || "afterme-web",
};

const sentryOptions = {
  // Upload source maps to Sentry
  widenClientFileUpload: true,
  // Transpile SDK to be compatible with IE11
  transpileClientSDK: true,
  // Hide source maps from generated client bundles
  hideSourceMaps: true,
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
};

// Only wrap with Sentry in production
const config = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions, sentryOptions)
  : nextConfig;

export default config;
