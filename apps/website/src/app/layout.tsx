import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { MotionBackground } from "../components/gofunmotion/MotionBackground";
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";
import { ThemeProvider } from "../components/theme/theme-provider";
import { buildSeoMetadata } from "../lib/seo";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "GoFunMotion - Last-Minute Fun Deals Near You",
    description:
      "Find last-minute fun deals near you. Save on activities, date nights, family fun, and local experiences with open spots today.",
    image: "/og/gofunmotion-og.png",
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
  }),
  applicationName: "GoFunMotion Deals",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GoFunMotion"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: [{ sizes: "180x180", type: "image/png", url: "/apple-touch-icon.png" }],
    icon: [
      { url: "/favicon.ico" },
      { sizes: "32x32", type: "image/png", url: "/icons/gofunmotion-icon-32.png" },
      { sizes: "48x48", type: "image/png", url: "/icons/gofunmotion-icon-48.png" },
      { sizes: "192x192", type: "image/png", url: "/icon-192.png" },
      { sizes: "512x512", type: "image/png", url: "/icon-512.png" }
    ],
    shortcut: "/favicon.ico"
  },
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider>
          <MotionBackground />
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
