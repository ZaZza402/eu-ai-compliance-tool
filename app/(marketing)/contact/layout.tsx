import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Regumatrix",
  description:
    "Get in touch with the Regumatrix team. Report a bug, request a feature, ask about billing, or discuss a partnership — we'll respond within 5 business days.",
  openGraph: {
    title: "Contact Us | Regumatrix",
    description:
      "Get in touch with the Regumatrix team for support, billing, partnerships, or legal enquiries.",
    url: "https://regumatrix.eu/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
