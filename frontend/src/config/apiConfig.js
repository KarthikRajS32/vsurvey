// API Configuration - Centralized API URLs
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL + '/api', 
  AUTH_URL: import.meta.env.VITE_API_BASE_URL + '/auth',
  USERS_URL: import.meta.env.VITE_API_BASE_URL + '/api/users',
  QUESTIONS_URL: import.meta.env.VITE_API_BASE_URL + '/api/questions',
  SURVEYS_URL: import.meta.env.VITE_API_BASE_URL + '/api/surveys',
  ASSIGNMENTS_URL: import.meta.env.VITE_API_BASE_URL + '/api/assignments',
};

export default API_CONFIG;