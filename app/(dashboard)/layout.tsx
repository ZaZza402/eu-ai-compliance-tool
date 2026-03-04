import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Scale } from "lucide-react";
import { DesktopNav, MobileNav } from "@/components/layout/SidebarNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Dashboard layout — wraps all authenticated app pages.
 * Server Component: verifies auth before rendering anything.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* Sidebar                                                              */}
      {/* ------------------------------------------------------------------ */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        {/* Logo area */}
        <div className="flex h-14 items-center border-b border-sidebar-border px-5">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-sidebar-foreground"
          >
            <Scale className="h-4 w-4 shrink-0" />
            <span className="text-sm">EU AI Act</span>
          </Link>
        </div>

        {/* Navigation — Client Component so usePathname() works for active state */}
        <DesktopNav />

        {/* User area */}
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex justify-end">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.firstName ?? user.emailAddresses[0]?.emailAddress}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile topbar (visible on <lg)                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <div className="flex items-center gap-3">
          {/* Hamburger — opens the slide-in drawer */}
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Scale className="h-4 w-4 shrink-0" />
            <span className="text-sm">EU AI Act</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pt-14 lg:pt-0">
        <div className="mx-auto max-w-5xl p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
