/**
 * Generate editorial headlines based on team performance
 */
export function generateEditorialHeadline(stats: {
  wins: number;
  losses: number;
  ties: number;
  gamesRemaining: number;
}): { line1: string; line2: string; line3: string } {
  const { wins, losses, ties, gamesRemaining } = stats;
  const totalPlayed = wins + losses + ties;
  const winRate = totalPlayed > 0 ? wins / totalPlayed : 0;

  // Undefeated
  if (wins >= 3 && losses === 0 && ties === 0) {
    return {
      line1: "Perfect start,",
      line2: "unbeaten streak,",
      line3: `${gamesRemaining} to conquer.`,
    };
  }

  // Strong start
  if (winRate >= 0.75 && totalPlayed >= 3) {
    return {
      line1: `${wins} victories,`,
      line2: "momentum building,",
      line3: `${gamesRemaining} battles ahead.`,
    };
  }

  // Mixed record
  if (winRate >= 0.5 && totalPlayed >= 3) {
    const winsWord = wins === 1 ? "win" : "wins";
    const lossWord = losses === 1 ? "loss" : losses === 0 ? "losses" : "losses";
    return {
      line1: `${wins} ${winsWord},`,
      line2: `${losses === 0 ? "no" : losses === 1 ? "one" : losses} ${lossWord},`,
      line3: `${gamesRemaining} to play.`,
    };
  }

  // Struggling
  if (winRate < 0.5 && totalPlayed >= 3) {
    return {
      line1: "Season tested,",
      line2: "resolve unbroken,",
      line3: `${gamesRemaining} chances left.`,
    };
  }

  // Early season (< 3 games)
  if (totalPlayed < 3) {
    return {
      line1: "Season begins,",
      line2: "squad assembled,",
      line3: `${gamesRemaining} matches await.`,
    };
  }

  // Default
  return {
    line1: `${wins} won,`,
    line2: `${losses} lost,`,
    line3: `${gamesRemaining} to go.`,
  };
}

/**
 * Calculate current week number in season
 */
export function calculateSeasonWeek(
  seasonStart: Date,
  seasonEnd: Date,
  now: Date = new Date()
): { currentWeek: number; totalWeeks: number } {
  const startTime = seasonStart.getTime();
  const endTime = seasonEnd.getTime();
  const nowTime = now.getTime();

  // If before season, return week 0
  if (nowTime < startTime) {
    const totalWeeks = Math.ceil((endTime - startTime) / (7 * 24 * 60 * 60 * 1000));
    return { currentWeek: 0, totalWeeks };
  }

  // If after season, return last week
  if (nowTime > endTime) {
    const totalWeeks = Math.ceil((endTime - startTime) / (7 * 24 * 60 * 60 * 1000));
    return { currentWeek: totalWeeks, totalWeeks };
  }

  // Calculate current week
  const elapsed = nowTime - startTime;
  const currentWeek = Math.ceil(elapsed / (7 * 24 * 60 * 60 * 1000));
  const totalWeeks = Math.ceil((endTime - startTime) / (7 * 24 * 60 * 60 * 1000));

  return { currentWeek, totalWeeks };
}

/**
 * Calculate days until a future date
 */
export function daysUntil(futureDate: Date, now: Date = new Date()): number {
  const diff = futureDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get short team name (last word)
 */
export function getShortTeamName(fullName: string): string {
  const words = fullName.trim().split(" ");
  return words[words.length - 1];
}

/**
 * Get short venue name (first part before comma or full if no comma)
 */
export function getShortVenueName(fullVenue: string): string {
  const parts = fullVenue.split(",");
  return parts[0].trim();
}
