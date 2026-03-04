import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "*.clerk.accounts.dev" },
    ],
  },
  async rewrites() {
    return [
      {
        // Forward /clerk-proxy/* directly to Clerk's API server.
        // The browser only ever calls regumatrix.eu — never clerk.regumatrix.eu.
        source: "/clerk-proxy/:path*",
        destination: "https://frontend-api.clerk.services/:path*",
      },
    ];
  },
};

export default nextConfig;
