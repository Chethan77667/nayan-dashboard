import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  // Allow dev HMR when opening the app via LAN IP (not only localhost)
  allowedDevOrigins: [
    "192.168.56.1",
    "192.168.*.*",
    "10.*.*.*",
  ],
};

export default nextConfig;
