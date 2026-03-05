import type { MetadataRoute } from "next";

const BASE = "https://regumatrix.eu";

// Article numbers 1-113
const ARTICLE_NUMS = Array.from({ length: 113 }, (_, i) => String(i + 1));

// Annex IDs (must match keys in article_lookup.json and the [id] route)
const ANNEX_IDS = [
  "Annex_I",
  "Annex_II",
  "Annex_III",
  "Annex_IV",
  "Annex_V",
  "Annex_VI",
  "Annex_VII",
  "Annex_VIII",
  "Annex_IX",
  "Annex_X",
  "Annex_XI",
  "Annex_XII",
  "Annex_XIII",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    {
      url: `${BASE}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE}/articles`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/compliance/healthcare-ai`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compliance/hr-recruitment`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compliance/financial-services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compliance/high-risk-checklist`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compliance/gpai`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // One page per article (1-113)
  const articlePages: MetadataRoute.Sitemap = ARTICLE_NUMS.map((num) => ({
    url: `${BASE}/articles/${num}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  // One page per annex
  const annexPages: MetadataRoute.Sitemap = ANNEX_IDS.map((id) => ({
    url: `${BASE}/articles/${id}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages, ...annexPages];
}
