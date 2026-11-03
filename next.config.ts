import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The engine rules are read from ./engine at runtime by the API routes.
  outputFileTracingIncludes: {
    "/api/converse": ["./engine/**/*", "./tools/*.json"],
    "/api/directions": ["./engine/**/*", "./tools/*.json"],
  },
};

export default nextConfig;
