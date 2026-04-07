/**
 * Header de la aplicación
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const { isAuthenticated, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const goToHomeView = (view?: "signup" | "onboarding" | "solicitudes" | "dotacion" | "mis-solicitudes") => {
    if (view) {
      if (view === "mis-solicitudes") {
        navigate("/home/mis-solicitudes");
        return;
      }
      navigate(`/home/rrhh/${view}`);
      return;
    }
    navigate("/home");
  };

  const inProtectedArea = location.pathname.startsWith("/home");

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Sistema de Inducciones</h1>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className={`menu-toggle ${menuOpen ? "open" : ""}`}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>

              <div className={`header-menu ${menuOpen ? "open" : ""}`}>
                <nav className="header-nav">
                  {inProtectedArea && (
                    <button onClick={() => { goToHomeView(); closeMenu(); }} className="btn-small">
                      Inicio
                    </button>
                  )}
                  {inProtectedArea && (
                    <button onClick={() => { goToHomeView("mis-solicitudes"); closeMenu(); }} className="btn-small">
                      Mis Solicitudes
                    </button>
                  )}
                  {inProtectedArea && isRrhh && (
                    <>
                      <button onClick={() => { goToHomeView("signup"); closeMenu(); }} className="btn-small">
                        Registrar Usuario
                      </button>
                      <button onClick={() => { goToHomeView("onboarding"); closeMenu(); }} className="btn-small">
                        Crear Onboarding
                      </button>
                      <button onClick={() => { goToHomeView("solicitudes"); closeMenu(); }} className="btn-small">
                        Solicitudes
                      </button>
                      <button onClick={() => { goToHomeView("dotacion"); closeMenu(); }} className="btn-small">
                        Dotación
                      </button>
                    </>
                  )}
                  {inProtectedArea && isOfficeManager && (
                    <button onClick={() => { navigate("/home/oficinas"); closeMenu(); }} className="btn-small">
                      Oficinas
                    </button>
                  )}
                  <span className="user-info">
                    Hola, {usuario?.correo}
                  </span>
                  <button onClick={async () => { await handleLogout(); closeMenu(); }} className="btn-logout">
                    Cerrar Sesión
                  </button>
                </nav>
              </div>
            </>
          ) : (
            <button onClick={handleLoginClick} className="btn-login">
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
