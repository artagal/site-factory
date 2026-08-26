import { jsonError, jsonOk } from "../../../lib/server/api-response";
import { findCityOption, normalizeCitySelection } from "../../../lib/cities";
import { findCategoryOption, normalizeCategorySelection } from "../../../lib/categories";
import { FieldValue, getFirebaseAdminDb } from "../../../lib/server/firebase-admin";
import { getClientIp, checkRateLimit } from "../../../lib/server/rate-limit";
import { incrementServerGlobalStats } from "../../../lib/server/stats";

function clean(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`partner-application:${ip}`, 5, 60 * 60_000);
  if (!limit.allowed) return jsonError("Too many partner applications. Try again later.", 429);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const businessName = clean(body?.businessName, 120);
  const ownerName = clean(body?.ownerName, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const rawCity = clean(body?.city, 120);
  const rawCityId = clean(body?.cityId, 120);
  const rawCategory = clean(body?.category, 80);
  const rawCategoryId = clean(body?.categoryId, 120);
  const description = clean(body?.description, 800);
  const db = getFirebaseAdminDb();
  const liveCitySnapshot = db && rawCityId ? await db.collection("cities").doc(rawCityId).get() : null;
  const liveCategorySnapshot = db && rawCategoryId ? await db.collection("categories").doc(rawCategoryId).get() : null;
  const liveCityData = liveCitySnapshot?.exists ? liveCitySnapshot.data() : null;
  const liveCategoryData = liveCategorySnapshot?.exists ? liveCategorySnapshot.data() : null;
  const liveCity = liveCityData && (liveCityData.active === true || liveCityData.comingSoon === true) ? liveCityData : null;
  const liveCategory = liveCategoryData && liveCategoryData.active === true ? liveCategoryData : null;
  const knownCity = liveCity || findCityOption(rawCityId) || findCityOption(rawCity);
  const knownCategory = liveCategory || findCategoryOption(rawCategoryId) || findCategoryOption(rawCategory);
  const citySelection = liveCity
    ? {
      cityId: rawCityId,
      cityLabel: `${clean(liveCity.name, 120)}${clean(liveCity.state, 40) ? `, ${clean(liveCity.state, 40)}` : ""}`,
      cityName: clean(liveCity.name, 120),
      state: clean(liveCity.state, 40)
    }
    : normalizeCitySelection({ city: rawCity, cityId: rawCityId });
  const categorySelection = liveCategory
    ? {
      category: clean(liveCategory.name, 120),
      categoryId: rawCategoryId,
      categoryName: clean(liveCategory.name, 120)
    }
    : normalizeCategorySelection({ category: rawCategory, categoryId: rawCategoryId });
  const city = citySelection.cityLabel;
  const category = categorySelection.categoryName;

  if (!businessName || !ownerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !knownCity || !knownCategory || description.length < 20) {
    return jsonError("Add business name, owner name, valid email, selected city, selected category, and description.", 400);
  }

  const application = {
    averagePrice: clean(body?.averagePrice, 80),
    businessName,
    category,
    categoryId: categorySelection.categoryId,
    categoryName: categorySelection.categoryName,
    city,
    cityId: citySelection.cityId,
    cityName: citySelection.cityName,
    createdAt: FieldValue.serverTimestamp(),
    description,
    email,
    instagram: clean(body?.instagram, 160) || null,
    message: clean(body?.message, 800),
    offersLastMinuteDeals: Boolean(body?.offersLastMinuteDeals),
    ownerName,
    phone: clean(body?.phone, 60) || null,
    status: "new",
    updatedAt: FieldValue.serverTimestamp(),
    website: clean(body?.website, 160) || null
  };

  if (!db) {
    return jsonError("Partner applications are temporarily unavailable.", 503);
  }

  const docRef = await db.collection("partnerApplications").add(application);
  void incrementServerGlobalStats(["partnerApplications"]).catch(() => false);
  return jsonOk({ applicationId: docRef.id, synced: true }, 201);
}
