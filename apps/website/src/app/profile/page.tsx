import type { Metadata } from "next";
import { ProfileDashboard } from "../../components/profile/profile-dashboard";
import { buildSeoMetadata } from "../../lib/seo";
export const metadata: Metadata = buildSeoMetadata({ title: "Account | GoFunMotion Deals", description: "Your saved deals, plans and booking requests.", noIndex: true, path: "/profile" });
export default function ProfilePage() {
  return <main className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10"><h1 className="text-3xl font-bold">Your account</h1><ProfileDashboard /></main>;
}
