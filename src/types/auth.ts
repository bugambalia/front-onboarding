/**
 * Tipos para autenticación y usuarios
 */

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    correo: string;
    rol: string;
  };
}

export interface User {
  id: number;
  correo: string;
  rol: string;
}
