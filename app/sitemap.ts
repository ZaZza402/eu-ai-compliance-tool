import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://regumatrix.eu";
// lastModified = date of the last meaningful content update
const LAST_UPDATED = new Date("2026-03-06");

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
  

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: LAST_UPDATED, changeFrequency: "weekly", priority: 1.0 },
    {
      url: `${BASE}/pricing`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/about`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE}/articles`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/compliance/healthcare-ai`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compliance/hr-recruitment`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compliance/financial-services`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compliance/high-risk-checklist`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compliance/gpai`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/contact`,
      lastModified: LAST_UPDATED,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE}/feedback`,
      lastModified: LAST_UPDATED,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // One page per article (1-113)
  const articlePages: MetadataRoute.Sitemap = ARTICLE_NUMS.map((num) => ({
    url: `${BASE}/articles/${num}`,
    lastModified: LAST_UPDATED,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  // One page per annex
  const annexPages: MetadataRoute.Sitemap = ANNEX_IDS.map((id) => ({
    url: `${BASE}/articles/${id}`,
    lastModified: LAST_UPDATED,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages, ...annexPages];
}
