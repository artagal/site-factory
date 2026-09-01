import type { DocumentData } from "firebase-admin/firestore";
import { canCancelRequest, canReviewRequest, mobileId, mobilePaidTier, mobileText } from "../mobile-workspace";
import { resolvePartnerEntitlement } from "../partner-entitlements";
import { countLimitedListings, getPartnerTierCapabilities } from "../partner-limits";
import { slugify } from "../slug";
import { FieldValue, getFirebaseAdminAuth } from "./firebase-admin";
import { MobileError, mobileBooking, mobileBusiness, requireMobileAdmin, type MobileActor } from "./mobile-workspace-access";
import { sendPushToUsers } from "./push";
import { sendBookingStatusNotification } from "./email";

export type MobileCommand = { action: string; id: string; businessId: string; value1: string; value2: string; value3: string; value4: string; value5: string; value6: string; flag: boolean };

const actions = new Set(["profile", "notification-settings", "notification-read", "request-cancel", "partner-status", "review-submit",
  "business-profile", "partner-listing-duplicate", "team-save", "team-remove", "admin-application-reject", "admin-business-status", "admin-review-status", "admin-city-save", "admin-category-save"]);

export function parseMobileCommand(body: unknown): MobileCommand {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new MobileError("Invalid request.");
  const input = body as Record<string, unknown>;
  const action = mobileText(input.action, 80);
  if (!actions.has(action)) throw new MobileError("Unsupported action.");
  for (const field of ["id", "businessId"]) if (input[field] && !mobileId(input[field])) throw new MobileError("Invalid record identifier.");
  return { action, id: mobileId(input.id), businessId: mobileId(input.businessId), flag: input.flag === true,
    value1: mobileText(input.value1, 250), value2: mobileText(input.value2, 250), value3: mobileText(input.value3, 500),
    value4: mobileText(input.value4, 3000), value5: mobileText(input.value5, 200), value6: mobileText(input.value6, 200) };
}

function required(value: string, label: string): string {
  if (!value) throw new MobileError(`${label} is required.`);
  return value;
}

function optionalWebsite(value: string): string {
  if (!value) return "";
  let url: URL;
  try { url = new URL(value); } catch { throw new MobileError("Enter a complete HTTPS website address."); }
  if (url.protocol !== "https:" || url.username || url.password) throw new MobileError("Enter a complete HTTPS website address.");
  return url.toString();
}

function auditData(actor: MobileActor, action: string, id: string) {
  return { actorUid: actor.token.uid, action, targetId: id, targetType: action.split("-")[1] || "workspace", createdAt: FieldValue.serverTimestamp() };
}

async function changeRequestStatus(actor: MobileActor, command: MobileCommand) {
  const audience = command.action === "request-cancel" ? "customer" : "partner";
  const nextStatus = audience === "customer" ? "cancelled" : command.value1;
  if (!["contacted", "confirmed", "cancelled", "rejected"].includes(nextStatus)) throw new MobileError("Choose a valid request status.");
  const { ref } = await mobileBooking(actor, command.id, audience);
  const data = await actor.db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.data();
    if (!current) throw new MobileError("Request not found.", 404);
    if (audience === "customer" && current.userId !== actor.token.uid) throw new MobileError("Request not found.", 404);
    if (audience === "partner") {
      const business = await transaction.get(actor.db.collection("businesses").doc(mobileId(current.businessId) || "__invalid__"));
      const owners: unknown = business.data()?.ownerIds;
      if (business.data()?.status !== "approved" || !Array.isArray(owners) || !owners.includes(actor.token.uid)) throw new MobileError("Business access was removed.", 403);
    }
    if (current.status === nextStatus) return null;
    if (!canCancelRequest(current.status) || (current.status === "confirmed" && nextStatus !== "cancelled")) throw new MobileError("This status transition is not available.", 409);
    transaction.update(ref, { status: nextStatus, updatedAt: FieldValue.serverTimestamp(), lastStatusChangedAt: FieldValue.serverTimestamp(), lastStatusChangedBy: actor.token.uid });
    return current;
  });
  if (!data) return { id: command.id, message: `Request is already ${nextStatus}.` };
  // The request stays saved even when a provider cannot deliver the notification.
  const owners = await actor.db.collection("businesses").doc(mobileId(data.businessId) || "__invalid__").get();
  const ownerIds: string[] = Array.isArray(owners.data()?.ownerIds) ? owners.data()!.ownerIds.map(String) : [];
  const push = await sendPushToUsers({ title: `Request ${nextStatus}`, body: `${mobileText(data.listingTitle) || "Activity request"}: ${nextStatus}`,
    notificationId: `booking-status-${nextStatus}-${command.id}`, data: { bookingRequestId: command.id, status: nextStatus, type: "booking_status_changed" },
    userIds: audience === "customer" ? [...ownerIds, actor.token.uid] : [mobileId(data.userId)]
  }).catch(() => null);
  const email = await sendBookingStatusNotification({ requestId: command.id, status: nextStatus as "contacted" | "confirmed" | "cancelled" | "rejected",
    request: { name: mobileText(data.name), email: mobileText(data.email), phone: mobileText(data.phone), businessName: mobileText(data.businessName),
      listingId: mobileId(data.listingId), listingTitle: mobileText(data.listingTitle), requestedDate: mobileText(data.requestedDate), requestedTime: mobileText(data.requestedTime), partySize: Number(data.partySize) || 1, message: mobileText(data.message) }
  }).catch(() => null);
  await ref.set({ lastStatusNotificationStatus: email?.status ?? "failed", lastStatusPushResult: push, lastStatusNotificationUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { id: command.id, message: `Request ${nextStatus}.`, notificationStatus: email?.status ?? "failed" };
}

export async function writeMobileWorkspace(actor: MobileActor, command: MobileCommand) {
  const { db, token } = actor;
  const now = FieldValue.serverTimestamp();
  if (command.action.startsWith("admin-")) requireMobileAdmin(actor);
  switch (command.action) {
    case "profile": {
      const displayName = required(command.value1, "Name");
      if (command.value3) {
        const city = await db.collection("cities").doc(mobileId(command.value3) || "__invalid__").get();
        if (!city.exists || city.data()?.active !== true) throw new MobileError("Select an active city from the list.");
      }
      await db.collection("users").doc(token.uid).set({ displayName, phone: command.value2, preferredCityId: command.value3 || null, onboardingCompleted: true, updatedAt: now }, { merge: true });
      return { id: token.uid, message: "Profile saved." };
    }
    case "notification-settings":
      await db.collection("users").doc(token.uid).set({ bookingPushEnabled: command.flag, updatedAt: now }, { merge: true });
      return { message: "Notification preference saved." };
    case "notification-read": {
      const ref = db.collection("users").doc(token.uid).collection("notifications").doc(required(command.id, "Notification"));
      if (!(await ref.get()).exists) throw new MobileError("Notification not found.", 404);
      await ref.update({ isRead: true, updatedAt: now });
      return { message: "Marked as read." };
    }
    case "request-cancel":
    case "partner-status": return changeRequestStatus(actor, command);
    case "review-submit": {
      const rating = Number(command.value1);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new MobileError("Choose a rating from 1 to 5.");
      if (command.value4.length < 10) throw new MobileError("Add at least 10 characters about your experience.");
      const { ref } = await mobileBooking(actor, command.id, "customer");
      const reviewRef = db.collection("reviews").doc(command.id);
      await db.runTransaction(async (transaction) => {
        const [booking, review] = await Promise.all([transaction.get(ref), transaction.get(reviewRef)]);
        const data = booking.data() ?? {};
        if (!canReviewRequest(data, token.uid)) throw new MobileError("Reviews open after a confirmed booking date has passed.", 403);
        if (review.exists) throw new MobileError("A review has already been submitted for this booking.", 409);
        transaction.create(reviewRef, { userId: token.uid, bookingRequestId: command.id, businessId: mobileId(data.businessId), listingId: mobileId(data.listingId),
          listingTitle: mobileText(data.listingTitle), authorName: mobileText(data.name).split(" ")[0] || "Customer", rating, text: command.value4, status: "pending", createdAt: now, updatedAt: now });
      });
      return { id: command.id, message: "Review submitted for moderation." };
    }
    case "business-profile": {
      const business = await mobileBusiness(actor, command.businessId);
      required(command.value1, "Business name");
      const website = optionalWebsite(command.value3);
      await db.collection("businesses").doc(business.id).update({ name: command.value1, phone: command.value2, website,
        description: command.value4, addressLine1: command.value5, postalCode: command.value6, updatedAt: now });
      return { id: business.id, message: "Business profile saved." };
    }
    case "partner-listing-duplicate": {
      const business = await mobileBusiness(actor, command.businessId);
      const sourceRef = db.collection("listings").doc(required(command.id, "Deal"));
      const source = (await sourceRef.get()).data();
      if (!source || mobileId(source.businessId) !== business.id) throw new MobileError("Deal not found.", 404);

      const listings = await db.collection("listings").where("businessId", "==", business.id).get();
      const activeCount = countLimitedListings(listings.docs.map((item) => ({ id: item.id, status: mobileText(item.data().status) })));
      const billing = (await db.collection("businessBilling").doc(business.id).get()).data() ?? {};
      const capabilities = getPartnerTierCapabilities(resolvePartnerEntitlement(billing));
      if (Number.isFinite(capabilities.activeListings) && activeCount >= capabilities.activeListings) {
        throw new MobileError(`${capabilities.label} is limited to ${capabilities.activeListings} active ${capabilities.activeListings === 1 ? "deal" : "deals"}. Upgrade or pause an existing listing.`, 402);
      }

      const copyRef = db.collection("listings").doc();
      const copiedFields = [
        "businessId", "businessName", "cityId", "cityName", "description", "shortDescription", "listingType",
        "categoryIds", "vibeTags", "groupTypes", "indoorOutdoor", "durationMinutes", "price", "originalPrice", "currency",
        "budgetTier", "capacity", "images", "terms", "cancellationNote", "bookingMode", "bookingUrl", "phone", "email",
        "groupSize", "whyItFits", "ownerIds"
      ] as const;
      const copy: Record<string, unknown> = {};
      for (const field of copiedFields) if (source[field] !== undefined) copy[field] = source[field];
      const sourceTitle = mobileText(source.title, 120) || "Last-minute deal";
      await copyRef.set({
        ...copy,
        id: copyRef.id,
        title: `${sourceTitle.slice(0, 111)} (copy)`,
        slug: `${slugify(sourceTitle) || "last-minute-deal"}-${copyRef.id.slice(0, 6)}`,
        status: "draft",
        approvalStatus: "pending",
        availableFrom: null,
        availableUntil: null,
        availableDays: [],
        availableSlots: [],
        remainingSpots: null,
        discountPercent: source.discountPercent ?? null,
        featured: false,
        promoted: false,
        viewCount: 0,
        saveCount: 0,
        requestCount: 0,
        clickCount: 0,
        duplicatedFromListingId: sourceRef.id,
        createdAt: now,
        updatedAt: now
      });
      return { id: copyRef.id, businessId: business.id, message: "Draft copy created. Add new availability before submitting it for review." };
    }
    case "team-save":
    case "team-remove": {
      const business = await mobileBusiness(actor, command.businessId);
      const billing = (await db.collection("businessBilling").doc(business.id).get()).data() ?? {};
      if (mobilePaidTier(resolvePartnerEntitlement(billing)) !== "pro") throw new MobileError("An active Pro subscription is required.", 403);
      const collection = db.collection("businesses").doc(business.id).collection("teamMembers");
      const ref = command.id ? collection.doc(command.id) : collection.doc();
      if (command.action === "team-remove") {
        required(command.id, "Team member");
        await ref.delete();
      } else {
        required(command.value1, "Team member name");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(command.value2)) throw new MobileError("Enter a valid contact email.");
        await ref.set({ name: command.value1, email: command.value2.toLowerCase(), description: command.value3, active: true, updatedAt: now, updatedBy: token.uid }, { merge: true });
      }
      return { id: ref.id, message: command.action === "team-remove" ? "Team member removed." : "Team member saved." };
    }
    case "admin-application-reject": {
      const ref = db.collection("partnerApplications").doc(required(command.id, "Application"));
      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) throw new MobileError("Application not found.", 404);
        if (snapshot.data()?.approvedBusinessId) throw new MobileError("Manage the existing business instead of rejecting its application.", 409);
        transaction.update(ref, { status: "rejected", rejectionReason: required(command.value4, "Review reason"), reviewedBy: token.uid, updatedAt: now });
        transaction.create(db.collection("adminAuditLogs").doc(), auditData(actor, command.action, ref.id));
      });
      return { message: "Application rejected." };
    }
    case "admin-business-status":
    case "admin-review-status": {
      const business = command.action === "admin-business-status";
      if (!(business ? ["approved", "rejected", "suspended"] : ["approved", "rejected", "hidden"]).includes(command.value1)) throw new MobileError("Choose a valid moderation status.");
      const ref = db.collection(business ? "businesses" : "reviews").doc(required(command.id, "Record"));
      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) throw new MobileError("Record not found.", 404);
        transaction.update(ref, { status: command.value1, moderationReason: command.value4, reviewedBy: token.uid, updatedAt: now });
        transaction.create(db.collection("adminAuditLogs").doc(), auditData(actor, command.action, ref.id));
      });
      return { message: `Status updated to ${command.value1}.` };
    }
    case "admin-city-save":
    case "admin-category-save": {
      const city = command.action === "admin-city-save";
      const name = required(command.value1, "Name");
      const slug = slugify(name);
      if (!slug) throw new MobileError("Enter a valid name.");
      const state = city ? required(command.value2, "State / region").toUpperCase() : "";
      if (city && !/^[A-Z]{2}$/.test(state)) throw new MobileError("Use the two-letter US state code, for example FL or CA.");
      const timezone = city ? required(command.value3, "Time zone") : "";
      if (city) try { new Intl.DateTimeFormat("en", { timeZone: timezone }); } catch { throw new MobileError("Enter a valid IANA time zone."); }
      const normalizedKey = city ? `${slug}|${slugify(state)}|us` : slug;
      const collection = db.collection(city ? "cities" : "categories");
      const identity = db.collection("marketplaceIdentities").doc(`${city ? "city" : "category"}-${slugify(normalizedKey)}`);
      const existing = city ? await collection.where("normalizedKey", "==", normalizedKey).limit(1).get() : null;
      const legacy = city && existing?.empty ? await collection.doc(slug).get() : null;
      const legacyMatches = legacy?.exists && slugify(mobileText(legacy.data()?.name)) === slug &&
        slugify(mobileText(legacy.data()?.state)) === slugify(state) &&
        slugify(mobileText(legacy.data()?.country) || "US") === "us";
      const fallbackId = existing?.docs[0]?.id || (legacyMatches ? legacy.id : city ? `${slug}-${slugify(state)}-us` : slug);
      const id = await db.runTransaction(async (transaction) => {
        const canonical = await transaction.get(identity);
        const targetId = mobileId(canonical.data()?.recordId) || command.id || fallbackId;
        if (command.id && targetId !== command.id) throw new MobileError("This city or category already exists.", 409);
        const ref = collection.doc(targetId);
        const snapshot = await transaction.get(ref);
        const fields: DocumentData = city
          ? { state, country: "US", timezone, normalizedKey, normalizedName: slug, normalizedState: slugify(state), normalizedCountry: "us", comingSoon: !command.flag }
          : { icon: "Sparkles", accentColor: "#bdf264", sortOrder: 100 };
        if (city && snapshot.exists) {
          const current = snapshot.data() ?? {};
          const currentKey = current.normalizedKey || `${slugify(mobileText(current.name))}|${slugify(mobileText(current.state))}|${slugify(mobileText(current.country) || "US")}`;
          if (currentKey !== normalizedKey) throw new MobileError("City identity cannot change. Create a separate city instead.", 409);
        }
        transaction.set(ref, { ...fields, name, slug: targetId, description: command.value4, active: command.flag, updatedAt: now,
          ...snapshot.exists ? {} : { createdAt: now } }, { merge: true });
        transaction.set(identity, { recordId: targetId, normalizedKey });
        transaction.create(db.collection("adminAuditLogs").doc(), auditData(actor, command.action, targetId));
        return targetId;
      });
      return { id, message: city ? "City saved." : "Category saved." };
    }
  }
  throw new MobileError("Unsupported action.");
}

export async function ensureMobileDeletionAllowed(actor: MobileActor): Promise<void> {
  if (!actor.token.auth_time || Date.now() / 1000 - actor.token.auth_time > 300) throw new MobileError("Sign out and sign in again before deleting your account.", 401);
  if (actor.isAdmin) throw new MobileError("Transfer administrator access before requesting account deletion.", 409);
  const businesses = await actor.db.collection("businesses").where("ownerIds", "array-contains", actor.token.uid).limit(1).get();
  if (!businesses.empty) throw new MobileError("Contact support to close or transfer your business before deleting your account.", 409);
  if (!getFirebaseAdminAuth()) throw new MobileError("Account deletion is unavailable.", 503);
}
