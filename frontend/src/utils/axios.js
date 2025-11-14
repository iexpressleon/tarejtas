import axios from 'axios';

// Add request interceptor to include token from localStorage
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('session_token');
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('session_token');
    }
    return Promise.reject(error);
  }
);

export default axios;
