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
        source: "/clerk-proxy/:path*",
        destination: "https://frontend-api.clerk.services/:path*",
      },
    ];
  },
};

export default nextConfig;
