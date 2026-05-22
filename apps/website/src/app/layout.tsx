import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "../components/site-header";
import { buildSeoMetadata } from "../lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Site Factory Dashboard",
  description:
    "A local dashboard for previewing landing pages, SEO drafts, AI model portfolio pages, and WordPress-ready content.",
  path: "/"
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
