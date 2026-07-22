import api from './api';

export const predictMatchAI = async (matchId) => {
  try {
    const res = await api.post('/ai/predict', { matchId });
    return res.data;
  } catch (error) {
    console.error('Error fetching AI prediction:', error);
    throw error;
  }
};

export const chatWithEsportAI = async (message, history = []) => {
  try {
    const res = await api.post('/ai/chat', { message, history });
    return res.data?.reply;
  } catch (error) {
    console.error('Error sending chat to AI:', error);
    throw error;
  }
};

export const summarizeMatchAI = async (matchId) => {
  try {
    const res = await api.post('/ai/summarize', { matchId });
    return res.data?.summary;
  } catch (error) {
    console.error('Error fetching AI match summary:', error);
    throw error;
  }
};
