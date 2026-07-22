import api from './api';

export const getMatches = async () => {
  try {
    const response = await api.get('/matches');
    if (response.success && response.data) {
      // Map database format to UI expected format
      return response.data.map(match => ({
        matchId: match.id,
        matchType: match.match_type_name,
        leagueName: match.league_name,
        tournamentName: match.tournament_name,
        tournamentId: match.tournament_id,
        blockName: match.block_name, 
        startTime: match.scheduled_at,
        team1: {
          id: match.team1_id,
          name: match.team1_name,
          logoUrl: match.team1_logo,
          code: match.team1_code,
          slug: match.team1_slug,
        },
        team2: {
          id: match.team2_id,
          name: match.team2_name,
          logoUrl: match.team2_logo,
          code: match.team2_code,
          slug: match.team2_slug,
        },
        team1Score: match.team1_score,
        team2Score: match.team2_score,
        winnerSlug: match.winner_slug,
        state: match.state,
        marketStatus: match.market_status,       // 'open' | 'closed' | 'settled' | null
        marketClosesAt: match.market_closes_at,  // ISO timestamp
        // Real odds from backend (null when no market/odds exist yet).
        team1Odd: match.team1_odd ? Number(match.team1_odd) : null,
        team2Odd: match.team2_odd ? Number(match.team2_odd) : null,
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to get matches:', error);
    throw error;
  }
};

export const getMatchGames = async (matchId) => {
  try {
    const response = await api.get(`/games/match/${matchId}`);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Failed to get match games:', error);
    throw error;
  }
};

// Full single-game detail: lineups + per-player stats, MVP, key events, gold.
export const getGameDetail = async (gameId) => {
  const response = await api.get(`/games/${gameId}/detail`);
  return response.success && response.data ? response.data : null;
};
