import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove turbopack lockfile warning by setting explicit root
  // This resolves the multiple lockfile detection issue in CI
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
