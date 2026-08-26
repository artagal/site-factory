import { AggregateField, FieldPath, type DocumentData, type Query } from "firebase-admin/firestore";
import { canCancelRequest, canReviewRequest, embeddedMapLink, mapLink, mobileDate, mobileId, mobilePaidTier, mobileRow, mobileText, mobileWorkspace, type MobileRow, type MobileSection, type MobileWorkspace } from "../mobile-workspace";
import { filterListingCollection, parseListingSearchInput } from "../search";
import { getPublicListingsForServer } from "./public-listings";
import { getFirebaseAdminDb } from "./firebase-admin";
import { MobileError, mobileBooking, mobileBusiness, requireMobileAdmin, type MobileActor } from "./mobile-workspace-access";

const adminCollections: Partial<Record<MobileSection, string>> = {
  "admin-applications": "partnerApplications", "admin-application": "partnerApplications",
  "admin-listings": "listings", "admin-listing": "listings",
  "admin-businesses": "businesses", "admin-business": "businesses",
  "admin-users": "users", "admin-user": "users", "admin-cities": "cities", "admin-city": "cities",
  "admin-categories": "categories", "admin-category": "categories",
  "admin-bookings": "bookingRequests", "admin-booking": "bookingRequests",
  "admin-reviews": "reviews", "admin-review": "reviews", "admin-audit": "adminAuditLogs"
};

export function workspaceRecord(collection: string, id: string, data: DocumentData): MobileRow {
  if (collection === "bookingRequests") return mobileRow(id, {
    title: mobileText(data.listingTitle) || "Activity request",
    subtitle: [mobileText(data.businessName), mobileText(data.requestedDate), mobileText(data.requestedTime)].filter(Boolean).join(" | "),
    detail: [mobileText(data.name), mobileText(data.email), mobileText(data.phone), mobileText(data.message)].filter(Boolean).join("\n"),
    value: `${Number(data.partySize) || 1} people`, status: mobileText(data.status),
    businessId: mobileId(data.businessId), referenceId: mobileId(data.listingId)
  });
  if (collection === "listings") return mobileRow(id, {
    title: mobileText(data.title), subtitle: [mobileText(data.businessName), mobileText(data.cityName)].filter(Boolean).join(" | "),
    detail: [mobileText(data.description), mobileDate(data.availableFrom), mobileDate(data.availableUntil), mobileText(data.rejectionReason)].filter(Boolean).join("\n"),
    status: `${mobileText(data.status)} | ${mobileText(data.approvalStatus)}`,
    value: `${mobileText(data.currency) || "USD"} ${Number(data.price) || 0} | ${Number(data.capacity) || 0} spots`,
    businessId: mobileId(data.businessId), referenceId: id, imageUrl: Array.isArray(data.images) ? mobileText(data.images[0]) : ""
  });
  if (collection === "partnerApplications") return mobileRow(id, {
    title: mobileText(data.businessName), subtitle: [mobileText(data.cityName || data.city), mobileText(data.categoryName || data.category)].filter(Boolean).join(" | "),
    detail: [mobileText(data.ownerName), mobileText(data.email), mobileText(data.phone), mobileText(data.description), mobileText(data.message)].filter(Boolean).join("\n"),
    status: mobileText(data.status), businessId: mobileId(data.approvedBusinessId), referenceId: mobileId(data.approvedOwnerUid)
  });
  if (collection === "reviews") return mobileRow(id, {
    title: mobileText(data.listingTitle) || "Activity review", subtitle: mobileText(data.authorName) || "Customer",
    detail: mobileText(data.text), status: mobileText(data.status), value: `${Number(data.rating) || 0} / 5`,
    referenceId: mobileId(data.listingId), businessId: mobileId(data.businessId)
  });
  if (collection === "adminAuditLogs") return mobileRow(id, {
    title: mobileText(data.action), subtitle: mobileDate(data.createdAt),
    detail: `${mobileText(data.targetType)}: ${mobileText(data.targetId)}\nActor: ${mobileText(data.actorUid)}`,
    referenceId: mobileId(data.targetId)
  });
  return mobileRow(id, {
    title: mobileText(data.name || data.displayName || data.title) || id,
    subtitle: mobileText(data.cityName || data.email || data.state || data.type),
    detail: mobileText(data.description || data.body),
    status: mobileText(data.status || data.role) || (data.active === false ? "inactive" : "active"),
    referenceId: mobileId(data.data?.bookingRequestId), businessId: collection === "businesses" ? id : "",
    value: collection === "notifications" ? data.isRead === true ? "Read" : "Unread" : ""
  });
}

async function rowsFromQuery(query: Query, collection: string, cursor: string) {
  let ordered = query.orderBy(FieldPath.documentId());
  if (cursor) ordered = ordered.startAfter(cursor);
  const snapshot = await ordered.limit(51).get();
  const docs = snapshot.docs.slice(0, 50);
  return { rows: docs.map((doc) => workspaceRecord(collection, doc.id, doc.data())), hasMore: snapshot.size > 50, nextCursor: docs.at(-1)?.id ?? "" };
}

export async function readPublicWorkspace(section: MobileSection, id: string, cityId: string, cursor: string): Promise<MobileWorkspace> {
  const db = getFirebaseAdminDb();
  if (!db) throw new MobileError("Live activities are temporarily unavailable.", 503);
  if (section === "reviews") {
    if (!id) throw new MobileError("Choose an activity to read its reviews.");
    const listing = (await db.collection("listings").doc(id).get()).data();
    if (!listing || listing.status !== "published" || listing.approvalStatus !== "approved" || listing.isDemo === true) throw new MobileError("Activity not found.", 404);
    const business = (await db.collection("businesses").doc(mobileId(listing.businessId) || "__invalid__").get()).data();
    if (!business || business.status !== "approved" || business.isDemo === true) throw new MobileError("Activity not found.", 404);
    return mobileWorkspace({ title: mobileText(listing.title), summary: "Reviews from confirmed bookings. Attendance is not independently verified.",
      ...await rowsFromQuery(db.collection("reviews").where("listingId", "==", id).where("status", "==", "approved"), "reviews", cursor) });
  }
  const listings = filterListingCollection((await getPublicListingsForServer()).filter((item) => !item.isDemo), parseListingSearchInput({ cityId }));
  const businessIds = [...new Set(listings.map((item) => item.businessId))];
  const businesses = businessIds.length ? await db.getAll(...businessIds.map((businessId) => db.collection("businesses").doc(businessId))) : [];
  const byId = new Map(businesses.map((business) => [business.id, business.data()]));
  const located = listings.flatMap((listing) => {
    const business = byId.get(listing.businessId);
    if (!business || business.status !== "approved" || business.isDemo === true) return [];
    const url = mapLink(business.latitude, business.longitude);
    if (!url) return [];
    return [mobileRow(listing.id, { title: listing.title, subtitle: listing.cityName, detail: mobileText(business.addressLine1),
      value: `${listing.currency} ${listing.price}`, referenceId: listing.id, businessId: listing.businessId, mapUrl: url,
      mapEmbedUrl: embeddedMapLink(business.latitude, business.longitude) })];
  }).sort((a, b) => a.id.localeCompare(b.id));
  const start = cursor ? located.findIndex((item) => item.id === cursor) + 1 : 0;
  const rows = located.slice(start, start + 50);
  return mobileWorkspace({ title: "Nearby activities", summary: "Venue locations supplied by approved partners.", rows,
    hasMore: start + 50 < located.length, nextCursor: rows.at(-1)?.id ?? "" });
}

export async function readMobileWorkspace(actor: MobileActor, section: MobileSection, id: string, businessId: string, cursor: string): Promise<MobileWorkspace> {
  const { db, token } = actor;
  if (section.startsWith("admin-")) {
    requireMobileAdmin(actor);
    if (section === "admin-metrics") {
      const names = ["users", "businesses", "listings", "bookingRequests", "partnerApplications", "reviews"];
      const rows = await Promise.all(names.map(async (name) => mobileRow(name, { title: name, value: String((await db.collection(name).count().get()).data().count) })));
      return mobileWorkspace({ title: "Marketplace totals", summary: "Live document counts, not estimated revenue.", rows });
    }
    const collection = adminCollections[section];
    if (!collection) throw new MobileError("Unknown admin section.");
    const singular = ["admin-application", "admin-listing", "admin-business", "admin-user", "admin-city", "admin-category", "admin-booking", "admin-review"].includes(section);
    if (singular) {
      if (!id) return mobileWorkspace({ canEdit: section === "admin-city" || section === "admin-category" });
      const snapshot = await db.collection(collection).doc(id).get();
      const data = snapshot.data();
      if (!data) throw new MobileError("Record not found.", 404);
      const row = workspaceRecord(collection, id, data);
      return mobileWorkspace({ ...row, summary: row.subtitle, canEdit: true,
        field1: mobileText(data.name || data.businessName || data.displayName || data.title),
        field2: mobileText(data.state || data.email), field3: mobileText(data.timezone || data.slug),
        field4: mobileText(data.description || data.text), field5: mobileText(data.phone), field6: mobileText(data.website), flag: data.active !== false });
    }
    return mobileWorkspace({ title: collection, ...await rowsFromQuery(db.collection(collection), collection, cursor) });
  }
  if (section === "profile") {
    const data = (await db.collection("users").doc(token.uid).get()).data() ?? {};
    const cityId = mobileId(data.preferredCityId);
    const city = cityId ? (await db.collection("cities").doc(cityId).get()).data() : null;
    return mobileWorkspace({ id: token.uid, title: mobileText(data.displayName || token.name) || "Your account", canEdit: true,
      field1: mobileText(data.displayName || token.name), field2: mobileText(data.phone), field3: mobileId(data.preferredCityId),
      field4: mobileText(token.email), field5: city ? [mobileText(city.name), mobileText(city.state)].filter(Boolean).join(", ") : "Choose a city",
      flag: data.bookingPushEnabled !== false, summary: mobileText(token.email), status: mobileText(data.role) || "user" });
  }
  if (section === "notifications") return mobileWorkspace({ title: "Notifications", ...await rowsFromQuery(db.collection("users").doc(token.uid).collection("notifications"), "notifications", cursor) });
  if (section === "requests") return mobileWorkspace({ title: "Your booking requests", ...await rowsFromQuery(db.collection("bookingRequests").where("userId", "==", token.uid), "bookingRequests", cursor) });
  if (section === "request" || section === "partner-request" || section === "review-request") {
    const { data } = await mobileBooking(actor, id, section === "partner-request" ? "partner" : "customer");
    const row = workspaceRecord("bookingRequests", id, data);
    return mobileWorkspace({ ...row, summary: row.subtitle, canEdit: canCancelRequest(data.status), flag: canReviewRequest(data, token.uid),
      field1: mobileText(data.name), field2: mobileText(data.email), field3: mobileText(data.phone), field4: mobileText(data.message),
      field5: mobileText(data.requestedDate), field6: mobileText(data.requestedTime) });
  }
  const business = await mobileBusiness(actor, businessId);
  const billing = (await db.collection("businessBilling").doc(business.id).get()).data() ?? {};
  const entitlement = resolvePartnerEntitlement(billing);
  const tier = mobilePaidTier(entitlement);
  if (section === "business") return mobileWorkspace({ id: business.id, businessId: business.id, title: mobileText(business.data.name), canEdit: true,
    status: mobileText(business.data.status), summary: mobileText(business.data.cityName), detail: mobileText(business.data.description),
    field1: mobileText(business.data.name), field2: mobileText(business.data.phone), field3: mobileText(business.data.website),
    field4: mobileText(business.data.description), field5: mobileText(business.data.addressLine1), field6: mobileText(business.data.postalCode) });
  if (section === "partner-inbox") return mobileWorkspace({ businessId: business.id, ...await rowsFromQuery(db.collection("bookingRequests").where("businessId", "==", business.id), "bookingRequests", cursor) });
  if (section === "partner-listings") return mobileWorkspace({ businessId: business.id, ...await rowsFromQuery(db.collection("listings").where("businessId", "==", business.id), "listings", cursor) });
  if (section === "partner-listing") {
    if (!id) throw new MobileError("Choose a deal.");
    const data = (await db.collection("listings").doc(id).get()).data();
    if (!data || data.businessId !== business.id) throw new MobileError("Deal not found.", 404);
    const row = workspaceRecord("listings", id, data);
    return mobileWorkspace({ ...row, summary: row.subtitle, field1: mobileText(data.title), field2: String(data.price ?? ""),
      field3: Array.isArray(data.categoryIds) ? mobileText(data.categoryIds[0]) : "", field4: mobileText(data.description),
      field5: String(data.originalPrice ?? ""), field6: String(data.capacity ?? ""),
      startMillis: Date.parse(mobileDate(data.availableFrom)) || 0, endMillis: Date.parse(mobileDate(data.availableUntil)) || 0 });
  }
  if (section === "subscription") {
    const usage = await db.collection("listings").where("businessId", "==", business.id).where("status", "in", ["draft", "pending_approval", "published"]).count().get();
    return mobileWorkspace({ businessId: business.id, title: `${tier[0].toUpperCase()}${tier.slice(1)}`, status: entitlement.subscriptionStatus || "free",
      summary: `${usage.data().count} used / ${tier === "pro" ? "unlimited" : tier === "growth" ? "10" : "1"} active deals`,
      detail: entitlement.subscriptionCurrentPeriodEnd ? `Current period ends: ${entitlement.subscriptionCurrentPeriodEnd}` : "No active paid subscription.",
      rows: [mobileRow("starter", { title: "Starter", subtitle: "1 active deal", detail: "Booking requests and a business profile" }),
        mobileRow("growth", { title: "Growth", subtitle: "Up to 10 active deals", detail: "Analytics and featured eligibility" }),
        mobileRow("pro", { title: "Pro", subtitle: "Unlimited active deals", detail: "Team roster, advanced analytics and campaign eligibility" })] });
  }
  if (section === "team") return mobileWorkspace({ businessId: business.id, canEdit: tier === "pro", title: "Team roster", status: tier,
    summary: tier === "pro" ? "Business contacts. Roster entries do not grant account access." : "Team management requires an active Pro subscription.",
    ...(tier === "pro" ? await rowsFromQuery(db.collection("businesses").doc(business.id).collection("teamMembers"), "teamMembers", cursor) : {}) });
  if (section === "analytics") {
    const listings = db.collection("listings").where("businessId", "==", business.id);
    const requests = db.collection("bookingRequests").where("businessId", "==", business.id);
    const [stats, count, confirmed] = await Promise.all([
      listings.aggregate({ views: AggregateField.sum("viewCount"), saves: AggregateField.sum("saveCount"), clicks: AggregateField.sum("clickCount") }).get(),
      requests.count().get(), requests.where("status", "==", "confirmed").count().get()
    ]);
    const values = stats.data();
    const rows = [mobileRow("requests", { title: "Booking requests", value: String(count.data().count) }), mobileRow("confirmed", { title: "Confirmed requests", value: String(confirmed.data().count) })];
    if (tier !== "starter") rows.push(...["views", "saves", "clicks"].map((key) => mobileRow(key, { title: key, value: String(values[key as keyof typeof values] ?? 0) })));
    if (tier === "pro") rows.push(mobileRow("conversion", { title: "Request confirmation rate", value: count.data().count ? `${Math.round(confirmed.data().count / count.data().count * 100)}%` : "No requests yet" }));
    return mobileWorkspace({ businessId: business.id, title: "Activity performance", status: tier, summary: "Lifetime counters. Requests are not completed sales.", rows });
  }
  throw new MobileError("Unknown workspace section.");
}
import { resolvePartnerEntitlement } from "../partner-entitlements";
