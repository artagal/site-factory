import { LoadingRows } from "../components/gofunmotion/product-states";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">GoFunMotion</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">Loading your next fun plan.</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-white/56">We are checking the latest approved deals and request-first availability.</p>
      </section>
      <div className="mt-8">
        <LoadingRows rows={4} />
      </div>
    </main>
  );
}
