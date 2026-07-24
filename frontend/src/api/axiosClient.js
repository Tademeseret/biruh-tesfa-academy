// api/axiosClient.js
// Single axios instance for the whole app. Base URL comes from an
// environment variable so it can differ between dev/staging/production.
// Attaches the admin JWT (if present) to every outgoing request.
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bta_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so components can just read err.message.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Helper to build a full URL to a file served from /uploads (receipts, PDFs, photos).
export const fileUrl = (relativePath) => {
  if (!relativePath) return '';
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${relativePath}`;
};

export default axiosClient;
