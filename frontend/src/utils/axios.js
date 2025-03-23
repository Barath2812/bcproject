import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Create axios instance with default config
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance; 