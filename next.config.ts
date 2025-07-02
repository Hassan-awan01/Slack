import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Allow production builds to proceed even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Allow production builds even with TypeScript errors — use with caution
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
