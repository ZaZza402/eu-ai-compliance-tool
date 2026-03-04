"use client";

import { useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "We were building a CV screening tool and genuinely had no idea whether it triggered Annex III. One analysis gave us a clear answer — with the exact article references. Saved us at least a week of reading.",
    name: "Miriam K.",
    role: "Co-founder, HR-Tech startup",
  },
  {
    quote:
      "We run this before every formal compliance review. It surfaces the right articles immediately and gives our legal team a structured starting point. The penalty exposure section alone is worth it.",
    name: "Thomas R.",
    role: "In-house Counsel, FinTech scale-up",
  },
  {
    quote:
      "I ship AI products. I'm not a lawyer. This is the first tool that explained what I'm actually obligated to do — not a vague checklist, but real article citations tied to my specific system.",
    name: "Sofía M.",
    role: "Independent founder, SaaS",
  },
] as const;

/**
 * Testimonials section with IntersectionObserver-triggered scroll animation.
 * Cards stagger in as the section enters the viewport.
 * No avatars — typography and restraint do the visual work.
 */
export function TestimonialsSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-y border-border/40 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section label */}
        <p className="mb-16 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          What people are saying
        </p>

        {/* Grid */}
        <div
          ref={sectionRef}
          className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TESTIMONIALS.map(({ quote, name, role }, i) => (
            <figure
              key={name}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.65s ease ${i * 160}ms, transform 0.65s ease ${i * 160}ms`,
              }}
            >
              {/* Decorative quotation mark */}
              <span
                aria-hidden="true"
                className="mb-5 block font-serif text-[3.5rem] leading-none text-foreground/10 select-none"
              >
                &ldquo;
              </span>

              {/* Quote body */}
              <blockquote className="text-[0.9375rem] leading-[1.85] tracking-[-0.01em] text-foreground">
                {quote}
              </blockquote>

              {/* Attribution */}
              <figcaption className="mt-7">
                <div className="mb-4 h-px w-8 bg-border" />
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
