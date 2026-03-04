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
    default: "Regumatrix",
    template: "%s | Regumatrix",
  },
  description:
    "AI-powered EU AI Act compliance checker grounded in the full Regulation EU 2024/1689. Understand your risk classification, obligations, and required actions in minutes.",
  keywords: [
    "EU AI Act",
    "AI compliance",
    "Regumatrix",
    "GPAI",
    "high-risk AI",
    "AI regulation",
    "AIA",
    "regumatrix.eu",
  ],
  authors: [{ name: "Regumatrix" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    title: "Regumatrix — EU AI Act Compliance Checker",
    description:
      "AI-powered compliance checker grounded in the full EU AI Act (Regulation EU 2024/1689).",
    siteName: "Regumatrix",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider proxyUrl={`${process.env.NEXT_PUBLIC_APP_URL}/clerk-proxy`}>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="min-h-screen overflow-x-hidden bg-background font-sans antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
