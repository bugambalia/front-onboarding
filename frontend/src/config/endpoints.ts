/**
 * Endpoints de la API
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    LOGOUT: "/api/v1/auth/logout",
  },
  USERS: {
    LIST: "/api/v1/users",
    CREATE: "/api/v1/users",
    GET_BY_ID: (id: number) => `/api/v1/users/${id}`,
  },
};
