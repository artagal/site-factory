import { normalizeCitySelection } from "./cities";
import { formatBudget, formatDuration, formatGroup, formatPrice, formatVibe, formatWhen } from "./format";
import { filterListingCollection, getPublishedListings } from "./search";
import type { BudgetTier, Listing, PlanFinderInput, SuggestedPlan } from "../types/deals";

export const defaultPlanFinderInput: PlanFinderInput = {
  budget: "under50",
  city: "",
  cityId: "",
  indoorOutdoor: "either",
  timeAvailable: "2hours",
  vibe: "surprise-me",
  when: "today",
  who: "date"
};

export function parsePlanFinderInput(searchParams: Record<string, string | string[] | undefined> = {}): PlanFinderInput {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const city = normalizeCitySelection({
    city: read("city"),
    cityId: read("cityId")
  });

  return {
    budget: parseOption(read("budget"), ["free", "under25", "under50", "under100", "premium", "flexible"], defaultPlanFinderInput.budget),
    city: city.cityName,
    cityId: city.cityId,
    indoorOutdoor: parseOption(read("indoorOutdoor"), ["indoor", "outdoor", "either"], defaultPlanFinderInput.indoorOutdoor),
    timeAvailable: parseOption(read("timeAvailable"), ["30min", "1hour", "2hours", "half-day", "evening"], defaultPlanFinderInput.timeAvailable),
    vibe: parseOption(
      read("vibe"),
      ["chill", "romantic", "active", "social", "creative", "family-friendly", "adventurous", "low-energy", "rainy-day", "surprise-me"],
      defaultPlanFinderInput.vibe
    ),
    when: parseOption(read("when"), ["today", "tonight", "tomorrow", "weekend", "custom"], defaultPlanFinderInput.when),
    who: parseOption(read("who"), ["solo", "date", "friends", "family", "kids"], defaultPlanFinderInput.who)
  };
}

export function buildSuggestedPlan(input: PlanFinderInput, inventory: Listing[] = getPublishedListings()): SuggestedPlan {
  const cityName = input.city || "your city";
  const directMatches = input.cityId ? filterListingCollection(inventory, input) : [];
  const selected = [...new Map(directMatches.map((listing) => [listing.id, listing])).values()].slice(0, 3);
  const first = selected[0];
  const waitlistRecommended = !selected.length;

  return {
    backupSuggestions: buildBackups(input),
    estimatedTotalBudget: estimateBudget(selected.map((listing) => listing.price)),
    estimatedTotalTime: estimateTime(selected.map((listing) => listing.durationMinutes), input.timeAvailable),
    id: `plan-${cityName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${input.when}-${input.who}-${input.vibe}`,
    input,
    items: [
      {
        category: "Warm-up",
        ctaLabel: "Start here",
        description: buildWarmup(input),
        estimatedPrice: "Free",
        time: "15-30 min",
        title: `${formatWhen(input.when)} warm-up`,
        whyItFits: "It gives the plan a low-pressure start before the main activity."
      },
      ...selected.slice(0, 3).map((listing) => ({
        category: listing.categoryIds[0] ?? "Activity",
        ctaHref: `/deals/${listing.slug}`,
        ctaLabel: "View Deal",
        description: listing.shortDescription,
        estimatedPrice: formatPrice(listing.price, listing.currency),
        listingId: listing.id,
        time: formatDuration(listing.durationMinutes),
        title: listing.title,
        whyItFits: listing.whyItFits
      })),
      ...(!selected.length ? [{
        category: "Free idea",
        ctaLabel: "Browse activities",
        description: input.indoorOutdoor === "indoor"
          ? "Check your local library's free exhibits or community activities. Check opening hours before going."
          : "Choose a nearby public park or walking route. Check access and weather before going.",
        estimatedPrice: "Free idea; verify locally",
        time: "30-60 min",
        title: "Keep it local",
        whyItFits: "A general idea, not a confirmed venue or booking."
      }] : []),
      {
        category: "Backup",
        ctaLabel: "Save backup",
        description: buildBackupLine(input),
        estimatedPrice: getBudgetRangeLabel(input.budget),
        time: "30-60 min",
        title: "Backup if plans change",
        whyItFits: "A fallback keeps the night from collapsing if availability changes."
      }
    ].slice(0, 5),
    listingIds: selected.map((listing) => listing.id),
    source: selected.length > 0 && selected.every((listing) => listing.isDemo) ? "demo" : "local_rules",
    summary:
      first
        ? `A ${formatVibe(input.vibe)} ${formatGroup(input.who).toLowerCase()} plan in ${cityName}, anchored by ${first.title}.`
        : `A curated ${formatGroup(input.who).toLowerCase()} plan for ${cityName}, with local deals coming soon.`,
    title: buildPlanTitle(input),
    waitlistRecommended,
    whyItFits: `Matched on ${formatWhen(input.when).toLowerCase()}, ${formatGroup(input.who).toLowerCase()}, ${formatBudget(input.budget).toLowerCase()}, ${formatVibe(input.vibe)}, and ${input.indoorOutdoor}.`
  };
}

export function getBudgetRangeLabel(budget: BudgetTier | "flexible") {
  return budget === "flexible" ? "Flexible" : formatBudget(budget);
}

function buildBackups(input: PlanFinderInput) {
  const cityName = input.city || "your city";
  return [
    `${cityName} coffee or dessert stop`,
    input.indoorOutdoor === "outdoor" ? "Indoor cafe backup if weather changes" : "Nearby walk if you want to extend the plan",
    "Join the city waitlist if live partner availability is thin"
  ];
}

function buildBackupLine(input: PlanFinderInput) {
  if (input.who === "family" || input.who === "kids") return "Choose a nearby indoor activity or dessert stop that keeps kids comfortable.";
  if (input.who === "date") return "Pick a cozy dessert or coffee stop nearby if the main activity is full.";
  if (input.who === "friends") return "Send the group one backup with a clear time so the decision stays easy.";
  return "Keep one low-effort option nearby so the plan still works.";
}

function buildPlanTitle(input: PlanFinderInput) {
  const vibe = input.vibe === "surprise-me" ? "fun" : formatVibe(input.vibe);
  const cityName = input.city || "your city";
  return `${vibe[0].toUpperCase()}${vibe.slice(1)} ${formatGroup(input.who).toLowerCase()} plan in ${cityName} ${formatBudget(input.budget).toLowerCase()}`;
}

function buildWarmup(input: PlanFinderInput) {
  if (input.who === "date") return "Start with a short walk or coffee so the plan has an easy first yes.";
  if (input.who === "friends") return "Send the group the top two options and ask for a fast vote.";
  if (input.who === "family" || input.who === "kids") return "Start with a snack or short drive buffer before the main activity.";
  return "Start with a simple reset nearby before the main activity.";
}

function estimateBudget(prices: number[]) {
  if (!prices.length) return "Varies";
  const total = prices.reduce((sum, price) => sum + price, 0);
  return `${formatPrice(Math.min(...prices))}-${formatPrice(total)}`;
}

function estimateTime(minutes: number[], timeAvailable: PlanFinderInput["timeAvailable"]) {
  if (!minutes.length) return timeAvailable.replace("-", " ");
  const total = minutes.reduce((sum, item) => sum + item, 30);
  return formatDuration(Math.min(total, 360));
}

function parseOption<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
