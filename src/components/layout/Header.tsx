/**
 * Header de la aplicación
 */

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import logoEmpresa from "@/assets/images/LogoEmpresa.png";

export function Header() {
  const { isAuthenticated, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const rol = (usuario?.rol ?? "").toLowerCase();
  const cargo = Number(usuario?.cargo);
  const isRrhh = rol.includes("recursos humanos") || rol === "rrhh" || cargo === 1 || cargo === 48 || cargo === 49;
  const isOfficeManager = cargo === 4;
  const isJefe = rol === "jefe de area" || rol.includes("jefe");

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
    setIsCollapsed(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const minScrollDelta = 8;
    const topOffset = 16;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= topOffset) {
        setIsCollapsed(false);
        lastScrollY = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY;
      if (Math.abs(delta) < minScrollDelta) {
        return;
      }

      if (delta > 0 && !menuOpen) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (menuContainerRef.current && !menuContainerRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`app-header ${isCollapsed ? "is-collapsed" : ""}`}>
      <div className="header-content">
        <div className="header-brand">
          <img src={logoEmpresa} alt="Logo empresa" className="app-logo" />
          <h1 className="app-title">Sistema de Inducciones</h1>
        </div>

        <div className="header-actions" ref={menuContainerRef}>
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className={`menu-toggle ${menuOpen ? "open" : ""} menu-xl`}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span className="menu-graphic" aria-hidden="true">
                  <span className="menu-icon" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </span>
                <span className="menu-caret" aria-hidden="true">▾</span>
              </button>

              <div className={`header-menu ${menuOpen ? "open" : ""}`}>
                <div className="header-menu-panel">
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
                    {
                      <button onClick={() => { navigate("/home/equipo"); closeMenu(); }} className="btn-small">
                        Solicitudes de Equipo
                      </button>
                    }
                    {
                      <button onClick={() => { navigate("/home/equipo?mode=create"); closeMenu(); }} className="btn-small">
                        Crear Solicitud Equipo
                      </button>
                    }
                    {inProtectedArea && !isRrhh && !isOfficeManager && !isJefe && (
                      <button onClick={() => { navigate("/home/encargado"); closeMenu(); }} className="btn-small">
                        Solicitudes Asignadas
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
                        <button onClick={() => { navigate("/home/rrhh/estadisticas"); closeMenu(); }} className="btn-small">
                          Estadísticas
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
