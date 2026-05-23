import type { ChallengeCompletion } from "../types/challenge";
import type { GoFunMotionBadge } from "../types/user";

export const badgeCatalog: GoFunMotionBadge[] = [
  { id: "first-motion", name: "First Motion", description: "Complete your first real-life mission." },
  { id: "first-step", name: "First Step", description: "Start your GoFunMotion history." },
  { id: "touch-grass", name: "Touch Grass", description: "Complete your first outdoor or movement challenge." },
  { id: "social-spark", name: "Social Spark", description: "Complete a social challenge." },
  { id: "explorer", name: "Explorer", description: "Complete an explore challenge." },
  { id: "mind-reset", name: "Mind Reset", description: "Complete a mind reset challenge." },
  { id: "no-scroll-hero", name: "No Scroll Hero", description: "Complete an anti-doomscroll challenge." },
  { id: "scroll-breaker", name: "Scroll Breaker", description: "Complete 10 total challenges." },
  { id: "real-life-rookie", name: "Real Life Rookie", description: "Earn 500 XP." },
  { id: "momentum-builder", name: "Momentum Builder", description: "Earn 1,000 XP." },
  { id: "courage-mode", name: "Courage Mode", description: "Complete a confidence challenge." },
  { id: "city-wanderer", name: "City Wanderer", description: "Complete 3 explore challenges." },
  { id: "three-day-momentum", name: "3-Day Momentum", description: "Keep motion going for 3 days." },
  { id: "seven-day-streak", name: "7-Day Streak", description: "Build a week of real-life momentum." }
];

export function calculateBadges(completions: ChallengeCompletion[], streak: number) {
  const badgeIds = new Set<string>();
  const xp = completions.reduce((total, completion) => total + completion.xpEarned, 0);

  if (completions.length > 0) {
    badgeIds.add("first-motion");
    badgeIds.add("first-step");
  }
  if (completions.some((completion) => completion.category === "Move" || completion.category === "Fitness")) badgeIds.add("touch-grass");
  if (completions.some((completion) => completion.category === "Social")) badgeIds.add("social-spark");
  if (completions.some((completion) => completion.category === "Explore")) badgeIds.add("explorer");
  if (completions.some((completion) => completion.category === "Mind Reset")) badgeIds.add("mind-reset");
  if (completions.some((completion) => completion.category === "Anti-Doomscroll")) badgeIds.add("no-scroll-hero");
  if (completions.some((completion) => completion.category === "Confidence")) badgeIds.add("courage-mode");
  if (completions.length >= 10) badgeIds.add("scroll-breaker");
  if (xp >= 500) badgeIds.add("real-life-rookie");
  if (xp >= 1000) badgeIds.add("momentum-builder");
  if (completions.filter((completion) => completion.category === "Explore").length >= 3) badgeIds.add("city-wanderer");
  if (streak >= 3) badgeIds.add("three-day-momentum");
  if (streak >= 7) badgeIds.add("seven-day-streak");

  return badgeCatalog.filter((badge) => badgeIds.has(badge.id));
}
