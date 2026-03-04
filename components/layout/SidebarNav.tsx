"use client";

/**
 * SidebarNav
 * ==========
 * Client Component — needs `usePathname()` for active link highlighting.
 * Exports two pieces:
 *   • DesktopNav  — rendered inside the <aside> in layout.tsx
 *   • MobileNav   — renders the hamburger trigger + slide-in sheet drawer
 *
 * Uses Lucide React icons (consistent with the rest of the UI).
 * Active state: exact match for /dashboard, prefix match for everything else.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ScanSearch,
  History,
  CreditCard,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "New Analysis", icon: ScanSearch },
  { href: "/history", label: "History", icon: History },
  { href: "/credits", label: "Credits", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Returns true if this nav item should be highlighted for the current pathname. */
function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

// ---------------------------------------------------------------------------
// Single nav link
// ---------------------------------------------------------------------------

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Desktop nav — used inside the <aside> in layout.tsx
// ---------------------------------------------------------------------------

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 p-3">
      {NAV_ITEMS.map(({ href, label, icon }) => (
        <NavLink
          key={href}
          href={href}
          label={label}
          icon={icon}
          active={isActive(href, pathname)}
        />
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Mobile nav — hamburger button + slide-in sheet drawer
// ---------------------------------------------------------------------------

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the sheet whenever the route changes (user navigated)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll while the drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar shadow-2xl transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-5">
          <span className="text-sm font-semibold text-sidebar-foreground">
            Navigation
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="space-y-0.5 p-3">
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={isActive(href, pathname)}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
