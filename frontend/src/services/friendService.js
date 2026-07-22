import api from './api';

// Friends & friend bets (honor wagers) endpoints.

// Full profile (includes tag) for sessions stored before tags existed.
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.success && response.data ? response.data : null;
};

export const searchByHandle = async (userId, handle) => {
  const response = await api.get('/friends/search', { params: { userId, handle } });
  return response.success && response.data ? response.data : null;
};

export const sendFriendRequest = async (userId, handle) => {
  const response = await api.post('/friends/requests', { userId, handle });
  return response.success;
};

export const acceptFriendRequest = async (requestId, userId) => {
  const response = await api.post(`/friends/requests/${requestId}/accept`, { userId });
  return response.success;
};

// Declining a pending request and unfriending share the same endpoint.
export const removeFriendship = async (friendshipId, userId) => {
  const response = await api.delete(`/friends/${friendshipId}/${userId}`);
  return response.success;
};

// Returns { friends, incoming, outgoing }
export const getFriendsOverview = async (userId) => {
  const response = await api.get(`/friends/overview/${userId}`);
  return response.success && response.data
    ? response.data
    : { friends: [], incoming: [], outgoing: [] };
};

export const changeTag = async (userId, tag) => {
  const response = await api.put(`/friends/tag/${userId}`, { tag });
  return response.success && response.data ? response.data : null;
};

// ===== Friend bets =====

export const createFriendBet = async ({ creatorId, opponentId, matchId, name, stakeLabel, creatorTeamId }) => {
  const response = await api.post('/friends/bets', {
    creatorId,
    opponentId,
    matchId,
    name,
    stakeLabel,
    creatorTeamId,
  });
  return response.success && response.data ? response.data : null;
};

// Returns { bets, tally: { myWins, friendWins, active, voids } }
export const getFriendHeadToHead = async (userId, friendId) => {
  const response = await api.get(`/friends/bets/h2h/${userId}/${friendId}`);
  return response.success && response.data ? response.data : { bets: [], tally: null };
};

// Returns { slides: [{ title, text, highlight }], generatedBy }
export const getFriendWrapped = async (userId, friendId) => {
  const response = await api.post(`/friends/bets/wrapped/${userId}/${friendId}`);
  return response.success && response.data ? response.data : null;
};
