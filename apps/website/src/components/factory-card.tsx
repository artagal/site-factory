import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { FactoryPreviewPage } from "../lib/site-content";

export function FactoryCard({ page }: { page: FactoryPreviewPage }) {
  return (
    <article className="flex min-h-[280px] flex-col justify-between rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div>
        <div className="mb-5 h-24 rounded-lg border border-ink/10 bg-paper p-3">
          <div className="h-3 w-2/3 rounded-full bg-ink/18" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-10 rounded bg-mint/18" />
            <div className="h-10 rounded bg-coral/18" />
            <div className="h-10 rounded bg-skyline/18" />
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass">
          {page.templateLabel}
        </p>
        <h2 className="mt-2 text-2xl font-black text-ink">{page.name}</h2>
        <p className="mt-3 text-sm leading-6 text-ink/68">{page.summary}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={page.href}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white"
        >
          Preview
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
        {page.contentHref ? (
          <Link
            href={page.contentHref}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink"
          >
            Draft
            <FileText aria-hidden="true" size={17} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
