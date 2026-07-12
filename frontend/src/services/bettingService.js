import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const MIN_STAKE_VND = 10000;
export const MAX_STAKE_VND = 10000000;

const getCurrentUserId = async () => {
  try {
    const storedUserInfo = await AsyncStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedUser = JSON.parse(storedUserInfo);
      const userId = parsedUser?.id || parsedUser?.userId || parsedUser?.user_id || parsedUser?.user?.id;
      if (userId) return Number(userId);
    }
  } catch (error) {
    console.error('Failed to read current user id:', error);
  }

  return null;
};

export const placeBet = async (matchId, marketId, outcomeId, wagerAmount) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const response = await api.post('/bets/place', {
      userId,
      market_id: marketId,
      option_key: outcomeId,
      amount: wagerAmount
    });
    return {
      success: true,
      bet: response.data,
      message: 'Bet placed successfully!'
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to place bet');
  }
};

export const cancelBet = async (betId) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const response = await api.post(`/bets/${betId}/cancel`, {
      userId
    });
    return {
      success: true,
      message: 'Bet cancelled successfully!'
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel bet');
  }
};

export const getWalletBalance = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return 0;

    const response = await api.get(`/wallet/${userId}`);
    if (response.success && response.data) {
      return parseFloat(response.data.balance);
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch wallet balance:', error);
    return 0; // Return 0 if wallet fails or doesn't exist
  }
};

export const getBetHistory = async (matchId) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const response = await api.get(`/bets/history/${userId}`);
    if (response.success && response.data) {
      // Filter for this match on the frontend, or the backend should do it.
      // Assuming backend returns all user bets
      return response.data
        .filter(bet => bet.match_id === matchId)
        .map(bet => ({
          id: bet.id,
          matchId: bet.match_id,
          market: bet.market_type,
          marketId: bet.market_id,
          outcomeId: bet.option_key,
          amount: parseFloat(bet.amount),
          payout: parseFloat(bet.potential_win), // Or payout_amount if settled
          status: bet.status === 'pending' ? 'Accepted' : (bet.status === 'won' || bet.status === 'lost' ? bet.status.toUpperCase() : 'Cancelled'),
          date: bet.placed_at
        }));
    }
    return [];
  } catch (error) {
    console.error('Failed to load bet history:', error);
    return [];
  }
};

export const getMatchMarketsAndOdds = async (matchId) => {
  try {
    const response = await api.get(`/bets/markets/${matchId}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to get match markets:', error);
    return [];
  }
};
