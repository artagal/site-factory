import type { Metadata } from "next";
import { ProfileSettings } from "../../../components/gofunmotion/ProfileSettings";
import { buildSeoMetadata } from "../../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Profile Settings | GoFunMotion",
  description: "Update your GoFunMotion profile, sync Firebase progress, and sign out.",
  path: "/profile/settings"
});

export default function ProfileSettingsPage() {
  return (
    <main>
      <ProfileSettings />
    </main>
  );
}
