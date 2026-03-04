import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EU AI Act Compliance Tool",
    template: "%s | EU AI Act Compliance",
  },
  description:
    "AI-powered compliance checker grounded in the full EU AI Act (Regulation EU 2024/1689). Understand your risk classification, obligations, and required actions in minutes.",
  keywords: [
    "EU AI Act",
    "AI compliance",
    "GPAI",
    "high-risk AI",
    "AI regulation",
    "AIA",
  ],
  authors: [{ name: "EU AI Act Compliance Tool" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    title: "EU AI Act Compliance Tool",
    description:
      "AI-powered compliance checker grounded in the full EU AI Act (Regulation EU 2024/1689).",
    siteName: "EU AI Act Compliance Tool",
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
        <body className="min-h-screen overflow-x-hidden bg-background font-sans antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
