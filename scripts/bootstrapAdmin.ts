import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

function getArgValue(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is required.");

  const parsed = JSON.parse(raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")) as {
    client_email?: string;
    private_key?: string;
    project_id?: string;
  };

  if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is missing required service account fields.");
  }

  return {
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
    projectId: parsed.project_id
  };
}

async function resolveUserId() {
  const uid = getArgValue("uid")?.trim();
  if (uid) return uid;

  const email = getArgValue("email")?.trim();
  if (!email) {
    throw new Error("Pass --uid=<firebase uid> or --email=<firebase auth email>.");
  }

  const user = await getAuth().getUserByEmail(email);
  return user.uid;
}

async function main() {
  const serviceAccount = readServiceAccount();

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId
    });
  }

  const userId = await resolveUserId();
  await getFirestore()
    .collection("admins")
    .doc(userId)
    .set(
      {
        createdAt: FieldValue.serverTimestamp(),
        role: "superadmin",
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

  console.log(`Admin bootstrap complete for uid ${userId} in project ${serviceAccount.projectId}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
