import { isOpenListing, listingPresentation } from "../listing-presentation";
import { findCityOption } from "../cities";
import { slugify } from "../slug";
import { parsePlanFinderInput } from "../planner";
import { generatePlanWithAi } from "./plan-agent";
import { filterListingsForSmartSearch, interpretSmartSearch } from "./smart-search-agent";
import { answerSupport } from "./support-agent";
import type { Listing } from "../../types/deals";

export type MobileAssistantInput = {
  aiConsent: boolean;
  cityId: string;
  mode: "deals" | "plan" | "support";
  query: string;
  preferences?: { budget?: string; when?: string; who?: string; vibe?: string };
};

export type MobileAssistantCard = {
  description: string;
  imageUrl: string;
  listingId: string;
  priceLabel: string;
  spotsLabel: string;
  timeLabel: string;
  title: string;
  wasLabel: string;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function parseMobileAssistantInput(body: unknown): MobileAssistantInput | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const value = body as Record<string, unknown>;
  if (!["deals", "plan", "support"].includes(String(value.mode))) return null;
  const query = text(value.query, 1_200);
  const cityText = text(value.cityId, 120);
  const cityId = findCityOption(cityText)?.id ?? slugify(cityText);
  if (query.length < 3 || (value.mode !== "support" && !/^[\p{L}\p{N}_-]+$/u.test(cityId))) return null;
  return {
    aiConsent: value.aiConsent === true, cityId, mode: value.mode as MobileAssistantInput["mode"], query,
    preferences: { budget: text(value.budget, 20), when: text(value.when, 20), who: text(value.who, 20), vibe: text(value.vibe, 30) }
  };
}

export function mobileLiveInventory(listings: Listing[], now = Date.now()) {
  return listings.filter((listing) => !listing.isDemo && isOpenListing(listing, now));
}

export function mobileListingCard(listing: Listing): MobileAssistantCard {
  const facts = listingPresentation(listing);
  return {
    description: listing.shortDescription,
    imageUrl: facts.imageUrl?.startsWith("https://") ? facts.imageUrl : "",
    listingId: listing.id,
    priceLabel: facts.priceLabel,
    spotsLabel: facts.spotsLabel,
    timeLabel: facts.timeLabel,
    title: listing.title,
    wasLabel: facts.wasLabel ?? ""
  };
}

export async function runMobileAssistant(input: MobileAssistantInput, listings: Listing[], scopeKey: string) {
  const common = { cards: [] as MobileAssistantCard[], empty: false, needsHumanSupport: false, planJson: "" };
  if (input.mode === "support") {
    const result = await answerSupport({ allowAi: input.aiConsent, messages: [{ content: input.query, role: "user" }], role: null, scopeKey });
    return { ...common, answer: result.answer, needsHumanSupport: result.needsHumanSupport, provider: result.provider, title: "GoFunMotion support" };
  }

  // The selected canonical city is authoritative. AI cannot silently switch it.
  const inventory = mobileLiveInventory(listings).filter((listing) => listing.cityId === input.cityId);
  const preferences = parsePlanFinderInput(input.preferences);
  const search = await interpretSmartSearch({
    allowAi: input.aiConsent && inventory.length > 0,
    defaults: {
      cityId: input.cityId,
      ...(input.preferences?.when ? { when: preferences.when } : {}),
      ...(input.preferences?.budget ? { budget: preferences.budget, maxPrice: ({ free: 0, under25: 25, under50: 50, under100: 100, premium: null, flexible: null })[preferences.budget] } : {}),
      ...(input.preferences?.who ? { who: preferences.who } : {}),
      ...(input.preferences?.vibe ? { vibe: preferences.vibe } : {})
    },
    query: input.query,
    scopeKey
  });
  const filters = { ...search.filters, cityId: input.cityId };
  const matches = filterListingsForSmartSearch(inventory, filters).slice(0, 12);

  if (input.mode === "deals") {
    return {
      ...common,
      answer: matches.length ? "Matched to your request. The partner confirms availability after you request a booking." : "No live deals match yet. Try another time or budget, or join the city waitlist.",
      cards: matches.map(mobileListingCard), empty: matches.length === 0, provider: search.provider,
      title: matches.length ? `${matches.length} matching ${matches.length === 1 ? "deal" : "deals"}` : "No matching deals"
    };
  }

  const planInput = parsePlanFinderInput({
    budget: filters.budget ?? "flexible", cityId: input.cityId, indoorOutdoor: filters.indoorOutdoor ?? "either",
    vibe: filters.vibe ?? "surprise-me", when: filters.when ?? "today", who: filters.who ?? matches[0]?.groupTypes[0] ?? "solo"
  });
  planInput.cityId = input.cityId;
  planInput.city = inventory[0]?.cityName ?? findCityOption(input.cityId)?.name ?? input.cityId;
  const result = await generatePlanWithAi({ allowAi: input.aiConsent, input: planInput, listings: matches, scopeKey });
  const byId = new Map(matches.map((listing) => [listing.id, listing]));
  const verified = result.plan.items.filter((item) => item.listingId && byId.has(item.listingId));
  // Mobile never displays demo inventory, even when the local web demo is enabled.
  const items = verified.length ? verified : result.plan.items.filter((item) => !item.listingId);
  const plan = { ...result.plan, items, listingIds: verified.map((item) => item.listingId!), source: result.provider === "openai" ? "ai" : "local_rules" };
  if (!verified.length) {
    plan.title = "A few ideas while deals arrive";
    plan.summary = "Curated ideas only, not verified venues or available bookings. Join the waitlist for live deals.";
    plan.estimatedTotalBudget = "Varies";
    plan.estimatedTotalTime = "Flexible";
  }
  return {
    ...common, answer: plan.summary, empty: verified.length === 0, planJson: JSON.stringify(plan), provider: result.provider, title: plan.title,
    cards: items.map((item): MobileAssistantCard => item.listingId
      ? mobileListingCard(byId.get(item.listingId)!)
      : { description: item.description, imageUrl: "", listingId: "", priceLabel: "Curated idea", spotsLabel: "Not a booking", timeLabel: item.time, title: item.title, wasLabel: "" })
  };
}
