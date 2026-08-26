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
        <p>GoFunMotion Deals lets you browse activities without an account. Account features use your sign-in details, saved plans and listings, preferences, booking requests, and partner application information. Firebase provides authentication and data storage.</p>
        <h2 className="mt-3 text-xl font-semibold text-white">Optional AI assistance</h2>
        <p>AI search, planning, writing, and support use OpenAI. In the mobile app, AI is off until you enable it for that screen. Your request and relevant deal details are sent to OpenAI when you use an enabled assistant. Turn the toggle off to use standard matching and help. Do not include passwords, payment details, health information, or other sensitive data.</p>
        <p>We request that AI responses are not stored as retrievable response objects. This is not a promise of zero provider retention; OpenAI may process and retain data under its applicable API terms and policies. We record feature usage, token counts, and error categories for limits and reliability, without recording prompt text in our AI usage logs.</p>
        <p>AI drafts are suggestions. They do not confirm availability, send booking requests, publish listings, or make payments. You review and submit those actions yourself. Plans you choose to save are stored in your account.</p>
        <h2 className="mt-3 text-xl font-semibold text-white">Bookings and notifications</h2>
        <p>A booking request shares the contact details, party size, date, and message you submit with the relevant business. Email and optional device notifications may keep you informed about request status. A request is not a confirmed booking or payment.</p>
        <p>The site may store lightweight validation events such as plan generated, listing viewed, listing saved, booking request started, partner application submitted, login clicked, and waitlist submitted.</p>
        <p>GoFunMotion is a discovery platform. Local businesses and partners are responsible for fulfilling activities, honoring their policies, and handling any direct customer communication.</p>
        <h2 className="mt-3 text-xl font-semibold text-white">Your choices</h2>
        <p>You can browse without signing in, leave AI disabled, and manage your saved items from your account. For privacy questions or an account/data deletion request, contact <a className="text-lime-200 underline" href="mailto:hello@gofunmotion.com">hello@gofunmotion.com</a>. We may need to verify your account before acting on a request.</p>
      </div>
    </main>
  );
}
