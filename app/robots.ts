import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/analyze",
          "/history",
          "/credits",
          "/settings",
          "/api/",
        ],
      },
    ],
    sitemap: "https://regumatrix.eu/sitemap.xml",
    host: "https://regumatrix.eu",
  };
}
