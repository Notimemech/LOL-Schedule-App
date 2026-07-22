import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';

// ─── Context shape ────────────────────────────────────────────────
const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  hasMore: true,
  loading: false,
  toastQueue: [],
  loadPage: () => {},
  refresh: () => {},
  markRead: async () => {},
  markAllRead: async () => {},
  dismissToast: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

// ─── Provider ─────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const POLL_INTERVAL_MS = 30_000; // 30s

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);

  const pollRef = useRef(null);
  const prevCountRef = useRef(0);

  // ── Fetch unread count ─────────────────────────────────────────
  const syncUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);

      // If new notifications arrived → trigger toast for latest unseen
      if (count > prevCountRef.current && prevCountRef.current >= 0) {
        try {
          const latest = await fetchNotifications(0, 1);
          if (latest?.length > 0 && !latest[0].is_read) {
            pushToast(latest[0]);
            // Refresh list too
            setPage(0);
            setHasMore(true);
            const fresh = await fetchNotifications(0, PAGE_SIZE);
            setNotifications(fresh);
          }
        } catch (_) {}
      }
      prevCountRef.current = count;
    } catch (_) {}
  }, []);

  // ── Push toast ─────────────────────────────────────────────────
  const pushToast = useCallback((noti) => {
    setToastQueue((q) => [...q, { ...noti, _toastId: Date.now() + Math.random() }]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToastQueue((q) => q.filter((t) => t._toastId !== toastId));
  }, []);

  // ── Load page ──────────────────────────────────────────────────
  const loadPage = useCallback(async (pageNum = 0) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchNotifications(pageNum, PAGE_SIZE);
      if (pageNum === 0) {
        setNotifications(data);
      } else {
        setNotifications((prev) => [...prev, ...data]);
      }
      setPage(pageNum);
      setHasMore(data.length === PAGE_SIZE);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // ── Refresh (pull-to-refresh or re-focus) ──────────────────────
  const refresh = useCallback(async () => {
    setPage(0);
    setHasMore(true);
    await loadPage(0);
    await syncUnreadCount();
  }, [loadPage, syncUnreadCount]);

  // ── Mark single read ───────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (String(n.id) === String(id) ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      prevCountRef.current = Math.max(0, prevCountRef.current - 1);
    } catch (_) {}
  }, []);

  // ── Mark all read ──────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      prevCountRef.current = 0;
    } catch (_) {}
  }, []);

  // ── Polling ────────────────────────────────────────────────────
  useEffect(() => {
    syncUnreadCount();

    const startPoll = () => {
      pollRef.current = setInterval(syncUnreadCount, POLL_INTERVAL_MS);
    };
    const stopPoll = () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };

    startPoll();

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncUnreadCount();
        startPoll();
      } else {
        stopPoll();
      }
    });

    // Listen for manual "notification:new" events from within the app
    const eventSub = DeviceEventEmitter.addListener('notification:new', (noti) => {
      pushToast(noti);
      setUnreadCount((c) => c + 1);
      prevCountRef.current += 1;
      setNotifications((prev) => [{ ...noti, is_read: false }, ...prev]);
    });

    // Listen for manual sync triggers (e.g. after an API call succeeds)
    const syncSub = DeviceEventEmitter.addListener('notification:sync', () => {
      syncUnreadCount();
    });

    return () => {
      stopPoll();
      appStateSub.remove();
      eventSub.remove();
      syncSub.remove();
    };
  }, [syncUnreadCount, pushToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasMore,
        loading,
        toastQueue,
        loadPage,
        refresh,
        markRead,
        markAllRead,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
