import { NextResponse } from "next/server";
import { generateChallenge } from "../../../lib/challengeEngine";
import type { ChallengeFilters } from "../../../types/challenge";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<ChallengeFilters> & {
    recentChallengeIds?: string[];
  };

  const challenge = generateChallenge(body, body.recentChallengeIds ?? []);

  return NextResponse.json(challenge);
}
