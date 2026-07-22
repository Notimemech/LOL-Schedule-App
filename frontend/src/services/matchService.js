import api from './api';

// Map database format to UI expected format
const mapMatchRow = (match) => ({
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
});

export const getMatches = async () => {
  try {
    const response = await api.get('/matches');
    if (response.success && response.data) {
      return response.data.map(mapMatchRow);
    }
    return [];
  } catch (error) {
    console.error('Failed to get matches:', error);
    throw error;
  }
};

// Server-side paginated schedule. Filters run in SQL so `total` always
// matches the filtered set; the date filter is a [from, to) ISO range so
// "one day" respects the user's local timezone.
export const getMatchesPage = async ({
  limit = 10,
  offset = 0,
  state,
  matchType,
  search,
  dateFrom,
  dateTo,
} = {}) => {
  try {
    const params = { limit, offset };
    if (state) params.state = state;
    if (matchType) params.matchType = matchType;
    if (search) params.search = search;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const response = await api.get('/matches', { params });
    if (!response.success || !response.data) return { items: [], total: 0 };
    return {
      items: (response.data.items || []).map(mapMatchRow),
      total: response.data.total ?? 0,
    };
  } catch (error) {
    console.error('Failed to get matches page:', error);
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

// ===== Match follows (Companion Hub) =====


export const followMatch = async (matchId, userId) => {
  const response = await api.post(`/matches/${matchId}/follow`, { userId });
  return response.success;
};

export const unfollowMatch = async (matchId, userId) => {
  const response = await api.delete(`/matches/${matchId}/follow/${userId}`);
  return response.success;
};

// Backend returns [{ match_id, followed_at }]; screens only need the ids
// to cross-reference the already-loaded /matches list.
export const getFollowedMatchIds = async (userId) => {
  const response = await api.get(`/matches/followed/${userId}`);
  if (!response.success || !response.data) return [];
  return response.data.map((row) => Number(row.match_id));
};
