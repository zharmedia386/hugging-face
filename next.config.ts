import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for slim Docker images. Next.js copies a minimal
  // node_modules subset into .next/standalone, runnable with `node server.js`.
  output: "standalone",
};

export default nextConfig;
