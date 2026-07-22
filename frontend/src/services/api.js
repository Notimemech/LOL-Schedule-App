import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { DeviceEventEmitter } from 'react-native';
import { Platform } from 'react-native';

const host = Platform.OS === 'web'
  ? 'localhost'
  : (Constants.expoConfig?.hostUri?.split(':')[0] ?? '192.168.18.111');

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${host}:9999/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (__DEV__) {
      console.log(`[API REQ] ${config.method.toUpperCase()} ${config.baseURL}${config.url || ''}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      console.error(`[API ERR] ${error.response.status} - ${error.response.config.url}`, error.response.data);
      if (error.response.status === 401) {
        console.warn('Unauthorized request');
      }
    } else if (error.request) {
      console.error('[API ERR] Network Error (No response received):', error.message);
    } else {
      console.error('[API ERR] Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
