import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getUserId = async () => {
  const raw = await AsyncStorage.getItem('userInfo');
  if (!raw) return null;
  return JSON.parse(raw)?.id ?? null;
};

/** Paginated list — page starts at 0. */
export const fetchNotifications = async (page = 0, limit = 10) => {
  const userId = await getUserId();
  if (!userId) return [];
  const offset = page * limit;
  const res = await api.get(`/notifications/${userId}?limit=${limit}&offset=${offset}`);
  return res?.data ?? res ?? [];
};

export const fetchUnreadCount = async () => {
  const userId = await getUserId();
  if (!userId) return 0;
  const res = await api.get(`/notifications/${userId}/unread-count`);
  return res?.data?.count ?? res?.count ?? 0;
};

export const markNotificationRead = async (notificationId) => {
  const userId = await getUserId();
  if (!userId) return;
  await api.put(`/notifications/${userId}/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
  const userId = await getUserId();
  if (!userId) return;
  await api.put(`/notifications/${userId}/read-all`);
};
