import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { RRHHDashboard } from "@/components/dashboard/rrhh/RRHHDashboard";
import { JefeDashboard } from "@/components/dashboard/jefe/JefeDashboard";
import { UsuarioDashboard } from "@/components/dashboard/usuario/UsuarioDashboard";
import { InventarioDashboard } from "@/components/dashboard/inventario/InventarioDashboard";

export function HomePage() {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Cargando información del perfil...</p>
      </div>
    );
  }

  // Si no hay sesión válida tras cargar, forzamos salida
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Despacho de componentes basado en el rol con mayor precisión
  const renderDashboard = () => {
    const rol = usuario.rol.toLowerCase().trim();

    // 1. Prioridad: Recursos Humanos
    if (rol === "recursos humanos" || rol === "rrhh") {
      return <RRHHDashboard />;
    }

    // 2. Prioridad: Inventario
    if (rol.includes("inventario")) {
      return <InventarioDashboard />;
    }

    // 3. Prioridad: Jefe de Área
    if (rol === "jefe de area" || rol.includes("jefe")) {
      return <JefeDashboard />;
    }

    // 4. Default: Usuario Común
    return <UsuarioDashboard />;
  };

  return (
    <main className="main-content">
      {renderDashboard()}
    </main>
  );
}



