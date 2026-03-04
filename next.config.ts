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
        // Match bare /clerk-proxy (no trailing path) — needed for Clerk's validation check.
        source: "/clerk-proxy",
        destination: "https://clerk.regumatrix.eu",
      },
      {
        // Proxy all Clerk frontend-API calls through our own domain.
        // The browser only ever calls regumatrix.eu/clerk-proxy/... — never clerk.regumatrix.eu.
        source: "/clerk-proxy/:path*",
        destination: "https://clerk.regumatrix.eu/:path*",
      },
    ];
  },
};

export default nextConfig;
