import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment,
  type Firestore
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseApp } from "./firebase";
import type { Challenge } from "../types/challenge";

export function getGoFunMotionDb() {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export async function ensureUserProfile(user: User) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  await setDoc(
    doc(db, "users", user.uid),
    {
      createdAt: serverTimestamp(),
      displayName: user.displayName ?? "Motion Rookie",
      email: user.email,
      favoriteCategories: [],
      isAnonymous: user.isAnonymous,
      lastLoginAt: serverTimestamp(),
      level: 1,
      photoURL: user.photoURL,
      preferredCategories: [],
      streak: 0,
      totalChallengesCompleted: 0,
      xp: 0
    },
    { merge: true }
  );

  return user.uid;
}

export async function saveChallengeToFirestore(userId: string, challenge: Challenge) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  await setDoc(doc(db, "users", userId, "savedChallenges", challenge.id), {
    category: challenge.category,
    challengeId: challenge.id,
    description: challenge.description,
    difficulty: challenge.difficulty,
    rarity: challenge.rarity,
    savedAt: serverTimestamp(),
    timeEstimateMinutes: challenge.timeEstimateMinutes,
    title: challenge.title,
    xpReward: challenge.xpReward
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
    difficulty: challenge.difficulty,
    rarity: challenge.rarity,
    reflection,
    source: "generator",
    title: challenge.title,
    xpEarned: challenge.xpReward
  });
}

export async function updateUserProgressInFirestore(userId: string, xpEarned: number) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  return updateDoc(doc(db, "users", userId), {
    lastLoginAt: serverTimestamp(),
    totalChallengesCompleted: increment(1),
    xp: increment(xpEarned)
  });
}

export async function incrementGlobalStats(db: Firestore, field: "challengesGenerated" | "challengesCompleted" | "peopleMovingToday" | "touchGrassCount") {
  // TODO: move global stat increments to a trusted Cloud Function before public launch.
  return updateDoc(doc(db, "globalStats", "main"), {
    [field]: increment(1),
    updatedAt: serverTimestamp()
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
