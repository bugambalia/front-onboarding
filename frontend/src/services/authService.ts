/**
 * Servicio de autenticación
 * Maneja login, logout y gestión de token
 */

import type { LoginRequest, LoginResponse } from "@/types/auth";
import { API_BASE_URL } from "@/config/env";

const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
};

class AuthService {
  /**
   * Realiza login del usuario
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data: LoginResponse = await response.json();
      
      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem("access_token", data.token);
      }

      return data;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }

  /**
   * Cierra sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      await fetch(AUTH_ENDPOINTS.LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      localStorage.removeItem("access_token");
    }
  }

  /**
   * Obtiene el token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  /**
   * Verifica si hay un token válido
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
