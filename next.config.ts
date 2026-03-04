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
        // Proxy all Clerk frontend-API calls through our own domain.
        // This means the browser never needs to resolve clerk.regumatrix.eu —
        // all traffic goes to regumatrix.eu/clerk-proxy/... instead.
        source: "/clerk-proxy/:path*",
        destination: "https://clerk.regumatrix.eu/:path*",
      },
    ];
  },
};

export default nextConfig;
