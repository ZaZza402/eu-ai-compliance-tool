import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MarketingMobileMenu } from "@/components/marketing/MarketingMobileMenu";
import { CookieConsentController } from "@/components/cookie/CookieConsent";

/**
 * Marketing layout — public pages (landing, pricing, docs).
 * Includes a top navigation bar.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* Top navigation                                                       */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg leading-none">⚖️</span>
            <span className="hidden sm:inline-block">Regumatrix</span>
            <span className="sm:hidden">Regumatrix</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/pricing"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/feedback"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Feedback
            </Link>
            <Link
              href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Official Text ↗
            </Link>
          </nav>

          {/* Auth actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Hidden on mobile — the hamburger drawer handles auth on small screens */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground md:inline-flex">
                  Sign in
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="hidden rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
              >
                Get Started Free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="hidden rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            {/* Hamburger — visible only on small screens */}
            <MarketingMobileMenu />
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Page content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1">{children}</main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>
            Regumatrix — Powered by{" "}
            <a
              href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Regulation (EU) 2024/1689
            </a>
          </p>
          <p className="mt-1">
            This tool is informational only and does not constitute legal
            advice.
          </p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              About
            </Link>
            <Link
              href="/feedback"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Feedback
            </Link>
            <Link
              href="/privacy"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Terms of Use
            </Link>
          </p>
        </div>
      </footer>

      {/* Cookie consent — banner on first visit, floating button thereafter */}
      <CookieConsentController />
    </div>
  );
}
