import { FieldValue, getFirebaseAdminDb, getFirebaseAdminMessaging } from "./firebase-admin";

export type PushDeliveryResult = {
  attempted: number;
  failed: number;
  inAppCreated: number;
  sent: number;
  status: "sent" | "partial" | "skipped";
};

type PushInput = {
  body: string;
  data?: Record<string, string>;
  notificationId: string;
  title: string;
  userIds: string[];
};

function clean(value: string, max = 220) {
  return value.trim().slice(0, max);
}

export async function sendPushToUsers(input: PushInput): Promise<PushDeliveryResult> {
  const db = getFirebaseAdminDb();
  const userIds = [...new Set(input.userIds.map((value) => clean(value, 160)).filter(Boolean))];
  if (!db || !userIds.length) {
    return { attempted: 0, failed: 0, inAppCreated: 0, sent: 0, status: "skipped" };
  }

  const title = clean(input.title, 120);
  const body = clean(input.body, 300);
  const notificationId = clean(input.notificationId.replace(/[^a-zA-Z0-9_-]/g, "-"), 180);
  const inAppWrites = userIds.map((userId) => db.collection("users").doc(userId).collection("notifications").doc(notificationId).set({
    body,
    createdAt: FieldValue.serverTimestamp(),
    data: input.data ?? {},
    isRead: false,
    title,
    type: input.data?.type ?? "booking_update",
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true }));
  await Promise.all(inAppWrites);

  const profiles = await db.getAll(...userIds.map((userId) => db.collection("users").doc(userId)));
  const pushUserIds = profiles.filter((profile) => profile.data()?.bookingPushEnabled !== false).map((profile) => profile.id);
  const tokenSnapshots = await Promise.all(pushUserIds.map((userId) => (
    db.collection("users").doc(userId).collection("deviceTokens").get()
  )));
  const targets = tokenSnapshots.flatMap((snapshot) => snapshot.docs
    .filter((tokenDoc) => tokenDoc.data().enabled !== false && typeof tokenDoc.data().token === "string")
    .map((tokenDoc) => ({ ref: tokenDoc.ref, token: String(tokenDoc.data().token) })))
    .slice(0, 500);
  const messaging = getFirebaseAdminMessaging();

  if (!messaging || !targets.length) {
    return { attempted: 0, failed: 0, inAppCreated: userIds.length, sent: 0, status: "skipped" };
  }

  const response = await messaging.sendEachForMulticast({
    android: { priority: "high" },
    apns: { payload: { aps: { sound: "default" } } },
    data: input.data ?? {},
    notification: { body, title },
    tokens: targets.map((target) => target.token)
  });

  const invalidRefs = response.responses.flatMap((item, index) => {
    const code = item.error?.code ?? "";
    return code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token"
      ? [targets[index].ref]
      : [];
  });
  await Promise.all(invalidRefs.map((ref) => ref.delete()));

  return {
    attempted: targets.length,
    failed: response.failureCount,
    inAppCreated: userIds.length,
    sent: response.successCount,
    status: response.failureCount === 0 ? "sent" : response.successCount > 0 ? "partial" : "skipped"
  };
}
