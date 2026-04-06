import { useAuth } from "@/context/AuthContext";
import { RRHHDashboard } from "@/components/dashboard/rrhh/RRHHDashboard";
import { JefeDashboard } from "@/components/dashboard/jefe/JefeDashboard";
import { UsuarioDashboard } from "@/components/dashboard/usuario/UsuarioDashboard";
import { InventarioDashboard } from "@/components/dashboard/inventario/InventarioDashboard";

export function HomePage() {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-container">Cargando...</div>;
  }

  // Despacho de componentes basado en el rol
  const renderDashboard = () => {
    if (!usuario) return <UsuarioDashboard />; // Fallback

    const rolNormalizado = usuario.rol.toLowerCase();

    // Recursos Humanos
    if (rolNormalizado.includes("recursos humanos") || rolNormalizado === "rrhh") {
      return <RRHHDashboard />;
    }

    // Jefe de Inventario
    if (rolNormalizado.includes("inventario")) {
      return <InventarioDashboard />;
    }

    // Jefe de Área
    if (rolNormalizado.includes("jefe") || rolNormalizado.includes("area")) {
      return <JefeDashboard />;
    }

    // Usuario Común
    return <UsuarioDashboard />;
  };

  return (
    <main className="main-content">
      {renderDashboard()}
    </main>
  );
}


