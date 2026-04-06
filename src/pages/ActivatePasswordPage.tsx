import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";

export function ActivatePasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: "error", text: "Las contraseñas no coinciden." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await fetch(`${API_BASE_URL}/v1/auth/activate-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, contrasena: password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error activando contraseña");
            }

            setMessage({ type: "success", text: "Cuenta activada con éxito. Redirigiendo al login..." });
            setTimeout(() => navigate("/login"), 3000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error al activar la cuenta" });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <h1 className="error-text">Token no válido</h1>
                    <p>El enlace de activación es incorrecto o ha expirado.</p>
                    <button className="btn-primary" onClick={() => navigate("/login")}>Ir al Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-right-section">
                <div className="login-box">
                    <h1>Activar Cuenta</h1>
                    <p>Define tu contraseña para comenzar</p>

                    <form onSubmit={handleActivate}>
                        <div className="form-group">
                            <label>Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                minLength={8}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Contraseña</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Activando..." : "Activar Contraseña"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
