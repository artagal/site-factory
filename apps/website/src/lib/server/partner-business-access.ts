import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData, Firestore } from "firebase-admin/firestore";
import { jsonError } from "./api-response";
import { getFirebaseAdminDb, verifyBearerToken } from "./firebase-admin";

type PartnerBusinessAccess =
  | { business: DocumentData; db: Firestore; token: DecodedIdToken }
  | { error: Response };

export async function verifyApprovedPartnerBusiness(
  request: Request,
  businessId: string
): Promise<PartnerBusinessAccess> {
  const token = await verifyBearerToken(request);
  if (!token) return { error: jsonError("Sign in as the business owner to manage billing.", 401) };

  const db = getFirebaseAdminDb();
  if (!db) return { error: jsonError("Partner billing is not connected yet.", 503) };

  const snapshot = await db.collection("businesses").doc(businessId).get();
  const business = snapshot.data();
  const ownerIds = Array.isArray(business?.ownerIds) ? business.ownerIds.map(String) : [];

  if (!snapshot.exists || !ownerIds.includes(token.uid)) {
    return { error: jsonError("You do not have access to this business.", 403) };
  }

  if (business?.status !== "approved" || business?.isDemo === true) {
    return { error: jsonError("Business approval is required before starting a paid plan.", 403) };
  }

  return { business, db, token };
}
