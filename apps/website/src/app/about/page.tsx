import type { Metadata } from "next";
import { LinkButton } from "../../components/gofunmotion/Button";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "About GoFunMotion",
  description:
    "GoFunMotion is a lifestyle movement brand using AI-powered real-life challenges to help people stop doomscrolling and start living.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Mission</p>
      <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
        Your couch is comfortable. Your life is outside.
      </h1>
      <div className="mt-8 grid gap-5 text-lg leading-8 text-white/68">
        <p>
          GoFunMotion exists because boredom should not automatically become scrolling. The product gives people tiny real-life missions that are safe, fun, social, active, and easy to start.
        </p>
        <p>
          It is not about shame. It is about momentum. A two-minute mission can become a walk, a conversation, a date idea, a creative spark, or a better night.
        </p>
        <p>
          Today GoFunMotion is a website and web app. The architecture is prepared for Firebase, mobile apps, AI generation, premium challenge packs, groups, and creator modes later.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/challenge">Generate a mission</LinkButton>
        <LinkButton href="/waitlist" variant="ghost">Join app waitlist</LinkButton>
      </div>
    </main>
  );
}
