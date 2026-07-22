import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { DeviceEventEmitter } from 'react-native';

// Backend host resolution, in priority order:
// 1. EXPO_PUBLIC_API_URL (set in frontend/.env) — explicit override, use when
//    the backend runs on a different machine than Metro.
// 2. Expo hostUri — the machine Metro runs on. NOTE: Expo computes this once
//    at `expo start`; if the computer changes network, restart Expo or the
//    app will call a stale IP and every request times out.
// 3. localhost — emulator fallback.
const host =
  Constants.expoConfig?.hostUri?.split(':')[0] ??
  'localhost';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${host}:9999/api`;
// Create an Axios instance with default configurations
const api = axios.create({
  // Use your computer's local IP address if running on a physical device
  // Defaulting to localhost for emulators
  baseURL: API_BASE_URL, 
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (__DEV__) {
      console.log(`[API REQ] ${config.method.toUpperCase()} ${config.baseURL}${config.url || ''}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // If it's a mutation (POST, PUT, DELETE) and NOT a notification poll, trigger sync
    const method = response.config?.method?.toUpperCase();
    const url = response.config?.url || '';
    if (['POST', 'PUT', 'DELETE'].includes(method) && !url.includes('unread-count')) {
      DeviceEventEmitter.emit('notification:sync');
    }

    // Return only the data payload for cleaner service calls
    return response.data;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`[API ERR] ${error.response.status} - ${error.response.config.url}`, error.response.data);
      
      // Global error handling (e.g., 401 Unauthorized)
      if (error.response.status === 401) {
        // TODO: Handle unauthorized state (e.g., clear token, navigate to login)
        console.warn('Unauthorized request - redirecting to login');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API ERR] Network Error (No response received):', error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API ERR] Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
