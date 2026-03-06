import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";

export const metadata: Metadata = { title: "Settings" };

/**
 * Settings page — must live in a catch-all route so Clerk's <UserProfile />
 * can push its own nested paths (profile, security, etc.) without 404s.
 * Route: /settings  AND  /settings/*
 */
export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, profile, and security settings.
        </p>
      </div>

      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "rounded-xl border border-border shadow-sm",
          },
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Danger zone                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="mb-1 text-base font-semibold text-destructive">
          Danger zone
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Permanently delete your account and all associated data — analyses,
          history, credits, and billing records. This action cannot be undone.
          Financial transaction records are retained for 7 years as required by
          law; all other data is deleted immediately.
        </p>
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <span className="mt-0.5 text-amber-500">⚠</span>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Save your reports first.</span> All
            your compliance analyses will be wiped permanently. Download any PDF
            reports you want to keep before proceeding.
          </p>
        </div>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
