"use client";

import { getGoFunMotionAuth } from "./auth";
import {
  completeChallengeInFirestore,
  ensureUserProfile,
  saveCompletionToFirestore,
  saveChallengeToFirestore,
  syncUserProgressSummaryToFirestore
} from "./firestore";
import { completeChallengeLocally, getLocalProgress, saveChallengeLocally } from "./localStorage";
import type { Challenge, ChallengeCompletion } from "../types/challenge";
import type { GoFunMotionUserProgress } from "../types/user";

export const progressUpdatedEvent = "gofunmotion:progress-updated";

type ProgressActionResult = {
  error?: string;
  progress: GoFunMotionUserProgress;
  requiresLogin: boolean;
  synced: boolean;
};

type BrowserEventGlobal = typeof globalThis & {
  CustomEvent?: new (type: string, eventInitDict?: { detail?: unknown }) => unknown;
  dispatchEvent?: (event: unknown) => boolean;
};

function emitProgressUpdate(progress: GoFunMotionUserProgress) {
  const browserGlobal = globalThis as BrowserEventGlobal;

  if (typeof browserGlobal.dispatchEvent === "function" && typeof browserGlobal.CustomEvent === "function") {
    browserGlobal.dispatchEvent(new browserGlobal.CustomEvent(progressUpdatedEvent, { detail: progress }));
  }
}

function getCurrentUser() {
  try {
    return getGoFunMotionAuth()?.currentUser ?? null;
  } catch {
    return null;
  }
}

function formatSyncError(error: unknown) {
  return error instanceof Error ? error.message : "Firebase sync failed.";
}

export async function saveChallengeWithSync(challenge: Challenge): Promise<ProgressActionResult> {
  const localProgress = saveChallengeLocally(challenge);
  emitProgressUpdate(localProgress);

  const user = getCurrentUser();
  if (!user) {
    return {
      progress: localProgress,
      requiresLogin: true,
      synced: false
    };
  }

  try {
    await ensureUserProfile(user);
    await saveChallengeToFirestore(user.uid, challenge);
    await syncUserProgressSummaryToFirestore(user.uid, getLocalProgress());

    return {
      progress: getLocalProgress(),
      requiresLogin: false,
      synced: true
    };
  } catch (error) {
    return {
      error: formatSyncError(error),
      progress: localProgress,
      requiresLogin: false,
      synced: false
    };
  }
}

export async function completeChallengeWithSync(
  challenge: Challenge,
  reflection = "",
  source: ChallengeCompletion["source"] = "generator"
): Promise<ProgressActionResult> {
  const localProgress = completeChallengeLocally(challenge, reflection, source);
  emitProgressUpdate(localProgress);

  const user = getCurrentUser();
  if (!user) {
    return {
      progress: localProgress,
      requiresLogin: true,
      synced: false
    };
  }

  const latestCompletion = localProgress.completedChallenges[0];

  try {
    await ensureUserProfile(user);
    await completeChallengeInFirestore(
      user.uid,
      challenge,
      reflection,
      source,
      latestCompletion?.xpEarned ?? challenge.xpReward
    );
    await syncUserProgressSummaryToFirestore(user.uid, localProgress);

    return {
      progress: localProgress,
      requiresLogin: false,
      synced: true
    };
  } catch (error) {
    return {
      error: formatSyncError(error),
      progress: localProgress,
      requiresLogin: false,
      synced: false
    };
  }
}

export async function syncLocalProgressToFirebase(): Promise<ProgressActionResult> {
  const progress = getLocalProgress();
  const user = getCurrentUser();

  if (!user) {
    return {
      progress,
      requiresLogin: true,
      synced: false
    };
  }

  try {
    await ensureUserProfile(user);
    await Promise.all(progress.savedChallenges.map((challenge) => saveChallengeToFirestore(user.uid, challenge)));
    await Promise.all(progress.completedChallenges.map((completion) => saveCompletionToFirestore(user.uid, completion)));
    await syncUserProgressSummaryToFirestore(user.uid, progress);
    emitProgressUpdate(progress);

    return {
      progress,
      requiresLogin: false,
      synced: true
    };
  } catch (error) {
    return {
      error: formatSyncError(error),
      progress,
      requiresLogin: false,
      synced: false
    };
  }
}
