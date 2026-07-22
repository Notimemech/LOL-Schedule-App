// Pure helpers for follow-aware match ordering (Companion Hub).
// Kept out of UI components per AGENTS.md — screens only call these.

export const isMatchFollowed = (game, followedMatchIds) =>
  followedMatchIds.includes(Number(game.matchId));

export const hasFollowedTeam = (game, followedTeamIds) =>
  followedTeamIds.includes(Number(game.team1?.id)) ||
  followedTeamIds.includes(Number(game.team2?.id));

// Priority group: followed match (0) > followed team (1) > everything else (2).
const followPriority = (game, followedMatchIds, followedTeamIds) => {
  if (isMatchFollowed(game, followedMatchIds)) return 0;
  if (hasFollowedTeam(game, followedTeamIds)) return 1;
  return 2;
};

/**
 * Order upcoming matches for the Home preview: followed matches first,
 * then matches of followed teams, then the rest; soonest start time first
 * within each group. Returns a new array.
 */
export const sortUpcomingByFollowPriority = (games, followedMatchIds = [], followedTeamIds = []) =>
  [...games].sort((a, b) => {
    const diff =
      followPriority(a, followedMatchIds, followedTeamIds) -
      followPriority(b, followedMatchIds, followedTeamIds);
    if (diff !== 0) return diff;
    return new Date(a.startTime) - new Date(b.startTime);
  });

// Finished matches: most recently played first ("settled" gần → xa).
export const sortFinishedByRecency = (games) =>
  [...games].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
