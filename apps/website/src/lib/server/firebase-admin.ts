import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

type ServiceAccountShape = {
  clientEmail: string;
  privateKey: string;
  projectId: string;
};

function decodeServiceAccountJson() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  let parsed: {
    client_email?: string;
    clientEmail?: string;
    private_key?: string;
    privateKey?: string;
    project_id?: string;
    projectId?: string;
  };

  try {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    parsed = JSON.parse(json) as typeof parsed;
  } catch {
    return null;
  }

  return {
    clientEmail: parsed.client_email ?? parsed.clientEmail ?? "",
    privateKey: parsed.private_key ?? parsed.privateKey ?? "",
    projectId: parsed.project_id ?? parsed.projectId ?? ""
  };
}

function getServiceAccount(): ServiceAccountShape | null {
  const fromJson = decodeServiceAccountJson();
  const serviceAccount = fromJson ?? {
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    projectId: process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ""
  };

  if (!serviceAccount.clientEmail || !serviceAccount.privateKey || !serviceAccount.projectId) {
    return null;
  }

  return serviceAccount;
}

function getEmulatorProjectId() {
  if (
    process.env.NODE_ENV === "production"
    || !process.env.FIRESTORE_EMULATOR_HOST
    || !process.env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    return null;
  }

  return process.env.FIREBASE_PROJECT_ID
    ?? process.env.GCLOUD_PROJECT
    ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ?? null;
}

export function isFirebaseAdminConfigured() {
  return Boolean(getServiceAccount() || getEmulatorProjectId());
}

export function getFirebaseAdminApp(): App | null {
  if (getApps().length) return getApps()[0] ?? null;

  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId
    });
  }

  const emulatorProjectId = getEmulatorProjectId();
  return emulatorProjectId ? initializeApp({ projectId: emulatorProjectId }) : null;
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseAdminDb() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseAdminMessaging() {
  const app = getFirebaseAdminApp();
  return app ? getMessaging(app) : null;
}

export async function verifyBearerToken(request: Request) {
  const auth = getFirebaseAdminAuth();
  const header = request.headers.get("authorization") ?? "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!auth || !token) return null;

  return auth.verifyIdToken(token);
}

export { FieldValue };
