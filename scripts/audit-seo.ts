import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { blogPosts } from "../apps/website/src/lib/blog";
import { categories, cities, listings } from "../apps/website/src/lib/deals-data";
import { buildListingSeoDescription } from "../apps/website/src/lib/listing-seo";
import { getRepoRoot } from "../apps/website/src/lib/repo-root";
import { absoluteUrl, defaultOgImage, getCanonicalBaseUrl, validateSeoFields } from "../apps/website/src/lib/seo";
import { getFactoryRoutes, normalizeRoutePath } from "../apps/website/src/lib/site-routes";

type SeoEntry = {
  description: string;
  indexable?: boolean;
  path: string;
  routeType: "blog" | "category" | "city" | "deal" | "noindex" | "static";
  title: string;
};

export type SeoAuditItem = {
  canonical: string;
  descriptionLength: number;
  href: string;
  indexable: boolean;
  issues: string[];
  routeType: SeoEntry["routeType"];
  title: string;
  titleLength: number;
};

const staticSeoEntries: SeoEntry[] = [
  {
    description:
      "Discover local activities, last-minute deals, date ideas, family fun, and spontaneous plans based on your mood, time, budget, and city.",
    path: "/",
    routeType: "static",
    title: "GoFunMotion - Find Fun Things To Do Today"
  },
  {
    description:
      "Find a simple local activity plan based on your city, mood, time, budget, and who's going.",
    path: "/find",
    routeType: "static",
    title: "Find My Plan | GoFunMotion Deals"
  },
  {
    description:
      "Browse tonight's last-minute fun deals with clear was/now pricing, open slots, local activity discounts, date night deals, family passes, and classes.",
    path: "/deals",
    routeType: "static",
    title: "Tonight's Last-Minute Fun Deals | GoFunMotion"
  },
  {
    description:
      "Find date night ideas, local activity deals, open-slot requests, and affordable plans by time, budget, city, and vibe.",
    path: "/date-night",
    routeType: "static",
    title: "Date Night Ideas | GoFunMotion Deals"
  },
  {
    description:
      "Find group-friendly activities, last-minute friend plans, open slots, and local activity deals that make it easier for everyone to say yes.",
    path: "/friends",
    routeType: "static",
    title: "Fun Things To Do With Friends | GoFunMotion"
  },
  {
    description:
      "Find family activities, kids plans, indoor options, weekend ideas, and request-based local deal cards for easier outings.",
    path: "/family",
    routeType: "static",
    title: "Family Activities Near You | GoFunMotion"
  },
  {
    description:
      "Local businesses can list discounted last-minute open slots, slow-hour activity deals, and receive booking requests through GoFunMotion Deals.",
    path: "/partner",
    routeType: "static",
    title: "Partner With GoFunMotion Deals"
  },
  {
    description:
      "Apply to list your local activity business, classes, deals, events, or last-minute availability on GoFunMotion Deals.",
    path: "/partner/apply",
    routeType: "static",
    title: "Apply To List Your Business | GoFunMotion Deals"
  },
  {
    description:
      "GoFunMotion Deals partner pricing for local activity businesses running discounted last-minute open-slot offers.",
    path: "/pricing",
    routeType: "static",
    title: "Partner Pricing | GoFunMotion Deals"
  },
  {
    description:
      "Join the GoFunMotion Deals city interest list for local activities, last-minute deals, date ideas, family plans, and partner listings.",
    path: "/waitlist",
    routeType: "static",
    title: "City Waitlist | GoFunMotion Deals"
  },
  {
    description:
      "GoFunMotion Deals helps people find discounted last-minute activity openings, date night deals, family passes, and local experiences.",
    path: "/about",
    routeType: "static",
    title: "About GoFunMotion Deals"
  },
  {
    description:
      "Get support for GoFunMotion accounts, saved activity plans, booking requests, partner applications, and local activity listings.",
    path: "/support",
    routeType: "static",
    title: "Support | GoFunMotion"
  },
  {
    description:
      "Read local activity ideas, date night guides, family plans, last-minute deal strategy, and partner growth articles from GoFunMotion Deals.",
    path: "/blog",
    routeType: "static",
    title: "Local Activity Ideas | GoFunMotion Blog"
  },
  {
    description:
      "GoFunMotion privacy policy for the website, accounts, saved plans, booking requests, partner applications, and waitlist data.",
    path: "/privacy",
    routeType: "static",
    title: "Privacy Policy | GoFunMotion"
  },
  {
    description:
      "GoFunMotion terms of use for local discovery, activity deals, booking requests, partner listings, and prototype website usage.",
    path: "/terms",
    routeType: "static",
    title: "Terms of Use | GoFunMotion"
  }
];

const noIndexSeoEntries: SeoEntry[] = [
  {
    description:
      "Sign in to GoFunMotion Deals to save local activity plans, send booking requests, manage profile preferences, and use partner tools.",
    indexable: false,
    path: "/login",
    routeType: "noindex",
    title: "Sign In | GoFunMotion Deals"
  },
  {
    description:
      "Save local activity deals, helper plans, booking requests, and preferences after sign in to keep GoFunMotion planning synced.",
    indexable: false,
    path: "/saved",
    routeType: "noindex",
    title: "Saved Deals And Plans | GoFunMotion"
  },
  {
    description:
      "View saved deals, helper plans, booking requests, preferences, and account information on GoFunMotion Deals.",
    indexable: false,
    path: "/profile",
    routeType: "noindex",
    title: "Profile | GoFunMotion Deals"
  },
  {
    description:
      "Business dashboard for GoFunMotion Deals partners to manage open-slot deals, listings, and booking requests.",
    indexable: false,
    path: "/partner/dashboard",
    routeType: "noindex",
    title: "Partner Dashboard | GoFunMotion Deals"
  },
  {
    description:
      "Admin approval dashboard for GoFunMotion Deals listings, businesses, partner applications, cities, and categories.",
    indexable: false,
    path: "/admin",
    routeType: "noindex",
    title: "Admin Dashboard | GoFunMotion Deals"
  }
];

const stalePositioningPatterns = [
  /\bchallenge\b/i,
  /\bchallenges\b/i,
  /\bxp\b/i,
  /\bstreak\b/i,
  /\bleaderboard\b/i,
  /\brarity\b/i,
  /\brandom challenge\b/i
];

const deprecatedIndexablePaths = ["/challenge", "/daily", "/leaderboard", "/categories"];

function auditItem(entry: SeoEntry): SeoAuditItem {
  const href = normalizeRoutePath(entry.path);
  const issues = validateSeoFields({ title: entry.title, description: entry.description, path: href });
  const searchableText = `${entry.title} ${entry.description} ${href}`;

  if (stalePositioningPatterns.some((pattern) => pattern.test(searchableText))) {
    issues.push("Stale challenge/XP positioning found in launch SEO text.");
  }

  if (entry.indexable !== false && deprecatedIndexablePaths.includes(href)) {
    issues.push("Deprecated redirect route should not be indexable.");
  }

  return {
    canonical: absoluteUrl(href),
    descriptionLength: entry.description.length,
    href,
    indexable: entry.indexable !== false,
    issues,
    routeType: entry.routeType,
    title: entry.title,
    titleLength: entry.title.length
  };
}

export function auditSeoEntries() {
  const blogEntries: SeoEntry[] = blogPosts.map((post) => ({
    description: post.description,
    path: `/blog/${post.slug}`,
    routeType: "blog",
    title: `${post.title} | GoFunMotion`
  }));
  const dealEntries: SeoEntry[] = listings.map((listing) => ({
    description: buildListingSeoDescription(listing),
    indexable: !listing.isDemo,
    path: `/deals/${listing.slug}`,
    routeType: "deal",
    title: `${listing.title} | GoFunMotion Deals`
  }));
  const cityEntries: SeoEntry[] = cities.map((city) => ({
    description: `Find last-minute activity deals in ${city.name}: open slots, date night discounts, family passes, and local experiences.`,
    path: `/cities/${city.slug}`,
    routeType: "city",
    title: `${city.name} Activity Deals | GoFunMotion`
  }));
  const categoryEntries: SeoEntry[] = categories.map((category) => ({
    description: `${category.description} Browse discounted open slots and last-minute GoFunMotion Deals activity cards.`,
    path: `/categories/${category.slug}`,
    routeType: "category",
    title: `${category.name} Deals | GoFunMotion`
  }));

  return [
    ...staticSeoEntries,
    ...blogEntries,
    ...dealEntries,
    ...cityEntries,
    ...categoryEntries,
    ...noIndexSeoEntries
  ].map(auditItem);
}

export function writeSeoAudit() {
  const repoRoot = getRepoRoot();
  const results = auditSeoEntries();
  const issueCount = results.reduce((total, item) => total + item.issues.length, 0);
  const sitemapPaths = new Set(getFactoryRoutes().map((route) => route.path));
  const indexablePaths = results.filter((item) => item.indexable).map((item) => item.href);
  const sitemapMissing = indexablePaths.filter((path) => !sitemapPaths.has(path));
  const sitemapExtra = [...sitemapPaths].filter((path) => !indexablePaths.includes(path));
  const launchIssueCount = issueCount + sitemapMissing.length + sitemapExtra.length;
  const publicDirectory = path.join(repoRoot, "apps", "website", "public");
  const assetChecks = [
    defaultOgImage,
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/icon-192.png",
    "/icon-512.png",
    "/maskable-icon-512.png",
    "/brand/gofunmotion-splash.png",
    "/brand/gofunmotion-splash-motion.gif"
  ].map((assetPath) => ({
    exists: existsSync(path.join(publicDirectory, assetPath.replace(/^\//, ""))),
    path: assetPath
  }));
  const missingAssets = assetChecks.filter((asset) => !asset.exists);
  const canonicalBaseUrl = getCanonicalBaseUrl();
  const lines = [
    "# GoFunMotion Launch SEO Audit",
    "",
    `Canonical base URL: ${canonicalBaseUrl}`,
    `Audited pages: ${results.length}`,
    `Indexable pages: ${indexablePaths.length}`,
    `Noindex pages checked: ${results.length - indexablePaths.length}`,
    `Issues found: ${launchIssueCount + missingAssets.length}`,
    "",
    "## Sitemap parity",
    "",
    `- Routes in sitemap registry: ${sitemapPaths.size}`,
    `- Missing from sitemap: ${sitemapMissing.length ? sitemapMissing.join(", ") : "None"}`,
    `- Extra in sitemap: ${sitemapExtra.length ? sitemapExtra.join(", ") : "None"}`,
    "",
    "## Asset checks",
    "",
    ...assetChecks.map((asset) => `- ${asset.exists ? "OK" : "Missing"}: ${asset.path}`),
    "",
    ...results.flatMap((item) => [
      `## ${item.title}`,
      "",
      `- Path: ${item.href}`,
      `- Canonical: ${item.canonical}`,
      `- Type: ${item.routeType}`,
      `- Indexable: ${item.indexable ? "yes" : "no"}`,
      `- Title length: ${item.titleLength}`,
      `- Description length: ${item.descriptionLength}`,
      `- Issues: ${item.issues.length ? item.issues.join(" ") : "None"}`,
      ""
    ])
  ];
  const outputDirectory = path.join(repoRoot, "output", "seo-audits");

  mkdirSync(outputDirectory, { recursive: true });
  const outputPath = path.join(outputDirectory, "site-factory-seo-audit.md");
  writeFileSync(outputPath, lines.join("\n"), "utf8");

  return {
    issueCount: launchIssueCount + missingAssets.length,
    outputPath,
    pageCount: results.length
  };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const result = writeSeoAudit();
  console.log(
    `Audited ${result.pageCount} pages with ${result.issueCount} issues. Report: ${result.outputPath}`
  );
}
