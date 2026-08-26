import type { BudgetTier, GroupType, IndoorOutdoor, PlanVibe, PlanWhen } from "../types/deals";

export function formatLocalDateTimeInput(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localDateTimeInputToIso(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

export function formatBudget(budget: BudgetTier | "flexible") {
  const labels: Record<BudgetTier | "flexible", string> = {
    flexible: "Flexible",
    free: "Free",
    premium: "Premium",
    under100: "Under $100",
    under25: "Under $25",
    under50: "Under $50"
  };
  return labels[budget];
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!remainder) return `${hours} hr`;
  return `${hours}h ${remainder}m`;
}

export function formatGroup(group: GroupType) {
  const labels: Record<GroupType, string> = {
    date: "Date",
    family: "Family",
    friends: "Friends",
    kids: "Kids",
    solo: "Solo"
  };
  return labels[group];
}

export function formatIndoorOutdoor(value: IndoorOutdoor) {
  return value === "either" ? "Indoor or outdoor" : value[0].toUpperCase() + value.slice(1);
}

export function formatPrice(price: number, currency = "USD") {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
    style: "currency"
  }).format(price);
}

export function formatVibe(vibe: PlanVibe) {
  return vibe.replace(/-/g, " ");
}

export function formatWhen(when: PlanWhen) {
  const labels: Record<PlanWhen, string> = {
    custom: "Custom date",
    today: "Today",
    tomorrow: "Tomorrow",
    tonight: "Tonight",
    weekend: "This weekend"
  };
  return labels[when];
}
