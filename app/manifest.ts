import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Regumatrix — EU AI Act Compliance",
    short_name: "Regumatrix",
    description:
      "Instantly check your EU AI Act compliance. Risk classification, obligations, and key actions grounded in Regulation EU 2024/1689.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "legal"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "New Analysis",
        short_name: "Analyse",
        description: "Run a new EU AI Act compliance analysis",
        url: "/analyze",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
