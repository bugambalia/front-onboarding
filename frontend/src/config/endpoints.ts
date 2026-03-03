/**
 * Endpoints de la API
 */

export const API_BASE_URL = "https://backend-sistema-integracion-empleados-fastapi.jorge-lopez2.workers.dev";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/v1/auth/login",
    LOGOUT: "/v1/auth/logout",
  },
  USERS: {
    LIST: "/v1/users",
    CREATE: "/v1/users",
    GET_BY_ID: (id: number) => `/v1/users/${id}`,
  },
};
