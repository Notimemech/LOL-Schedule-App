import api from './api';

// Companion Hub endpoints — team profiles, head-to-head, standings, follows.
// All aggregation happens on the backend; these functions only map shapes.

export const getTeamProfile = async (slug, userId = null) => {
  const response = await api.get(`/teams/${slug}/profile`, {
    params: userId ? { userId } : {},
  });
  if (!response.success || !response.data) return null;
  return response.data;
};

export const getHeadToHead = async (team1Id, team2Id) => {
  const response = await api.get(`/teams/h2h/${team1Id}/${team2Id}`);
  if (!response.success || !response.data) return null;
  return response.data;
};

export const getTournamentStandings = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/standings`);
  return response.success && response.data ? response.data : [];
};

export const followTeam = async (teamId, userId) => {
  const response = await api.post(`/teams/${teamId}/follow`, { userId });
  return response.success;
};

export const unfollowTeam = async (teamId, userId) => {
  const response = await api.delete(`/teams/${teamId}/follow/${userId}`);
  return response.success;
};

export const getFollowedTeams = async (userId) => {
  const response = await api.get(`/teams/followed/${userId}`);
  return response.success && response.data ? response.data : [];
};

// ===== Explore tab =====

export const getAllTeamsList = async () => {
  const response = await api.get('/teams');
  return response.success && response.data ? response.data : [];
};

// Tournaments with their participating teams (teams derived from matches).
export const getExploreTournaments = async () => {
  const response = await api.get('/tournaments/explore');
  return response.success && response.data ? response.data : [];
};
