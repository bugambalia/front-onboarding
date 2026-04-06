/**
 * Tipos para autenticación y usuarios
 */

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginUser {
  id: number;
  correo: string;
  nombre: string;
  rol?: string | null;
  cargo?: number | null;
}

export interface LoginResponse {
  status: string;
  message: string;
  user: LoginUser;
  access_token: string;
  token_type?: string;
  expires_in: number;
}

export interface User {
  id: number;
  correo: string;
  nombre: string;
  rol?: string | null;
  cargo?: number | null;
}

export interface SignupRequest {
  correo: string;
  nombre: string;
  rol?: string;
  cargo?: number;
}
