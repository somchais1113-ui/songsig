import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cse/connectors", "@cse/core", "@cse/ai"]
};

export default nextConfig;
