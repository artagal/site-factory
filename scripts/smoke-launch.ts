import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type Check = {
  detail?: string;
  name: string;
  ok: boolean;
  warning?: boolean;
};

type CliOptions = {
  baseUrl: string;
  canonicalBaseUrl: string;
  envFiles: string[];
  skipEnv: boolean;
  strictEnv: boolean;
  timeoutMs: number;
};

const defaultBaseUrl =
  process.env.LAUNCH_BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  "http://localhost:3000";
const defaultCanonicalBaseUrl =
  process.env.SITE_FACTORY_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://gofunmotion.com";

function normalizeBaseUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    baseUrl: normalizeBaseUrl(defaultBaseUrl),
    canonicalBaseUrl: normalizeBaseUrl(defaultCanonicalBaseUrl),
    envFiles: [],
    skipEnv: false,
    strictEnv: false,
    timeoutMs: 30_000
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--base-url" && next) {
      options.baseUrl = normalizeBaseUrl(next);
      index += 1;
    } else if (arg === "--canonical-base-url" && next) {
      options.canonicalBaseUrl = normalizeBaseUrl(next);
      index += 1;
    } else if (arg === "--env-file" && next) {
      options.envFiles.push(next);
      index += 1;
    } else if (arg === "--skip-env") {
      options.skipEnv = true;
    } else if (arg === "--strict-env") {
      options.strictEnv = true;
    } else if (arg === "--timeout-ms" && next) {
      options.timeoutMs = Number(next) || options.timeoutMs;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.envFiles.length) {
    options.envFiles = [
      "apps/website/.env.local",
      "apps/website/.env.production.local",
      ".env.local",
      ".env.production.local"
    ];
  }

  return options;
}

function printHelp() {
  console.log([
    "GoFunMotion launch smoke test",
    "",
    "Usage:",
    "  npm.cmd run launch:smoke -- --base-url https://gofunmotion.com --strict-env",
    "  npm.cmd run launch:smoke -- --base-url http://localhost:3001 --skip-env",
    "",
    "Options:",
    "  --base-url <url>            Target site URL. Defaults to LAUNCH_BASE_URL, PLAYWRIGHT_BASE_URL, or http://localhost:3000.",
    "  --canonical-base-url <url>   Expected canonical URL base. Defaults to SITE_FACTORY_BASE_URL, NEXT_PUBLIC_SITE_URL, or https://gofunmotion.com.",
    "  --env-file <path>            Env file to audit. Can be passed multiple times.",
    "  --skip-env                   Skip local env-file/process env audit.",
    "  --strict-env                 Fail when launch-required env vars are missing.",
    "  --timeout-ms <number>        Per-request timeout. Default 30000."
  ].join("\n"));
}

function parseEnvFile(filePath: string) {
  if (!existsSync(filePath)) return {};

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, "");
        return [key, value];
      })
  ) as Record<string, string>;
}

function loadEnv(options: CliOptions) {
  const fileEnv: Record<string, string> = {};
  const existingFiles: string[] = [];

  for (const envFile of options.envFiles) {
    const absolutePath = path.resolve(envFile);
    if (!existsSync(absolutePath)) continue;
    Object.assign(fileEnv, parseEnvFile(absolutePath));
    existingFiles.push(envFile);
  }

  return {
    existingFiles,
    values: {
      ...fileEnv,
      ...Object.fromEntries(Object.entries(process.env).filter(([, value]) => Boolean(value)))
    } as Record<string, string | undefined>
  };
}

function auditEnv(options: CliOptions): Check[] {
  if (options.skipEnv) {
    return [{ name: "env audit skipped", ok: true, warning: true }];
  }

  const { existingFiles, values } = loadEnv(options);
  const has = (key: string) => Boolean(values[key]?.trim());
  const checks: Check[] = [];
  const requireKeys = (name: string, keys: string[], detail: string) => {
    const missing = keys.filter((key) => !has(key));
    checks.push({
      detail: missing.length ? `${detail} Missing: ${missing.join(", ")}` : detail,
      name,
      ok: missing.length === 0,
      warning: !options.strictEnv && missing.length > 0
    });
  };

  checks.push({
    detail: existingFiles.length ? `Read ${existingFiles.join(", ")}` : "No local env files found; process env only.",
    name: "env source discovery",
    ok: true,
    warning: existingFiles.length === 0
  });

  requireKeys(
    "Firebase client env",
    [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID"
    ],
    "Required for Firebase Auth, saved items, and client Firestore flows."
  );

  const adminJson = has("FIREBASE_SERVICE_ACCOUNT_JSON");
  const adminFields = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"].every(has);
  checks.push({
    detail: "Required for trusted Vercel API routes, admin moderation, booking request writes, partner listings, and account deletion.",
    name: "Firebase Admin env",
    ok: adminJson || adminFields,
    warning: !options.strictEnv && !(adminJson || adminFields)
  });

  requireKeys(
    "Canonical and email URL env",
    ["SITE_FACTORY_BASE_URL", "NEXT_PUBLIC_SITE_URL"],
    "Use SITE_FACTORY_BASE_URL for metadata/sitemap canonical URLs and NEXT_PUBLIC_SITE_URL for transactional email links."
  );

  const emailReady = has("RESEND_API_KEY") && (has("EMAIL_FROM") || has("RESEND_FROM_EMAIL") || has("TRANSACTIONAL_EMAIL_FROM"));
  checks.push({
    detail: "Recommended before real partner booking requests. Booking requests still save when email is disabled.",
    name: "Transactional email env",
    ok: emailReady,
    warning: !emailReady
  });

  const paymentKeys = Object.keys(values).filter((key) =>
    /^(STRIPE_|NEXT_PUBLIC_STRIPE_|REVENUECAT_|PAYPAL_|SQUARE_)/.test(key)
  );
  checks.push({
    detail: paymentKeys.length
      ? `Payment-related vars should stay absent in this validation build: ${paymentKeys.join(", ")}`
      : "No payment checkout env vars detected.",
    name: "No payment env configured",
    ok: paymentKeys.length === 0
  });

  return checks;
}

async function fetchWithTimeout(url: string, options: CliOptions, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(options: CliOptions, pathname: string, init: RequestInit = {}) {
  try {
    const response = await fetchWithTimeout(targetUrl(options, pathname), options, init);
    return {
      body: await response.text(),
      error: "",
      headers: response.headers,
      status: response.status
    };
  } catch (error) {
    return {
      body: "",
      error: error instanceof Error ? error.message : String(error),
      headers: new Headers(),
      status: 0
    };
  }
}

function targetUrl(options: CliOptions, pathname: string) {
  return new URL(pathname, `${options.baseUrl}/`).toString();
}

function expectedCanonical(options: CliOptions, pathname: string) {
  return new URL(pathname, `${options.canonicalBaseUrl}/`).toString();
}

function firstMatch(body: string, pattern: RegExp) {
  return body.match(pattern)?.[1] ?? "";
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function checkHtmlPage(
  options: CliOptions,
  pathname: string,
  expected: {
    canonical?: string;
    noindex?: boolean;
    text?: string;
    title?: string;
  }
): Promise<Check[]> {
  const { body, error, status } = await fetchText(options, pathname);
  const canonical = firstMatch(body, /<link rel="canonical" href="([^"]+)"/);
  const ogImage = firstMatch(body, /<meta property="og:image" content="([^"]+)"/);
  const robots = firstMatch(body, /<meta name="robots" content="([^"]+)"/);
  const title = decodeHtml(firstMatch(body, /<title>([^<]+)<\/title>/));
  const checks: Check[] = [
    {
      detail: error || `HTTP ${status}`,
      name: `${pathname} returns 200`,
      ok: status === 200
    }
  ];

  if (expected.title) {
    checks.push({
      detail: title,
      name: `${pathname} title`,
      ok: title.includes(expected.title)
    });
  }

  if (expected.canonical) {
    checks.push({
      detail: canonical || "missing",
      name: `${pathname} canonical`,
      ok: canonical === expected.canonical
    });
  }

  checks.push({
    detail: ogImage || "missing",
    name: `${pathname} OG image`,
    ok: ogImage === expectedCanonical(options, "/og/gofunmotion-og.png")
  });

  if (expected.text) {
    checks.push({
      detail: expected.text,
      name: `${pathname} launch copy`,
      ok: body.includes(expected.text)
    });
  }

  if (expected.noindex !== undefined) {
    checks.push({
      detail: robots || "missing",
      name: `${pathname} robots meta`,
      ok: expected.noindex ? robots.includes("noindex") : !robots.includes("noindex")
    });
  }

  return checks;
}

async function checkJson<T>(options: CliOptions, pathname: string) {
  const result = await fetchText(options, pathname, {
    headers: { Accept: "application/json" }
  });
  let body: T | null = null;
  let parseError = "";

  if (result.body) {
    try {
      body = JSON.parse(result.body) as T;
    } catch (error) {
      parseError = error instanceof Error ? error.message : String(error);
    }
  }

  return { body, error: result.error || parseError, status: result.status };
}

async function smoke(options: CliOptions): Promise<Check[]> {
  const checks: Check[] = [];
  checks.push(...auditEnv(options));

  const publicPages = [
    { path: "/", text: "Find something fun to do today.", title: "GoFunMotion - Find Fun Things To Do Today" },
    { path: "/find", text: "Tell us what sounds fun.", title: "Find My Plan | GoFunMotion Deals" },
    { path: "/deals", text: "Last-minute fun, for less.", title: "Tonight's Last-Minute Fun Deals | GoFunMotion" },
    { path: "/pricing", text: "No consumer checkout or paid partner checkout is enabled.", title: "Partner Pricing | GoFunMotion Deals" },
    { path: "/partner/apply", text: "Listings stay pending until reviewed", title: "Apply To List Your Business | GoFunMotion Deals" },
    { path: "/support", text: "Help for plans, deals, and partner listings.", title: "Support | GoFunMotion" },
    { path: "/blog/date-night-ideas-under-50", text: "Turn this article into action", title: "Date Night Ideas Under $50 | GoFunMotion" },
    { path: "/deals/pottery-date-night-demo", text: "Request availability", title: "Pottery Date Night - 25% Off | GoFunMotion Deals" }
  ];

  for (const page of publicPages) {
    checks.push(
      ...(await checkHtmlPage(options, page.path, {
        canonical: expectedCanonical(options, page.path),
        noindex: false,
        text: page.text,
        title: page.title
      }))
    );
  }

  for (const page of ["/login", "/saved", "/profile", "/partner/dashboard", "/admin"]) {
    checks.push(
      ...(await checkHtmlPage(options, page, {
        canonical: expectedCanonical(options, page),
        noindex: true
      }))
    );
  }

  const sitemapResponse = await fetchText(options, "/sitemap.xml");
  const sitemap = sitemapResponse.body;
  const forbiddenSitemapPaths = ["/challenge", "/daily", "/leaderboard", "/categories", "/login", "/profile", "/saved", "/admin", "/partner/dashboard"];
  checks.push({
    detail: sitemapResponse.error || `HTTP ${sitemapResponse.status}`,
    name: "sitemap returns 200",
    ok: sitemapResponse.status === 200
  });
  checks.push({
    detail: forbiddenSitemapPaths.filter((route) => sitemap.includes(`<loc>${expectedCanonical(options, route)}</loc>`)).join(", ") || "none",
    name: "sitemap excludes deprecated/protected routes",
    ok: forbiddenSitemapPaths.every((route) => !sitemap.includes(`<loc>${expectedCanonical(options, route)}</loc>`))
  });
  checks.push({
    detail: "core routes",
    name: "sitemap includes launch routes",
    ok: ["/", "/find", "/deals", "/pricing", "/partner/apply", "/support", "/blog/date-night-ideas-under-50"].every((route) =>
      sitemap.includes(expectedCanonical(options, route))
    )
  });

  const robotsResponse = await fetchText(options, "/robots.txt");
  const robots = robotsResponse.body;
  checks.push({
    detail: robotsResponse.error || `HTTP ${robotsResponse.status}`,
    name: "robots returns 200",
    ok: robotsResponse.status === 200
  });
  checks.push({
    detail: robots.match(/Sitemap:.+/)?.[0] ?? "missing",
    name: "robots points to canonical sitemap",
    ok: robots.includes(`Sitemap: ${expectedCanonical(options, "/sitemap.xml")}`)
  });

  const { body: manifest, error: manifestError, status: manifestStatus } = await checkJson<{
    icons?: Array<{ purpose?: string; sizes?: string; src?: string }>;
    name?: string;
    screenshots?: Array<{ sizes?: string; src?: string }>;
  }>(options, "/manifest.webmanifest");
  checks.push({
    detail: manifestError || `HTTP ${manifestStatus}`,
    name: "manifest returns 200",
    ok: manifestStatus === 200
  });
  checks.push({
    detail: manifest?.name ?? "missing",
    name: "manifest brand",
    ok: manifest?.name === "GoFunMotion Deals"
  });
  checks.push({
    detail: JSON.stringify(manifest?.icons ?? []),
    name: "manifest has maskable icon",
    ok: Boolean(manifest?.icons?.some((icon) => icon.purpose === "maskable" && icon.sizes === "512x512"))
  });
  checks.push({
    detail: JSON.stringify(manifest?.screenshots ?? []),
    name: "manifest has splash screenshot",
    ok: Boolean(manifest?.screenshots?.some((shot) => shot.src === "/brand/gofunmotion-splash.png"))
  });

  const { body: planBody, error: planError, status: planStatus } = await checkJson<{ plan?: { items?: unknown[]; title?: string } }>(
    options,
    "/api/plan?city=Miami&cityId=miami&when=tonight&who=date&budget=under50&vibe=romantic"
  );
  checks.push({
    detail: planError || `HTTP ${planStatus}`,
    name: "plan API returns 200",
    ok: planStatus === 200
  });
  checks.push({
    detail: planBody?.plan?.title ?? "missing",
    name: "plan API returns usable plan",
    ok: Boolean(planBody?.plan?.title?.includes("Miami") && (planBody.plan.items?.length ?? 0) >= 3)
  });

  const { body: searchBody, error: searchError, status: searchStatus } = await checkJson<{
    count?: number;
    listings?: Array<{ approvalStatus?: string; status?: string }>;
  }>(options, "/api/search?cityId=miami&when=tonight&sort=featured");
  checks.push({
    detail: searchError || `HTTP ${searchStatus}`,
    name: "search API returns 200",
    ok: searchStatus === 200
  });
  checks.push({
    detail: `count=${searchBody?.count ?? "missing"}`,
    name: "search API returns approved published listings",
    ok: Boolean(
      typeof searchBody?.count === "number" &&
        searchBody.count > 0 &&
        searchBody.listings?.every((listing) => listing.status === "published" && listing.approvalStatus === "approved")
    )
  });

  const checkoutResponse = await fetchText(options, "/api/checkout/partner-subscription");
  checks.push({
    detail: checkoutResponse.error || `HTTP ${checkoutResponse.status}`,
    name: "checkout endpoint stays disabled",
    ok: checkoutResponse.status === 404
  });

  for (const redirect of [
    { from: "/challenge", to: "/find" },
    { from: "/daily", to: "/find?when=today" },
    { from: "/leaderboard", to: "/deals" }
  ]) {
    const response = await fetchText(options, redirect.from, {
      redirect: "manual"
    });
    const location = response.headers.get("location") ?? "";
    checks.push({
      detail: `HTTP ${response.status} location=${location}`,
      name: `${redirect.from} redirect`,
      ok: response.status >= 300 && response.status < 400 && location.includes(redirect.to)
    });
  }

  return checks;
}

function printResults(checks: Check[]) {
  let failed = 0;
  let warned = 0;

  for (const check of checks) {
    if (check.ok && check.warning) {
      warned += 1;
      console.log(`WARN ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
    } else if (check.ok) {
      console.log(`PASS ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
    } else if (check.warning) {
      warned += 1;
      console.log(`WARN ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
    } else {
      failed += 1;
      console.log(`FAIL ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
    }
  }

  console.log("");
  console.log(`Launch smoke summary: ${checks.length - failed - warned} passed, ${warned} warnings, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  console.log(`Target: ${options.baseUrl}`);
  console.log(`Expected canonical base: ${options.canonicalBaseUrl}`);
  console.log("");
  printResults(await smoke(options));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
