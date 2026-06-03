import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-lime-300">
        Not found
      </p>
      <h1 className="mt-3 text-4xl font-black text-white">This GoFunMotion page is not available.</h1>
      <p className="mt-4 text-lg leading-8 text-white/68">
        Head back to the plan finder or browse current local activity deal cards.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/find"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white"
        >
          Find My Plan
        </Link>
        <Link
          href="/deals"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white hover:bg-white/[0.11]"
        >
          Browse Deals
        </Link>
      </div>
    </main>
  );
}
