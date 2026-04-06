import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingRequest } from "@/types/onboarding";

export function JefeDashboard() {
    const { usuario } = useAuth();
    const [solicitudes, setSolicitudes] = useState<OnboardingRequest[]>([]);
    const [selectedSolicitud, setSelectedSolicitud] = useState<OnboardingRequest | null>(null);
    const [dotacion, setDotacion] = useState({
        laptops: "",
        uniformes: "",
        cursos: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await onboardingService.getTeamRequests();
                setSolicitudes(data);
            } catch (error) {
                console.error("Error cargando solicitudes del equipo:", error);
            }
        };
        fetchData();
    }, []);

    const handleDotacionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSolicitud) return;

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await onboardingService.requestEquipment(selectedSolicitud.id, {
                laptops: dotacion.laptops.split(",").map(i => i.trim()),
                uniformes: dotacion.uniformes.split(",").map(i => i.trim()),
                cursos: dotacion.cursos.split(",").map(i => i.trim()),
            });
            setMessage({ type: "success", text: "Solicitud de dotación enviada al departamento de inventario." });
            setDotacion({ laptops: "", uniformes: "", cursos: "" });
            setTimeout(() => {
                setSelectedSolicitud(null);
                setMessage({ type: "", text: "" });
            }, 3000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error enviando dotación" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Panel de Jefe de Área</h1>
                <p>Pendientes de tu equipo, {usuario?.correo}</p>
            </header>

            {selectedSolicitud ? (
                <section className="dashboard-card signup-section">
                    <h3>Gestionar Dotación para Solicitud #{selectedSolicitud.id}</h3>
                    <p>Especifica los implementos necesarios para el ingreso.</p>

                    <form onSubmit={handleDotacionSubmit} className="signup-form">
                        <div className="form-group">
                            <label>Equipos (Laptops, Mouse, etc.) - Separar por Coma</label>
                            <input
                                type="text"
                                value={dotacion.laptops}
                                onChange={(e) => setDotacion({ ...dotacion, laptops: e.target.value })}
                                placeholder="Ej: Laptop Pro 15, Mouse Ergonómico"
                            />
                        </div>
                        <div className="form-group">
                            <label>Uniformes y Ropa - Separar por Coma</label>
                            <input
                                type="text"
                                value={dotacion.uniformes}
                                onChange={(e) => setDotacion({ ...dotacion, uniformes: e.target.value })}
                                placeholder="Ej: Polo Talla M, Chaqueta Corporativa"
                            />
                        </div>
                        <div className="form-group">
                            <label>Cursos de Inducción - Separar por Coma</label>
                            <input
                                type="text"
                                value={dotacion.cursos}
                                onChange={(e) => setDotacion({ ...dotacion, cursos: e.target.value })}
                                placeholder="Ej: Curso Seguridad, Políticas Internas"
                            />
                        </div>

                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setSelectedSolicitud(null)}>Atrás</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Enviando..." : "Enviar a Inventario"}
                            </button>
                        </div>
                    </form>
                </section>
            ) : (
                <>
                    <div className="dashboard-grid">
                        <section className="dashboard-card status-card">
                            <h3>Onboardings Pendientes</h3>
                            <div className="stats-row">
                                <div className="stat-item">
                                    <span className="stat-value">{solicitudes.length}</span>
                                    <span className="stat-label">Nuevos ingresos</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="team-list-section">
                        <h3>Procesos de Ingreso del Equipo</h3>
                        {solicitudes.length === 0 ? (
                            <p className="helper-text">No hay procesos de onboarding pendientes en tu área.</p>
                        ) : (
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>ID Solicitud</th>
                                        <th>Usuario ID</th>
                                        <th>Fecha Inicio</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.map((sol) => (
                                        <tr key={sol.id}>
                                            <td>#{sol.id}</td>
                                            <td>ID: {sol.usuario_id}</td>
                                            <td>{new Date(sol.fecha_inicio).toLocaleDateString()}</td>
                                            <td><span className="badge badge-warning">{sol.estado}</span></td>
                                            <td>
                                                <button
                                                    className="btn-small"
                                                    onClick={() => setSelectedSolicitud(sol)}
                                                >
                                                    Gestionar Dotación
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
