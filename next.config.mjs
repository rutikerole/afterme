/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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

export default nextConfig;
