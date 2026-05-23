import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BlogCard({
  description,
  slug,
  title
}: {
  description: string;
  slug: string;
  title: string;
}) {
  return (
    <Link className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.09]" href={`/blog/${slug}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Ideas</p>
      <h3 className="mt-3 text-2xl font-black leading-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/58">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-lime-300">
        Read article <ArrowRight aria-hidden="true" size={17} />
      </span>
    </Link>
  );
}
