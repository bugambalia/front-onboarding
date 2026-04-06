import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * src/components/auth/ProtectedRoute.tsx
 * Componente que protege las rutas de accesos no autorizados.
 */
export function ProtectedRoute() {
    const { usuario, isLoading } = useAuth();
    const token = localStorage.getItem("access_token");

    if (isLoading) {
        return (
            <div className="loading-container">
                <p>Verificando sesión...</p>
            </div>
        );
    }

    // Si no hay sesión válida, dirigimos al login
    if (!usuario && !token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

/**
 * Hook opcional para chequear permisos específicos de rol dento de una página.
 */
export function checkRole(usuario: any, ...rolesPermitidos: string[]) {
    if (!usuario) return false;
    const rolUser = (usuario.rol ?? "").toLowerCase();
    return rolesPermitidos.some(role => rolUser.includes(role.toLowerCase()));
}
