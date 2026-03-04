"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const FeedbackSchema = z.object({
  message: z
    .string()
    .min(10, "Please write at least 10 characters.")
    .max(3000, "Message can be at most 3000 characters."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .optional()
    .or(z.literal("")),
});

export type FeedbackState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const { userId } = await auth();

  const raw = {
    message: formData.get("message") as string,
    email: (formData.get("email") as string) || undefined,
  };

  const parsed = FeedbackSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await db.feedback.create({
      data: {
        message: parsed.data.message,
        email: parsed.data.email || null,
        userId: userId ?? null,
      },
    });

    // Fire-and-forget: forward to personal email via /api/contact serverless fn
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      await fetch(`${appUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: parsed.data.message,
          email: parsed.data.email,
          userId: userId ?? undefined,
        }),
      });
    } catch {
      // Silently ignore — feedback is already saved to DB
    }

    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
