import type { Metadata } from "next";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Sign In | GoFunMotion Deals",
  description:
    "Sign in to GoFunMotion Deals to save local activity plans, send booking requests, manage profile preferences, and use partner tools.",
  noIndex: true,
  path: "/login"
});

export default function LoginLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
