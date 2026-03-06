import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Regumatrix — EU AI Act Compliance",
    short_name: "Regumatrix",
    description:
      "Instant EU AI Act compliance check grounded in the full 113-article corpus of Regulation EU 2024/1689.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    orientation: "portrait-primary",
    lang: "en-GB",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New Analysis",
        short_name: "Analyse",
        description: "Run a new EU AI Act compliance analysis",
        url: "/analyze",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}

