import type { Metadata } from "next";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Privacy Policy | GoFunMotion",
  description: "GoFunMotion privacy policy for the website, accounts, saved plans, booking requests, partner applications, and waitlist data.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20">
      <h1 className="text-5xl font-black text-white md:text-7xl">Privacy Policy</h1>
      <div className="mt-8 grid gap-5 text-base leading-7 text-white/68">
        <p>GoFunMotion Deals lets visitors browse starter plan and deal experiences before signing in. Account features may store saved plans, saved listings, booking requests, preferences, partner applications, and profile details.</p>
        <p>The site may store lightweight validation events such as plan generated, listing viewed, listing saved, booking request started, partner application submitted, login clicked, and waitlist submitted.</p>
        <p>Do not submit sensitive personal information in plan finder fields, waitlist entries, partner interest forms, or future booking request messages.</p>
        <p>GoFunMotion is a discovery platform. Local businesses and partners are responsible for fulfilling activities, honoring their policies, and handling any direct customer communication.</p>
      </div>
    </main>
  );
}
