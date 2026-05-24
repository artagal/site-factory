import type { DocumentData } from "firebase-admin/firestore";
import { jsonError, jsonOk } from "../../../../lib/server/api-response";
import { FieldValue, getFirebaseAdminDb, isFirebaseAdminConfigured } from "../../../../lib/server/firebase-admin";

function isAuthorized(request: Request) {
  const secret = process.env.GOFUNMOTION_ADMIN_CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("x-admin-secret") === secret;
}

function playerFromUserDoc(documentId: string, data: DocumentData) {
  return {
    avatar: String(data.displayName ?? "GM").slice(0, 2).toUpperCase(),
    category: Array.isArray(data.favoriteCategories) ? String(data.favoriteCategories[0] ?? "Anti-Doomscroll") : "Anti-Doomscroll",
    completedChallenges: Number(data.totalChallengesCompleted ?? 0),
    displayName: String(data.displayName ?? "Motion Rookie").slice(0, 64),
    momentumScore: Number(data.momentumScore ?? 0),
    rank: 0,
    streak: Number(data.streak ?? 0),
    userId: documentId,
    weeklyXp: Number(data.xp ?? 0),
    xp: Number(data.xp ?? 0)
  };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return jsonError("Admin secret required.", 401);
  }

  if (!isFirebaseAdminConfigured()) {
    return jsonError("Firebase Admin is not configured.", 503);
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return jsonError("Firestore Admin is unavailable.", 503);
  }

  const users = await db.collection("users").limit(1000).get();
  const players = users.docs.map((document) => playerFromUserDoc(document.id, document.data()));
  const weeklyXpLeaders = [...players]
    .sort((a, b) => b.weeklyXp - a.weeklyXp || b.completedChallenges - a.completedChallenges)
    .slice(0, 20)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
  const streakLeaders = [...players]
    .sort((a, b) => b.streak - a.streak || b.weeklyXp - a.weeklyXp)
    .slice(0, 20)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
  const categoryLeaders = [...players]
    .filter((entry) => entry.completedChallenges > 0)
    .sort((a, b) => b.completedChallenges - a.completedChallenges || b.weeklyXp - a.weeklyXp)
    .slice(0, 20)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  await db.collection("leaderboards").doc("live-weekly").set(
    {
      categoryLeaders,
      communityStats: [
        {
          label: "registered players",
          value: String(players.length)
        },
        {
          label: "missions completed",
          value: String(players.reduce((total, player) => total + player.completedChallenges, 0))
        },
        {
          label: "XP earned",
          value: String(players.reduce((total, player) => total + player.xp, 0))
        }
      ],
      generatedFrom: "server-admin-route",
      mode: "live",
      periodId: "live-weekly",
      streakLeaders,
      updatedAt: FieldValue.serverTimestamp(),
      weeklyXpLeaders
    },
    { merge: true }
  );

  return jsonOk({
    players: players.length,
    rebuilt: true
  });
}
