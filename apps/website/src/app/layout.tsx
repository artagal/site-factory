import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProgressBridge } from "../components/gofunmotion/AuthProgressBridge";
import { Footer } from "../components/gofunmotion/Footer";
import { MobileBottomCTA } from "../components/gofunmotion/MobileBottomCTA";
import { MotionBackground } from "../components/gofunmotion/MotionBackground";
import { Navbar } from "../components/gofunmotion/Navbar";
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
  title: "GoFunMotion - Replace Scrolling With Real Life",
  description:
    "Find fun things to do instead of scrolling. GoFunMotion generates AI-powered real-life challenges for boredom, movement, confidence, and connection.",
  image: "/og/gofunmotion-og.svg",
  keywords: [
    "real life challenges",
    "anti doomscrolling",
    "what to do instead of scrolling",
    "fun things to do when bored",
    "things to do instead of doomscrolling",
    "fun things to do",
    "AI challenge generator",
    "social challenges",
    "confidence challenges",
    "movement challenges",
    "bored ideas",
    "things to do instead of scrolling"
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
        <AuthProgressBridge />
        <MotionBackground />
        <Navbar />
        {children}
        <Footer />
        <MobileBottomCTA />
      </body>
    </html>
  );
}
