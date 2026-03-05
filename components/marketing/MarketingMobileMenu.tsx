"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

interface NavLinkItem {
  href: string;
  label: string;
  external?: boolean;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: "/articles", label: "Articles" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/feedback", label: "Feedback" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  {
    href: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689",
    label: "Official Text ↗",
    external: true,
  },
];

/**
 * Mobile navigation for marketing pages.
 *
 * The backdrop and drawer are rendered via createPortal into document.body,
 * escaping the header's backdrop-filter stacking context. Without this, the
 * header's backdrop-blur traps fixed descendants making the drawer appear
 * transparent / mis-positioned.
 *
 * Visible only on < md screens.
 */
export function MarketingMobileMenu() {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Portal target is only available after first client render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = (
    <>
      {/* Backdrop — z-50 */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Slide-in drawer — z-[51] sits above backdrop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 right-0 z-[51] flex w-72 flex-col border-l border-border bg-background shadow-2xl transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV_LINKS.map(({ href, label, external }) =>
            external ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {label}
              </Link>
            ),
          )}
        </nav>

        {/* Auth — pinned to bottom */}
        <div className="mt-auto border-t border-border p-4 pb-8">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="mb-2 block rounded-md px-3 py-2.5 text-center text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="md:hidden">
      {/* Hamburger trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Portal: renders outside the header's stacking context */}
      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
