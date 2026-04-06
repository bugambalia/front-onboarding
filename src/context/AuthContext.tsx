/**
 * Contexto de autenticación
 * Maneja el estado global de autenticación de la aplicación
 */

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/auth";
import { authService } from "@/services/authService";
import { API_BASE_URL } from "@/config/env";

interface AuthContextType {
  token: string | null;
  usuario: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [usuario, setUsuario] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empieza en true para el chequeo inicial

  // Efecto para cargar el usuario al iniciar o al refrescar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          // Intentamos obtener el usuario actual desde /me
          const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUsuario(data);
          } else {
            // Si el token no es válido, cerramos sesión
            authService.logout();
            setToken(null);
            setUsuario(null);
          }
        } catch (error) {
          console.error("Error cargando perfil:", error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (correo: string, contrasena: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ correo, contrasena });
      setToken(response.token);
      setUsuario(response.usuario);
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setToken(null);
      setUsuario(null);
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
