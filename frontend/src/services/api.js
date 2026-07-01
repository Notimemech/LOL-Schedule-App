import axios from 'axios';

// Create an Axios instance with default configurations
const api = axios.create({
  // Use your computer's local IP address if running on a physical device
  // Defaulting to localhost for emulators
  baseURL: 'http://10.0.2.2:3000/api', 
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    // TODO: Inject auth tokens here once authentication is implemented
    // const token = await AsyncStorage.getItem('userToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
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
