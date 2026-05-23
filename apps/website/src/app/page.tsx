import type { Metadata } from "next";
import { Brain, Flame, Map, ShieldCheck, Smartphone, Trophy, Users, Zap } from "lucide-react";
import { BlogCard } from "../components/gofunmotion/BlogCard";
import { CategoryCard } from "../components/gofunmotion/CategoryCard";
import { ChallengeGenerator } from "../components/gofunmotion/ChallengeGenerator";
import { DailyChallengeCard } from "../components/gofunmotion/DailyChallenge";
import { Hero } from "../components/gofunmotion/Hero";
import { HowItWorks } from "../components/gofunmotion/HowItWorks";
import { LeaderboardPreview } from "../components/gofunmotion/Leaderboard";
import { LinkButton } from "../components/gofunmotion/Button";
import { WaitlistForm } from "../components/gofunmotion/WaitlistForm";
import { blogPosts } from "../lib/blog";
import { challengeCategories } from "../lib/challenges";
import { buildSeoMetadata, createFaqSchema, createSchemaGraph, createWebPageSchema } from "../lib/seo";
import { SeoJsonLd } from "../components/seo-json-ld";

export const metadata: Metadata = buildSeoMetadata({
  title: "GoFunMotion - AI Real-Life Challenges That Get You Moving",
  description:
    "Replace scrolling with real life. Generate fun AI-powered challenges for movement, confidence, social connection, city exploration, couples, friends, and anti-doomscrolling.",
  image: "/og/gofunmotion-og.svg",
  keywords: [
    "real life challenges",
    "anti doomscrolling",
    "fun things to do",
    "AI challenge generator",
    "social challenges",
    "confidence challenges",
    "movement challenges",
    "bored ideas",
    "things to do instead of scrolling"
  ],
  path: "/"
});

const whyCards = [
  { icon: Zap, title: "Break the boredom loop", text: "When your brain says scroll, GoFunMotion says move." },
  { icon: Flame, title: "Build real momentum", text: "One tiny challenge can change the whole mood of your day." },
  { icon: Users, title: "Create connection", text: "Small social prompts help lonely moments turn into contact." },
  { icon: Map, title: "Discover your city", text: "Make familiar streets feel like a playable world." },
  { icon: Brain, title: "Reset your attention", text: "Step out of the feed and back into your senses." },
  { icon: Trophy, title: "Earn XP for life", text: "Streaks, badges, and levels make real-world action rewarding." }
];

const communityMoments = [
  "I opened it because I was bored. 20 minutes later I was outside watching the sunset.",
  "This turned a random Friday night into an adventure.",
  "It feels like Duolingo for real life."
];

export default function HomePage() {
  const schema = createSchemaGraph([
    createWebPageSchema({
      description:
        "GoFunMotion is an AI-powered real-life challenges platform that helps people replace scrolling with movement, confidence, connection, and adventure.",
      path: "/",
      title: "GoFunMotion"
    }),
    createFaqSchema([
      {
        question: "Do I need an app to use GoFunMotion?",
        answer: "No. GoFunMotion works in the browser now. The iOS and Android app is planned for later."
      },
      {
        question: "Does the challenge generator require signup?",
        answer: "No. You can generate challenges immediately. Accounts and Firebase can be connected later for saved progress."
      }
    ])
  ]);

  return (
    <main>
      <SeoJsonLd data={schema} id="gofunmotion-home-schema" />
      <Hero />
      <ChallengeGenerator />

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-300">Built for real-life momentum</p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
            Not another habit tracker. Not another feed.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/62">
            GoFunMotion is a tiny push toward movement, courage, connection, and adventure.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {whyCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl" key={card.title}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-black">
                  <Icon aria-hidden="true" size={23} />
                </div>
                <h3 className="mt-5 text-2xl font-black text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{card.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Challenge modes</p>
            <h2 className="mt-3 text-4xl font-black text-white md:text-6xl">Pick the kind of life you want today</h2>
          </div>
          <LinkButton href="/categories" variant="ghost">All categories</LinkButton>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {challengeCategories.slice(0, 6).map((category) => (
            <CategoryCard category={category} key={category} />
          ))}
        </div>
      </section>

      <HowItWorks />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <DailyChallengeCard />
        <LeaderboardPreview />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Gamification</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
              Make real life feel playable.
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/62">
              XP, streaks, badges, challenge history, and personal momentum scores are already structured locally, with Firebase-ready architecture for the full app.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["First Step", "Touch Grass", "Social Spark", "Explorer", "No Scroll Hero", "Courage Mode"].map((badge) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white" key={badge}>
                <ShieldCheck aria-hidden="true" className="text-lime-300" size={20} />
                <p className="mt-3 font-black">{badge}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {communityMoments.map((quote) => (
            <figure className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl" key={quote}>
              <blockquote className="text-xl font-black leading-tight text-white">&quot;{quote}&quot;</blockquote>
              <figcaption className="mt-4 text-sm font-bold text-white/42">Early community story</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
            <Smartphone aria-hidden="true" className="text-cyan-300" size={34} />
            <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              GoFunMotion is coming to iOS and Android.
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/62">
              Daily streaks, friend challenges, location-based adventures, an AI coach, real-life quests, and social leaderboards are planned next.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(247,37,133,0.16),rgba(124,58,237,0.16),rgba(190,242,100,0.08))] p-6 backdrop-blur-2xl md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">Premium coming soon</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
            Future packs for couples, friends, city adventures, creators, and AI coaching.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Unlimited AI challenges",
              "Advanced challenge packs",
              "Couples and friends mode",
              "City adventure mode",
              "Streak protection",
              "AI personal coach",
              "Private groups",
              "Creator packs"
            ].map((feature) => (
              <div className="rounded-2xl bg-black/24 p-4 text-sm font-black text-white/78" key={feature}>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-300">SEO idea engine</p>
            <h2 className="mt-3 text-4xl font-black text-white md:text-6xl">Read before you scroll again</h2>
          </div>
          <LinkButton href="/blog" variant="ghost">Open blog</LinkButton>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {blogPosts.slice(0, 3).map((post) => (
            <BlogCard {...post} key={post.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
