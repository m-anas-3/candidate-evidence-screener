import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas", "deepagents"],
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
