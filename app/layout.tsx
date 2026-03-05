import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const BASE_URL = "https://regumatrix.eu";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Regumatrix — EU AI Act Compliance Checker",
    template: "%s | Regumatrix",
  },
  description:
    "Instantly check your EU AI Act compliance. Get article-grounded risk classification, mandatory obligations, and key actions for your AI system — free on sign-up. Grounded in the full 113-article corpus of Regulation EU 2024/1689.",
  keywords: [
    "EU AI Act",
    "AI compliance checker",
    "Regumatrix",
    "EU AI regulation",
    "GPAI compliance",
    "high-risk AI obligations",
    "AI Act Article 6",
    "AI Act prohibited practices",
    "Regulation EU 2024/1689",
    "AI governance",
    "EU AI Act checklist",
    "AI system risk classification",
  ],
  authors: [{ name: "Regumatrix", url: BASE_URL }],
  creator: "Regumatrix",
  publisher: "Regumatrix",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: BASE_URL,
    title: "Regumatrix — EU AI Act Compliance Checker",
    description:
      "Describe your AI system, get an instant article-grounded compliance report: risk tier, role, obligations, and required actions — free on sign-up.",
    siteName: "Regumatrix",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Regumatrix — EU AI Act Compliance Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Regumatrix — EU AI Act Compliance Checker",
    description:
      "Instant EU AI Act compliance check. Risk tier, obligations, key actions — article-grounded and free on sign-up.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification token here once you have it
    // google: "your-google-verification-token",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// JSON-LD structured data for the SoftwareApplication
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Regumatrix",
  url: BASE_URL,
  description:
    "EU AI Act compliance checker. Grounded in the full 113-article corpus of Regulation EU 2024/1689. Get risk classification, operator role, obligations, and required actions for your AI system.",
  applicationCategory: "LegalTech",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description:
      "3 free compliance analyses on sign-up. No credit card required.",
  },
  featureList: [
    "EU AI Act risk classification",
    "Article-grounded compliance reports",
    "113-article corpus coverage",
    "PDF export",
    "Analysis history",
  ],
  screenshot: `${BASE_URL}/og-image.png`,
  author: {
    "@type": "Organization",
    name: "Regumatrix",
    url: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <head>
          {/* PWA / mobile */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Regumatrix" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          {/* JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="min-h-screen overflow-x-hidden bg-background font-sans antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
