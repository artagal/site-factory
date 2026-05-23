export function getLevelFromXp(xp: number) {
  const thresholds = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800];
  const level = thresholds.reduce((current, threshold, index) => (xp >= threshold ? index + 1 : current), 1);

  if (xp <= thresholds.at(-1)!) {
    return level;
  }

  return level + Math.floor((xp - thresholds.at(-1)!) / 2000);
}

export function getCurrentLevelProgress(xp: number) {
  const level = getLevelFromXp(xp);
  const currentFloor = level <= 10 ? [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800][level - 1] : 5800 + (level - 10) * 2000;
  const nextFloor = level < 10 ? [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800][level] : currentFloor + 2000;

  return {
    currentFloor,
    level,
    nextFloor,
    percent: Math.min(100, Math.round(((xp - currentFloor) / (nextFloor - currentFloor)) * 100))
  };
}
