/**
 * Header de la aplicación
 */

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { isAuthenticated, usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Sistema de Inducciones</h1>
        
        <nav className="header-nav">
          {isAuthenticated ? (
            <>
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
