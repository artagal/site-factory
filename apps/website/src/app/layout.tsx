import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Footer } from "../components/gofunmotion/Footer";
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
  title: "GoFunMotion - AI Real-Life Challenges That Get You Moving",
  description:
    "Replace scrolling with real life. Generate fun AI-powered challenges for movement, confidence, social connection, city exploration, couples, friends, and anti-doomscrolling.",
  image: "/og/gofunmotion-og.svg",
  keywords: [
    "real life challenges",
    "anti doomscrolling",
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
        <MotionBackground />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
