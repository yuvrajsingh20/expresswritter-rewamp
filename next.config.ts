import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Ensuring Turbopack ignores or correctly handles the generated Prisma Client
    turbo: {
      resolveAlias: {
        "@prisma/client": "./node_modules/@prisma/client/index.js",
      },
    },
  },
  // Fallback for webpack if Turbopack is disabled
  webpack: (config) => {
    config.externals = [...(config.externals || []), "@prisma/client", ".prisma/client"];
    return config;
  },
};

export default nextConfig;
