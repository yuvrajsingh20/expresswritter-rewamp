import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
    FIX: In Next.js 16, 'turbopack' MUST be at the top level, 
    NOT inside 'experimental'. This resolves the "Unrecognized key" error.
  */
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Other experimental features can go here, but NOT turbopack
  },

  // Fallback for webpack (used in 'next build' and if --webpack flag is used)
  webpack: (config) => {
    config.externals = [...(config.externals || []), "@prisma/client", ".prisma/client"];
    return config;
  },
};

export default nextConfig;
