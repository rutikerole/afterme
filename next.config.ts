import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Disable static generation for error pages to avoid build issues
  experimental: {
    // PPR is causing issues with global-error, disable for now
  },
};

export default nextConfig;
