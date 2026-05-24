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
  title: "GoFunMotion - Last-Minute Fun Deals Near You",
  description:
    "Find last-minute fun deals near you. Save on activities, date nights, family fun, and local experiences with open spots today.",
  image: "/og/gofunmotion-og.svg",
  keywords: [
    "last minute fun deals",
    "activity deals near me",
    "things to do tonight",
    "local activity deals",
    "date night ideas",
    "family activities",
    "last minute deals",
    "open slot deals",
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
