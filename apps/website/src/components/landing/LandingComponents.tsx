import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type Tone = "brass" | "coral" | "mint" | "skyline";

type Action = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type LandingHeroProps = {
  actions?: Action[];
  aside?: ReactNode;
  eyebrow: string;
  summary: string;
  title: string;
  tone?: Tone;
};

type FeatureItem = {
  icon?: LucideIcon;
  text: string;
  title: string;
};

type SectionHeaderProps = {
  eyebrow?: string;
  summary?: string;
  title: string;
  tone?: Tone;
};

const toneClasses: Record<Tone, { accent: string; bg: string; text: string }> = {
  brass: {
    accent: "text-brass",
    bg: "bg-brass/10",
    text: "text-brass"
  },
  coral: {
    accent: "text-coral",
    bg: "bg-coral/10",
    text: "text-coral"
  },
  mint: {
    accent: "text-mint",
    bg: "bg-mint/10",
    text: "text-mint"
  },
  skyline: {
    accent: "text-skyline",
    bg: "bg-skyline/10",
    text: "text-skyline"
  }
};

function actionClassName(variant: Action["variant"] = "primary") {
  if (variant === "secondary") {
    return "inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink";
  }

  return "inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white shadow-soft";
}

export function LandingHero({
  actions = [],
  aside,
  eyebrow,
  summary,
  title,
  tone = "mint"
}: LandingHeroProps) {
  return (
    <section className="border-b border-ink/10 bg-paper">
      <div className="mx-auto grid min-h-[540px] max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.06fr_0.94fr] md:px-8 md:py-16">
        <div className="flex flex-col justify-center">
          <p className={`mb-4 text-sm font-bold uppercase tracking-[0.16em] ${toneClasses[tone].accent}`}>
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.01] text-ink md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">{summary}</p>
          {actions.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link key={action.href + action.label} href={action.href} className={actionClassName(action.variant)}>
                  {action.label}
                  {action.variant !== "secondary" ? <ArrowRight aria-hidden="true" size={18} /> : null}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        {aside ? <div className="flex items-center">{aside}</div> : null}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  summary,
  title,
  tone = "mint"
}: SectionHeaderProps) {
  return (
    <div className="mb-6 max-w-3xl">
      {eyebrow ? (
        <p className={`text-sm font-bold uppercase tracking-[0.16em] ${toneClasses[tone].accent}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">{title}</h2>
      {summary ? <p className="mt-3 text-base leading-7 text-ink/68">{summary}</p> : null}
    </div>
  );
}

export function FeatureGrid({
  items,
  tone = "mint"
}: {
  items: FeatureItem[];
  tone?: Tone;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon ?? CheckCircle2;

        return (
          <article key={item.title} className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div className={`mb-4 flex size-11 items-center justify-center rounded-lg ${toneClasses[tone].bg} ${toneClasses[tone].text}`}>
              <Icon aria-hidden="true" size={22} />
            </div>
            <h3 className="text-lg font-black text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/68">{item.text}</p>
          </article>
        );
      })}
    </div>
  );
}

export function MetricStrip({
  items
}: {
  items: Array<{
    label: string;
    value: string;
  }>;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="border-ink/10 py-2 sm:border-r sm:px-3 sm:last:border-r-0">
          <p className="text-2xl font-black text-ink">{item.value}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-ink/54">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ProcessStrip({
  steps,
  tone = "skyline"
}: {
  steps: Array<{
    text: string;
    title: string;
  }>;
  tone?: Tone;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => (
        <article key={step.title} className="rounded-lg border border-ink/10 bg-white p-5">
          <div className={`mb-4 flex size-9 items-center justify-center rounded-lg ${toneClasses[tone].bg} text-sm font-black ${toneClasses[tone].text}`}>
            {index + 1}
          </div>
          <h3 className="font-black text-ink">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/68">{step.text}</p>
        </article>
      ))}
    </div>
  );
}

export function InsightPanel({
  items,
  title,
  tone = "brass"
}: {
  items: string[];
  title: string;
  tone?: Tone;
}) {
  return (
    <aside className="w-full rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <p className={`text-sm font-bold uppercase tracking-[0.16em] ${toneClasses[tone].accent}`}>
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-ink/70">
            <CheckCircle2 aria-hidden="true" className={`mt-0.5 shrink-0 ${toneClasses[tone].text}`} size={18} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
