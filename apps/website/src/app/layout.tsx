import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { MotionBackground } from "../components/gofunmotion/MotionBackground";
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";
import { buildSeoMetadata } from "../lib/seo";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = buildSeoMetadata({
  title: "GoFunMotion - Find Fun Things To Do Today",
  description:
    "Discover local activities, last-minute deals, date ideas, family fun, and spontaneous plans based on your mood, time, budget, and city.",
  image: "/og/gofunmotion-og.svg",
  keywords: [
    "things to do today",
    "fun things to do near me",
    "local activity deals",
    "date night ideas",
    "family activities",
    "last minute deals",
    "activity finder",
    "weekend plans",
    "local experiences",
    "fun finder"
  ],
  path: "/"
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
        <MotionBackground />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
