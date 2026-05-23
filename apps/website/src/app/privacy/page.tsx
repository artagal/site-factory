import type { Metadata } from "next";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Privacy Policy | GoFunMotion",
  description: "GoFunMotion privacy policy for the website, local progress storage, Firebase-ready accounts, and waitlist data.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20">
      <h1 className="text-5xl font-black text-white md:text-7xl">Privacy Policy</h1>
      <div className="mt-8 grid gap-5 text-base leading-7 text-white/68">
        <p>GoFunMotion currently works with local browser storage for saved challenges, completed challenges, XP, streaks, and waitlist fallback entries.</p>
        <p>Firebase is prepared for future authentication, Firestore, and storage, but credentials must be configured through environment variables before live backend use.</p>
        <p>Do not submit sensitive personal information in challenge reflections. Future production versions should add full account controls, export, deletion, and analytics disclosure.</p>
      </div>
    </main>
  );
}
