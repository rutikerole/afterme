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
  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
