import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GoFunMotion Deals",
    short_name: "GoFunMotion",
    description:
      "Find local activities, last-minute deals, date night ideas, family fun, and spontaneous plans based on your city, time, mood, and budget.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#070816",
    theme_color: "#bef264",
    categories: ["lifestyle", "travel", "shopping", "entertainment"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    screenshots: [
      {
        src: "/brand/gofunmotion-splash.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow"
      }
    ],
    shortcuts: [
      {
        name: "Find My Plan",
        short_name: "Find",
        description: "Open the GoFunMotion plan finder.",
        url: "/find",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      },
      {
        name: "Browse Deals",
        short_name: "Deals",
        description: "Browse local activity deals.",
        url: "/deals",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      }
    ]
  };
}
