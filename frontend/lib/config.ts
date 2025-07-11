// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const defaultBackendUrl = isDevelopment ? 'http://localhost:8080' : 'https://auris-production.up.railway.app';
const defaultFrontendUrl = isDevelopment ? 'http://localhost:3000' : 'https://your-frontend-domain.vercel.app';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || defaultBackendUrl;
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || defaultBackendUrl;
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || defaultFrontendUrl;

// API Endpoints
export const API_ENDPOINTS = {
  login: `${BACKEND_URL}/login`,
  user: (id: string | number) => `${API_BASE_URL}/api/user/${id}`,
  userAvatar: (id: string | number) => `${API_BASE_URL}/api/user/${id}/avatar`,
} as const;
