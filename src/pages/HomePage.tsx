import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { RRHHDashboard } from "@/components/dashboard/rrhh/RRHHDashboard";
import { JefeDashboard } from "@/components/dashboard/jefe/JefeDashboard";
import { UsuarioDashboard } from "@/components/dashboard/usuario/UsuarioDashboard";
import { InventarioDashboard } from "@/components/dashboard/inventario/InventarioDashboard";
import { OficinasDashboard } from "@/components/dashboard/oficinas/OficinasDashboard";
import { EncargadoDashboard } from "@/components/dashboard/encargado/EncargadoDashboard";
import { EquipoDashboard } from "@/components/dashboard/equipo/EquipoDashboard";
import { useLocation } from "react-router-dom";

export function HomePage() {
  const { usuario, isLoading } = useAuth();
  const location = useLocation();

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
    const rol = (usuario.rol ?? "").toLowerCase().trim();
    const cargo = Number(usuario.cargo);
    const isRrhhByCargo = cargo === 1 || cargo === 48 || cargo === 49;
    const isOfficeManager = cargo === 4;
    const isJefe = rol === "jefe de area" || rol.includes("jefe");
    const isRrhh = rol === "recursos humanos" || rol === "rrhh" || isRrhhByCargo;

    if (location.pathname === "/home/encargado") {
      return <EncargadoDashboard />;
    }

    if (location.pathname === "/home/equipo") {
      return <EquipoDashboard />;
    }

    if (location.pathname === "/home/mis-solicitudes") {
      return <UsuarioDashboard />;
    }

    if (location.pathname === "/home/oficinas" || isOfficeManager) {
      return <OficinasDashboard />;
    }

    // 1. Prioridad: Recursos Humanos
    if (isRrhh) {
      return <RRHHDashboard />;
    }

    // 2. Prioridad: Jefe de Área
    if (isJefe) {
      return <JefeDashboard />;
    }

    // 3. Encargados no-oficinas: ver y finalizar solicitudes asignadas
    if (rol.includes("inventario") || rol.includes("encargado") || rol.includes("coordinador") || rol.includes("analista")) {
      return <EncargadoDashboard />;
    }

    // 4. Inventario legacy (respaldo)
    if (rol.includes("inventario")) {
      return <InventarioDashboard />;
    }

    // 5. Default: Usuario Común
    return <UsuarioDashboard />;
  };

  return (
    <main className="main-content">
      {renderDashboard()}
    </main>
  );
}



