/**
 * Header de la aplicación
 */

import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const { isAuthenticated, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rol = (usuario?.rol ?? "").toLowerCase();
  const cargo = Number(usuario?.cargo);
  const isRrhh = rol.includes("recursos humanos") || rol === "rrhh" || cargo === 1 || cargo === 48 || cargo === 49;
  const isOfficeManager = cargo === 4;

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const goToHomeView = (view?: "signup" | "onboarding" | "solicitudes" | "dotacion") => {
    if (view) {
      navigate(`/home/rrhh/${view}`);
      return;
    }
    navigate("/home");
  };

  const inProtectedArea = location.pathname.startsWith("/home");

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Sistema de Inducciones</h1>
        
        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              {inProtectedArea && (
                <button onClick={() => goToHomeView()} className="btn-small">
                  Inicio
                </button>
              )}
              {inProtectedArea && isRrhh && (
                <>
                  <button onClick={() => goToHomeView("signup")} className="btn-small">
                    Registrar Usuario
                  </button>
                  <button onClick={() => goToHomeView("onboarding")} className="btn-small">
                    Crear Onboarding
                  </button>
                  <button onClick={() => goToHomeView("solicitudes")} className="btn-small">
                    Solicitudes
                  </button>
                  <button onClick={() => goToHomeView("dotacion")} className="btn-small">
                    Dotación
                  </button>
                </>
              )}
              {inProtectedArea && isOfficeManager && (
                <button onClick={() => navigate("/home/oficinas")} className="btn-small">
                  Oficinas
                </button>
              )}
              <span className="user-info">
                Hola, {usuario?.correo}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button onClick={handleLoginClick} className="btn-login">
              Iniciar Sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
