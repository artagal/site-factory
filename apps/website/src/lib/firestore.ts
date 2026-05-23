import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { getFirebaseApp } from "./firebase";
import type { Challenge } from "../types/challenge";

export function getGoFunMotionDb() {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export async function saveChallengeToFirestore(userId: string, challenge: Challenge) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  await setDoc(doc(db, "users", userId, "savedChallenges", challenge.id), {
    challengeId: challenge.id,
    savedAt: serverTimestamp()
  });

  return challenge.id;
}

export async function completeChallengeInFirestore(
  userId: string,
  challenge: Challenge,
  reflection = ""
) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  return addDoc(collection(db, "users", userId, "completedChallenges"), {
    category: challenge.category,
    challengeId: challenge.id,
    completedAt: serverTimestamp(),
    reflection,
    title: challenge.title,
    xpEarned: challenge.xpReward
  });
}

export async function addWaitlistEntry(email: string, interests: string[], source = "website") {
  const db = getGoFunMotionDb();
  if (!db) return null;

  return addDoc(collection(db, "waitlist"), {
    createdAt: serverTimestamp(),
    email,
    interests,
    source
  });
}
