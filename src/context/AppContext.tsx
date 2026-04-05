/**
 * Carpeta: context
 * 
 * Esta carpeta contiene los Contexts de React y sus Providers para manejar
 * estado global compartido entre componentes sin prop drilling.
 * 
 * Ejemplos: AuthContext, ThemeContext, UserContext, AppContext
 * 
 * Características:
 * - Maneja estado global de la aplicación
 * - Evita prop drilling excesivo
 * - Cada contexto incluye Provider y hook personalizado (useXContext)
 * - Útil para autenticación, temas, configuración, usuario actual
 */

import { createContext, useContext } from "react";

type AppContextValue = {
  appName: string;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const value: AppContextValue = { appName: "Sistema de Integracion" };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
