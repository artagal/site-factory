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
        <p>GoFunMotion uses local browser storage so the challenge loop works before login. When Firebase is configured and you sign in, saved challenges, completed challenges, XP, streaks, badges, and profile details can sync to your account.</p>
        <p>The site stores lightweight validation events such as challenge generated, saved, shared, completed, login clicked, and waitlist submitted. These events are used to understand whether the product loop works.</p>
        <p>You can update your display name, sign out, send email verification for email/password accounts, and delete your account from profile settings.</p>
        <p>Do not submit sensitive personal information in challenge reflections. GoFunMotion challenges are optional and should stay safe, legal, respectful, and appropriate for your situation.</p>
      </div>
    </main>
  );
}
