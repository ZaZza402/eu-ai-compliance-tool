import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import { DesktopNav, MobileNav } from "@/components/layout/SidebarNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { db } from "@/lib/db";

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

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { credits: true },
  });
  const credits = dbUser?.credits ?? 0;

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
            <Image
              src="/regumatrix-logo-vector.svg"
              alt=""
              width={22}
              height={22}
              className="dark:invert"
              unoptimized
              priority
              aria-hidden
            />
            <span className="text-sm">Regumatrix</span>
          </Link>
        </div>

        {/* Navigation — Client Component so usePathname() works for active state */}
        <DesktopNav />

        {/* Credits badge */}
        <div className="mx-3 mb-2">
          <Link
            href="/credits"
            className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Credits
            </span>
            <span
              className={
                credits <= 2
                  ? "font-bold text-amber-800 dark:text-amber-400"
                  : "font-bold text-foreground"
              }
            >
              {credits}
            </span>
          </Link>
        </div>

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
            <Image
              src="/regumatrix-logo-vector.svg"
              alt=""
              width={22}
              height={22}
              className="dark:invert"
              unoptimized
              priority
              aria-hidden
            />
            <span className="text-sm">Regumatrix</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/credits"
            className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
          >
            <Zap className="h-3 w-3" />
            <span
              className={
                credits <= 2
                  ? "text-amber-800 dark:text-amber-400"
                  : "text-foreground"
              }
            >
              {credits}
            </span>
          </Link>
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
