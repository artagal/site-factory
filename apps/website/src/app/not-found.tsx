import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral">
        Not found
      </p>
      <h1 className="mt-3 text-4xl font-black text-ink">This preview is not in the factory yet.</h1>
      <p className="mt-4 text-lg leading-8 text-ink/70">
        Check the local preview index for the pages currently wired into Site Factory.
      </p>
      <Link
        href="/previews"
        className="mt-8 inline-flex rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white"
      >
        Open previews
      </Link>
    </main>
  );
}
