import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BlogCard({
  category,
  description,
  keyword,
  readTime,
  slug,
  title
}: {
  category?: string;
  description: string;
  keyword?: string;
  readTime?: string;
  slug: string;
  title: string;
}) {
  return (
    <Link className="group rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.09]" href={`/blog/${slug}`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="rounded-full bg-cyan-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
          {category ?? "Ideas"}
        </p>
        {readTime ? (
          <p className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white/48">
            {readTime}
          </p>
        ) : null}
      </div>
      <h3 className="mt-3 text-2xl font-black leading-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/58">{description}</p>
      {keyword ? (
        <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-fuchsia-200/70">
          Target: {keyword}
        </p>
      ) : null}
      <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-black text-lime-300">
        Read and generate <ArrowRight aria-hidden="true" className="transition group-hover:translate-x-1" size={17} />
      </span>
    </Link>
  );
}
