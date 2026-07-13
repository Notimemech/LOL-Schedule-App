import api from './api';

export const getActivePromotion = async (userId = null) => {
  try {
    const response = await api.get('/promotions/active' + (userId ? `?userId=${userId}` : ''));
    return response; 
  } catch (error) {
    console.error('Error fetching active promotion:', error);
    return null;
  }
};

export const getAllPromotions = async (userId = null) => {
  try {
    const response = await api.get('/promotions' + (userId ? `?userId=${userId}` : ''));
    return response; 
  } catch (error) {
    console.error('Error fetching all promotions:', error);
    return { success: false, data: [] };
  }
};
