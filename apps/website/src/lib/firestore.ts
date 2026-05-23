import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseApp } from "./firebase";
import type { Challenge, ChallengeCompletion, DailyChallengeRecord } from "../types/challenge";
import type { LeaderboardSnapshot } from "./leaderboard";
import type { GoFunMotionUserProgress } from "../types/user";

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
      categoryStats: [],
      displayName: user.displayName ?? "Motion Rookie",
      email: user.email,
      favoriteCategories: [],
      isAnonymous: user.isAnonymous,
      lastLoginAt: serverTimestamp(),
      level: 1,
      momentumScore: 0,
      photoURL: user.photoURL,
      preferredCategories: [],
      recentActivity: [],
      savedChallengeIds: [],
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
    intensity: challenge.intensity,
    locationType: challenge.locationType,
    moodTags: challenge.moodTags,
    rarity: challenge.rarity,
    savedAt: serverTimestamp(),
    safetyNote: challenge.safetyNote ?? "",
    timeEstimateMinutes: challenge.timeEstimateMinutes,
    title: challenge.title,
    whyItHelps: challenge.whyItHelps,
    xpReward: challenge.xpReward
  });

  return challenge.id;
}

export async function completeChallengeInFirestore(
  userId: string,
  challenge: Challenge,
  reflection = "",
  source: ChallengeCompletion["source"] = "generator",
  xpEarned = challenge.xpReward
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
    source,
    title: challenge.title,
    xpEarned
  });
}

export async function saveCompletionToFirestore(userId: string, completion: ChallengeCompletion) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  const completionId = `${completion.challengeId}-${completion.completedAt}`.replace(/[^a-zA-Z0-9_-]/g, "-");

  return setDoc(doc(db, "users", userId, "completedChallenges", completionId), {
    category: completion.category,
    challengeId: completion.challengeId,
    completedAt: completion.completedAt,
    difficulty: completion.difficulty,
    rarity: completion.rarity,
    reflection: completion.reflection ?? "",
    source: completion.source ?? "generator",
    title: completion.title,
    xpEarned: completion.xpEarned
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

export async function syncUserProgressSummaryToFirestore(userId: string, progress: GoFunMotionUserProgress) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  return setDoc(
    doc(db, "users", userId),
    {
      badges: progress.badges.map((badge) => badge.id),
      categoryStats: progress.categoryStats,
      favoriteCategories: progress.favoriteCategories,
      lastProgressSyncAt: serverTimestamp(),
      level: progress.level,
      momentumScore: progress.momentumScore,
      recentActivity: progress.recentActivity,
      savedChallengeIds: progress.savedChallengeIds,
      streak: progress.streak,
      totalChallengesCompleted: progress.totalChallengesCompleted,
      xp: progress.xp
    },
    { merge: true }
  );
}

function toIsoString(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return new Date().toISOString();
}

function challengeFromSavedData(id: string, data: Record<string, unknown>): Challenge {
  return {
    category: (data.category as Challenge["category"]) ?? "Anti-Doomscroll",
    description: String(data.description ?? "Saved GoFunMotion mission."),
    difficulty: (data.difficulty as Challenge["difficulty"]) ?? "easy",
    id: String(data.challengeId ?? id),
    intensity: (data.intensity as Challenge["intensity"]) ?? "low",
    locationType: Array.isArray(data.locationType) ? data.locationType.map(String) : ["anywhere"],
    moodTags: Array.isArray(data.moodTags) ? data.moodTags.map(String) : ["bored"],
    rarity: (data.rarity as Challenge["rarity"]) ?? "Common",
    safetyNote: String(data.safetyNote ?? "Keep it safe, legal, respectful, and optional."),
    timeEstimateMinutes: Number(data.timeEstimateMinutes ?? 5),
    title: String(data.title ?? "Saved Mission"),
    whyItHelps: String(data.whyItHelps ?? "This mission helps interrupt passive scrolling with one real action."),
    xpReward: Number(data.xpReward ?? 30)
  };
}

function completionFromData(id: string, data: Record<string, unknown>): ChallengeCompletion {
  return {
    category: (data.category as ChallengeCompletion["category"]) ?? "Anti-Doomscroll",
    challengeId: String(data.challengeId ?? id),
    completedAt: toIsoString(data.completedAt),
    difficulty: (data.difficulty as ChallengeCompletion["difficulty"]) ?? "easy",
    reflection: String(data.reflection ?? ""),
    rarity: (data.rarity as ChallengeCompletion["rarity"]) ?? "Common",
    source: (data.source as ChallengeCompletion["source"]) ?? "generator",
    title: String(data.title ?? "Completed Mission"),
    xpEarned: Number(data.xpEarned ?? 30)
  };
}

export async function readUserProgressFromFirestore(userId: string): Promise<GoFunMotionUserProgress | null> {
  const db = getGoFunMotionDb();
  if (!db) return null;

  const userSnapshot = await getDoc(doc(db, "users", userId));
  if (!userSnapshot.exists()) return null;

  const userData = userSnapshot.data();
  const [savedSnapshot, completedSnapshot] = await Promise.all([
    getDocs(collection(db, "users", userId, "savedChallenges")),
    getDocs(collection(db, "users", userId, "completedChallenges"))
  ]);
  const savedChallenges = savedSnapshot.docs.map((savedDoc) => challengeFromSavedData(savedDoc.id, savedDoc.data()));
  const completedChallenges = completedSnapshot.docs
    .map((completionDoc) => completionFromData(completionDoc.id, completionDoc.data()))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return {
    badges: [],
    categoryStats: [],
    completedChallenges,
    displayName: String(userData.displayName ?? "Motion Rookie"),
    favoriteCategories: [],
    level: Number(userData.level ?? 1),
    momentumScore: Number(userData.momentumScore ?? 0),
    preferredCategories: Array.isArray(userData.preferredCategories) ? userData.preferredCategories : [],
    recentActivity: [],
    savedChallenges,
    savedChallengeIds: savedChallenges.map((challenge) => challenge.id),
    streak: Number(userData.streak ?? 0),
    totalChallengesCompleted: completedChallenges.length,
    xp: Number(userData.xp ?? 0)
  };
}

export async function incrementGlobalStats(db: Firestore, field: "challengesGenerated" | "challengesCompleted" | "peopleMovingToday" | "touchGrassCount") {
  // TODO: move global stat increments to a trusted Cloud Function before public launch.
  return updateDoc(doc(db, "globalStats", "main"), {
    [field]: increment(1),
    updatedAt: serverTimestamp()
  });
}

export async function getDailyChallengeFromFirestore(dateId: string) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  const snapshot = await getDoc(doc(db, "dailyChallenges", dateId));
  if (!snapshot.exists()) return null;

  return {
    date: dateId,
    ...snapshot.data()
  } as DailyChallengeRecord;
}

export async function getLeaderboardSnapshotFromFirestore(periodId: string) {
  const db = getGoFunMotionDb();
  if (!db) return null;

  const snapshot = await getDoc(doc(db, "leaderboards", periodId));
  if (!snapshot.exists()) return null;

  return {
    periodId,
    ...snapshot.data()
  } as LeaderboardSnapshot;
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
