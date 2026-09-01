export const MOBILE_SECTIONS = [
  "profile", "notifications", "requests", "request", "partner-inbox", "partner-request",
  "partner-listings", "partner-listing", "business", "subscription", "team", "analytics", "reviews", "review-request", "map",
  "admin-applications", "admin-application", "admin-listings", "admin-listing",
  "admin-businesses", "admin-business", "admin-users", "admin-user", "admin-cities", "admin-city",
  "admin-categories", "admin-category", "admin-bookings", "admin-booking", "admin-reviews",
  "admin-review", "admin-audit", "admin-metrics"
] as const;

export type MobileSection = typeof MOBILE_SECTIONS[number];
export type MobileRow = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  status: string;
  value: string;
  referenceId: string;
  businessId: string;
  imageUrl: string;
  mapUrl: string;
  mapEmbedUrl: string;
};

export type MobileWorkspace = {
  title: string;
  summary: string;
  detail: string;
  status: string;
  id: string;
  businessId: string;
  canEdit: boolean;
  flag: boolean;
  rows: MobileRow[];
  hasMore: boolean;
  nextCursor: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  startMillis: number;
  endMillis: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactEmailUrl: string;
  contactPhoneUrl: string;
  mapUrl: string;
  venueAddress: string;
  partySize: string;
};

export function mobileText(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function mobileId(value: unknown): string {
  const id = typeof value === "string" ? value.trim() : "";
  return id && id.length <= 180 && !/[\/\u0000-\u001f]/.test(id) && id !== "." && id !== ".." ? id : "";
}

export function mobileSection(value: unknown): MobileSection | null {
  return MOBILE_SECTIONS.includes(value as MobileSection) ? value as MobileSection : null;
}

export function mobileRow(id: string, values: Partial<MobileRow> = {}): MobileRow {
  return { id, title: "", subtitle: "", detail: "", status: "", value: "", referenceId: "", businessId: "", imageUrl: "", mapUrl: "", mapEmbedUrl: "", ...values };
}

export function mobileWorkspace(values: Partial<MobileWorkspace> = {}): MobileWorkspace {
  return {
    title: "", summary: "", detail: "", status: "", id: "", businessId: "", canEdit: false, flag: false,
    rows: [], hasMore: false, nextCursor: "", field1: "", field2: "", field3: "", field4: "", field5: "", field6: "", startMillis: 0, endMillis: 0,
    contactName: "", contactEmail: "", contactPhone: "", contactEmailUrl: "", contactPhoneUrl: "", mapUrl: "", venueAddress: "", partySize: "",
    ...values
  };
}

export function emailLink(value: unknown): string {
  const email = mobileText(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : "";
}

export function phoneLink(value: unknown): string {
  const phone = mobileText(value, 80);
  const normalized = phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return normalized.replace(/\D/g, "").length >= 7 ? `tel:${normalized}` : "";
}

export function mobileDate(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date: unknown = value.toDate();
    return date instanceof Date && Number.isFinite(date.getTime()) ? date.toISOString() : "";
  }
  return "";
}

export function canCancelRequest(status: unknown): boolean {
  return status === "pending" || status === "contacted" || status === "confirmed";
}

// A confirmed request is not proof of attendance. Reviews say "confirmed booking",
// remain pending moderation, and cannot be submitted before the requested day ends.
export function canReviewRequest(data: Record<string, unknown>, uid: string, now = Date.now()): boolean {
  if (data.userId !== uid || data.status !== "confirmed") return false;
  const day = mobileText(data.requestedDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const afterDay = Date.parse(`${day}T23:59:59-12:00`);
  return Number.isFinite(afterDay) && afterDay < now;
}

export function mobilePaidTier(business: Record<string, unknown>, now = Date.now()): "starter" | "growth" | "pro" {
  return activePartnerTier(business, now);
}

export function mapLink(latitude: unknown, longitude: unknown): string {
  if (typeof latitude !== "number" || typeof longitude !== "number" || !Number.isFinite(latitude)
    || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return "";
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function embeddedMapLink(latitude: unknown, longitude: unknown): string {
  if (!mapLink(latitude, longitude)) return "";
  const lat = latitude as number;
  const lon = longitude as number;
  const url = new URL("https://www.openstreetmap.org/export/embed.html");
  url.searchParams.set("bbox", [Math.max(-180, lon - 0.015), Math.max(-90, lat - 0.01), Math.min(180, lon + 0.015), Math.min(90, lat + 0.01)].join(","));
  url.searchParams.set("layer", "mapnik");
  url.searchParams.set("marker", `${lat},${lon}`);
  return url.toString();
}
import { activePartnerTier } from "./partner-entitlements";
