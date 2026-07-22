import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fetch a single user by ID.
 * @param {number|string} userId
 */
export const getUserById = async (userId) => {
  const res = await api.get(`/users/${userId}`);
  return res.data ?? res;
};

/**
 * Update a user's profile fields.
 * Only the fields that are passed will be changed — backend merges the diff.
 *
 * @param {number|string} userId
 * @param {{ full_name?: string, gender?: string, date_of_birth?: string, email?: string, pronoun?: string }} payload
 */
export const updateUserProfile = async (userId, payload) => {
  const res = await api.put(`/users/${userId}`, payload);
  return res.data ?? res;
};

/**
 * Soft-delete (or hard-delete) the current user account.
 * @param {number|string} userId
 */
export const deleteUserAccount = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data ?? res;
};

/**
 * Convenience: get the stored user id from AsyncStorage.
 * Returns null if not logged in.
 */
export const getStoredUserId = async () => {
  try {
    const raw = await AsyncStorage.getItem('userInfo');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.id ?? null;
  } catch {
    return null;
  }
};
