import type { Metadata } from "next";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Terms of Use | GoFunMotion",
  description: "GoFunMotion terms of use for safe, legal, respectful real-life challenges and prototype website usage.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20">
      <h1 className="text-5xl font-black text-white md:text-7xl">Terms of Use</h1>
      <div className="mt-8 grid gap-5 text-base leading-7 text-white/68">
        <p>GoFunMotion challenges are optional suggestions. Use judgment and skip anything that is unsafe, illegal, disrespectful, or unsuitable for your body, location, or situation.</p>
        <p>The current site is a prototype web service. It does not provide medical, mental health, legal, fitness, or safety advice.</p>
        <p>Future premium, mobile, account, and payment features should be governed by updated terms before launch.</p>
      </div>
    </main>
  );
}
