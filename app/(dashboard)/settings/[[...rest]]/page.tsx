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
        <p className="mb-5 text-sm text-muted-foreground">
          Permanently delete your account and all associated data — analyses,
          history, credits, and billing records. This action cannot be undone.
          Financial transaction records are retained for 7 years as required by
          law; all other data is deleted immediately.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
