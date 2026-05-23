import type { Metadata } from "next";
import { ProfileStats } from "../../components/gofunmotion/ProfileStats";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Profile | GoFunMotion",
  description:
    "View local GoFunMotion progress, XP, streaks, badges, saved challenges, and completed real-life missions.",
  path: "/profile"
});

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <ProfileStats />
    </main>
  );
}
