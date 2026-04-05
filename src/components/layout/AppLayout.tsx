/**
 * Carpeta: components/layout
 * 
 * Esta carpeta contiene los componentes estructurales de la aplicación.
 * Define la estructura y distribución de las páginas.
 * 
 * Ejemplos: Header, Sidebar, Footer, Navbar, AppLayout, MainLayout, etc.
 * 
 * Características:
 * - Definen la estructura visual de la app
 * - Suelen envolver el contenido de las páginas
 * - Pueden incluir navegación y elementos persistentes
 */

import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return <div className="app-layout">{children}</div>;
}
