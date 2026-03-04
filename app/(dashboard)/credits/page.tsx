import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PayPalButton } from "@/components/credits/PayPalButton";
import { SuccessBanner } from "@/components/credits/SuccessBanner";

export const metadata: Metadata = { title: "Credits" };

const PACKS = [
  {
    name: "Starter",
    price: 9,
    credits: 10,
    popular: false,
    tagline: "Perfect for exploring compliance posture on a few AI systems.",
    perCredit: "$0.90",
  },
  {
    name: "Growth",
    price: 29,
    credits: 40,
    popular: true,
    tagline: "Great for teams reviewing multiple EU deployments. Save 19%.",
    perCredit: "$0.73",
  },
  {
    name: "Pro",
    price: 79,
    credits: 120,
    popular: false,
    tagline: "Organisation-wide reviews. Best value at $0.66 per analysis.",
    perCredit: "$0.66",
  },
];

const CREDIT_EVENT_LABELS: Record<string, string> = {
  signup: "Welcome bonus",
  purchase: "Credit purchase",
  usage: "Analysis",
};

interface PageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function CreditsPage({ searchParams }: PageProps) {
  const user = await currentUser();
  if (!user) return null;

  const params = await searchParams;

  const [dbUser, transactions, creditEvents] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    }),
    db.transaction.findMany({
      where: { userId: user.id, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        packName: true,
        creditsPurchased: true,
        amountUsd: true,
        createdAt: true,
      },
    }),
    db.creditEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        type: true,
        amount: true,
        createdAt: true,
      },
    }),
  ]);

  const credits = dbUser?.credits ?? 3;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
        <p className="mt-1 text-muted-foreground">
          Purchase credit packs to run compliance analyses.
        </p>
      </div>

      {/* Payment success banner */}
      {params.success && <SuccessBanner credits={params.success} />}

      {/* Balance */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Current balance</p>
        <p className="mt-1 text-5xl font-bold">{credits}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {credits === 1
            ? "1 analysis remaining"
            : `${credits} analyses remaining`}
        </p>
      </div>

      {/* Credit packs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Buy credits</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PACKS.map((pack) => (
            <div
              key={pack.name}
              className={`relative rounded-xl border p-5 shadow-sm ${
                pack.popular
                  ? "border-primary ring-1 ring-primary"
                  : "border-border"
              } bg-card`}
            >
              {pack.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                  Most popular
                </div>
              )}
              <h3 className="font-semibold">{pack.name}</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold">${pack.price}</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {pack.credits} credits · {pack.perCredit} each
              </p>
              {/* Value proposition */}
              <p className="mt-2 text-xs text-muted-foreground">
                {pack.tagline}
              </p>
              <PayPalButton
                packKey={
                  pack.name.toLowerCase() as "starter" | "growth" | "pro"
                }
              />
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Payments processed securely by PayPal. Credits added instantly. Never
          expire.
        </p>
      </div>

      {/* Usage history (CreditEvent ledger) */}
      {creditEvents.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Usage history</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Credits
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {creditEvents.map((ev: (typeof creditEvents)[number]) => (
                  <tr key={ev.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      {CREDIT_EVENT_LABELS[ev.type] ?? ev.type}
                    </td>
                    <td
                      className={`px-4 py-3 font-mono font-medium ${
                        ev.amount > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {ev.amount > 0 ? `+${ev.amount}` : ev.amount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(ev.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase history */}
      {transactions.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Purchase history</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Pack
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Credits
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx: (typeof transactions)[number]) => (
                  <tr key={tx.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{tx.packName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      +{tx.creditsPurchased}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      ${tx.amountUsd.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
