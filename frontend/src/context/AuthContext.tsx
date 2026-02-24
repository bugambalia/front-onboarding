/**
 * Contexto de autenticación
 * Maneja el estado global de autenticación de la aplicación
 */

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/auth";
import { authService } from "@/services/authService";

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
  const [isLoading, setIsLoading] = useState(false);

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
