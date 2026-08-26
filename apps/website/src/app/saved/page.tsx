import type { Metadata } from "next";
import { ProfileDashboard } from "../../components/profile/profile-dashboard";
import { buildSeoMetadata } from "../../lib/seo";
export const metadata: Metadata = buildSeoMetadata({ title: "Saved Deals And Plans | GoFunMotion", description: "Your saved local deals and plans.", noIndex: true, path: "/saved" });
export default function SavedPage() {
  return <main className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10"><h1 className="text-3xl font-bold">Saved deals and plans</h1><ProfileDashboard /></main>;
}
