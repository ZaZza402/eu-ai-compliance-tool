"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Testimonial data ─────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      "Spent two days trying to work out whether our patient triage assistant counted as high-risk. Ran it through here on a Friday afternoon and had a proper answer — Article 6, Annex III, full penalty exposure — before I left the office.",
    name: "James Thornton",
    role: "Product Lead",
    company: "MedTech startup, Berlin",
    initials: "JT",
  },
  {
    quote:
      "Before every formal compliance review this is our first step now. It surfaces the right articles immediately and gives the legal team a structured starting point. Genuinely changed how we handle compliance prep.",
    name: "Camille Bertrand",
    role: "Head of Legal & Compliance",
    company: "FinTech scale-up, Paris",
    initials: "CB",
  },
  {
    quote:
      "I'm a developer, not a lawyer. I kept getting contradictory answers reading the regulation myself. This tool pointed me to exactly what Article 13 requires from me specifically. That's all I needed to move forward.",
    name: "Mateo Sánchez",
    role: "Founder",
    company: "B2B SaaS, Madrid",
    initials: "MS",
  },
  {
    quote:
      "We had an urgent question about our GPAI model's transparency obligations three days before a board meeting. Full breakdown in under a minute. I copy-pasted the key findings straight into the deck.",
    name: "Annika Rydberg",
    role: "Chief Compliance Officer",
    company: "AI infrastructure firm, Stockholm",
    initials: "AR",
  },
  {
    quote:
      "Enterprise clients kept asking which articles we complied with. I used to stall. Now I run this, pull the report, and send it across. It's changed how we handle the compliance part of every sales conversation.",
    name: "Luka Petrović",
    role: "CTO",
    company: "EdTech scale-up, Ljubljana",
    initials: "LP",
  },
  {
    quote:
      "I was moving a research model into production and had no idea what had changed legally since I built it. The analysis flagged three obligations I'd completely missed. Caught them before go-live.",
    name: "Priya Nair",
    role: "ML Engineer",
    company: "Independent consultant, Amsterdam",
    initials: "PN",
  },
];

const INTERVAL_MS = 4500;

// ─── Main section ─────────────────────────────────────────────────────────────

export function TestimonialsSection() {
  // Desktop grid: stagger-reveal on scroll
  const [gridVisible, setGridVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGridVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mobile carousel: auto-advance with pause-on-hover
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  // Bump this to reset the auto-advance interval without changing the index
  const [autoKey, setAutoKey] = useState(0);

  const advance = useCallback(
    () => setCurrent((c) => (c + 1) % TESTIMONIALS.length),
    [],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, advance, autoKey]);

  function goTo(idx: number) {
    setCurrent(idx);
    setAutoKey((k) => k + 1); // restart interval from now
  }

  return (
    <section className="border-y border-border/40 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Label */}
        <p className="mb-12 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          What people are saying
        </p>

        {/* ── Mobile: auto-sliding carousel ──────────────────────────────── */}
        <div
          className="lg:hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Clip window */}
          <div className="overflow-hidden">
            <div
              className="flex will-change-transform"
              style={{
                transform: `translateX(-${current * 100}%)`,
                transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="w-full shrink-0 px-1">
                  <TestimonialCard {...t} visible delay={0} />
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "h-2 w-6 bg-foreground"
                    : "h-2 w-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Desktop: static 2 × 3 grid ─────────────────────────────────── */}
        <div
          ref={gridRef}
          className="hidden gap-6 lg:grid lg:grid-cols-3"
        >
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard
              key={t.name}
              {...t}
              visible={gridVisible}
              delay={i * 90}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Shared card ──────────────────────────────────────────────────────────────

function TestimonialCard({
  quote,
  name,
  role,
  company,
  initials,
  visible,
  delay,
}: {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <figure
      className="flex h-full flex-col rounded-xl border border-border bg-card p-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {/* Stars */}
      <div className="mb-4 flex gap-0.5" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 text-amber-400"
            aria-hidden
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="flex-1 text-[0.9375rem] leading-[1.8] tracking-[-0.01em] text-foreground">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Attribution */}
      <figcaption className="mt-6 flex items-center gap-3">
        <div
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">
            {role} · {company}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
