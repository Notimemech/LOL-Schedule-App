import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const USER_KEY = '@betgaming_user';

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true khi đang restore session

  // Khôi phục session khi mở app
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        console.warn('[Auth] Failed to restore session:', e.message);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (e) {
      console.warn('[Auth] Failed to persist session:', e.message);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('[Auth] Failed to clear session:', e.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
