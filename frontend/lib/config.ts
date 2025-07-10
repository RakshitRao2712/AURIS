// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  login: `${BACKEND_URL}/login`,
  user: (id: string | number) => `${API_BASE_URL}/api/user/${id}`,
  userAvatar: (id: string | number) => `${API_BASE_URL}/api/user/${id}/avatar`,
} as const;
