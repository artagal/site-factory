import type { ChallengeCategory } from "../types/challenge";

export type LeaderboardEntry = {
  avatarGradient: string;
  completedChallenges: number;
  displayName: string;
  handle: string;
  momentumScore: number;
  rank: number;
  status: string;
  streak: number;
  topCategory: ChallengeCategory;
  totalXp: number;
  userId: string;
  weeklyXp: number;
};

export type CategoryLeaderEntry = {
  accent: string;
  category: ChallengeCategory;
  completedChallenges: number;
  leaderName: string;
  rankLabel: string;
  sampleMission: string;
  weeklyXp: number;
};

export type StreakLeaderEntry = {
  displayName: string;
  handle: string;
  longestStreak: number;
  recentMission: string;
  weeklyXp: number;
};

export type LeaderboardCommunityStat = {
  label: string;
  value: string;
};

export type LeaderboardSnapshot = {
  categoryLeaders: CategoryLeaderEntry[];
  communityStats: LeaderboardCommunityStat[];
  generatedFrom: "demo-community-mode" | "firestore";
  mode: "demo" | "live";
  periodId: string;
  streakLeaders: StreakLeaderEntry[];
  updatedAt: string;
  weeklyXpLeaders: LeaderboardEntry[];
};

export const demoLeaderboardSnapshot: LeaderboardSnapshot = {
  categoryLeaders: [
    {
      accent: "from-fuchsia-400 to-violet-500",
      category: "Anti-Doomscroll",
      completedChallenges: 18,
      leaderName: "No Scroll Nate",
      rankLabel: "Scroll breaker",
      sampleMission: "Phone face down, five-minute reset",
      weeklyXp: 1840
    },
    {
      accent: "from-lime-300 to-emerald-400",
      category: "Move",
      completedChallenges: 21,
      leaderName: "Maya Motion",
      rankLabel: "Motion captain",
      sampleMission: "Sunset walk, no headphones",
      weeklyXp: 2130
    },
    {
      accent: "from-cyan-300 to-blue-500",
      category: "Explore",
      completedChallenges: 16,
      leaderName: "City Wanderer",
      rankLabel: "Explorer",
      sampleMission: "New street, one photo, no posting",
      weeklyXp: 1710
    },
    {
      accent: "from-orange-300 to-pink-500",
      category: "Social",
      completedChallenges: 14,
      leaderName: "Courage Mode",
      rankLabel: "Social spark",
      sampleMission: "One genuine compliment",
      weeklyXp: 1580
    }
  ],
  communityStats: [
    { label: "weekly XP earned", value: "18,420" },
    { label: "missions completed", value: "1,284" },
    { label: "active streaks", value: "231" },
    { label: "category leaders", value: "10" }
  ],
  generatedFrom: "demo-community-mode",
  mode: "demo",
  periodId: "2026-W21",
  streakLeaders: [
    {
      displayName: "Sunset Runner",
      handle: "@sunsetrun",
      longestStreak: 14,
      recentMission: "Morning Reset",
      weeklyXp: 1420
    },
    {
      displayName: "Maya Motion",
      handle: "@maya.moves",
      longestStreak: 11,
      recentMission: "Touch Grass Sprint",
      weeklyXp: 2130
    },
    {
      displayName: "Tiny Courage",
      handle: "@tinycourage",
      longestStreak: 8,
      recentMission: "Send the voice note",
      weeklyXp: 990
    }
  ],
  updatedAt: "2026-05-23T12:00:00.000Z",
  weeklyXpLeaders: [
    {
      avatarGradient: "from-lime-300 via-emerald-300 to-cyan-300",
      completedChallenges: 42,
      displayName: "Maya Motion",
      handle: "@maya.moves",
      momentumScore: 96,
      rank: 1,
      status: "Real-life combo x7",
      streak: 11,
      topCategory: "Move",
      totalXp: 12840,
      userId: "demo-maya-motion",
      weeklyXp: 4820
    },
    {
      avatarGradient: "from-fuchsia-300 via-violet-400 to-blue-400",
      completedChallenges: 37,
      displayName: "No Scroll Nate",
      handle: "@noscrollnate",
      momentumScore: 91,
      rank: 2,
      status: "Scrolling interrupted",
      streak: 6,
      topCategory: "Anti-Doomscroll",
      totalXp: 10920,
      userId: "demo-no-scroll-nate",
      weeklyXp: 3910
    },
    {
      avatarGradient: "from-cyan-300 via-sky-400 to-indigo-400",
      completedChallenges: 31,
      displayName: "City Wanderer",
      handle: "@citywanderer",
      momentumScore: 88,
      rank: 3,
      status: "Found a new route",
      streak: 5,
      topCategory: "Explore",
      totalXp: 9440,
      userId: "demo-city-wanderer",
      weeklyXp: 3440
    },
    {
      avatarGradient: "from-orange-300 via-pink-400 to-fuchsia-400",
      completedChallenges: 24,
      displayName: "Courage Mode",
      handle: "@couragemode",
      momentumScore: 82,
      rank: 4,
      status: "Tiny courage unlocked",
      streak: 4,
      topCategory: "Social",
      totalXp: 7880,
      userId: "demo-courage-mode",
      weeklyXp: 2880
    },
    {
      avatarGradient: "from-yellow-200 via-lime-300 to-emerald-400",
      completedChallenges: 19,
      displayName: "Sunset Runner",
      handle: "@sunsetrun",
      momentumScore: 77,
      rank: 5,
      status: "Daily mission complete",
      streak: 14,
      topCategory: "Mind Reset",
      totalXp: 6210,
      userId: "demo-sunset-runner",
      weeklyXp: 2210
    }
  ]
};

export const leaderboardFirestoreShape = {
  categoryPath: "categoryLeaderboards/{category}/periods/{periodId}/entries/{userId}",
  entriesPath: "leaderboards/{periodId}/entries/{userId}",
  summaryPath: "leaderboards/{periodId}"
};
