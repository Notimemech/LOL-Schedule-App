import api from './api';

export const registerUser = async (payload) => {
  try {
    const response = await api.post('/auth/register', payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (payload) => {
  try {
    const response = await api.post('/auth/login', payload);
    return response;
  } catch (error) {
    throw error;
  }
};
