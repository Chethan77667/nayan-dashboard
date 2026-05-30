import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Less noise in dev: no HMR/Fast Refresh spam in browser or terminal
  logging:
    process.env.NODE_ENV === "development"
      ? {
          browserToTerminal: false,
          incomingRequests: false,
          serverFunctions: false,
        }
      : undefined,
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
