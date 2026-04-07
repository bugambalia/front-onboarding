import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingResponse } from "@/types/onboarding";

export function JefeDashboard() {
    const { usuario } = useAuth();
    const [solicitudes, setSolicitudes] = useState<OnboardingResponse[]>([]);
    const [selectedSolicitud, setSelectedSolicitud] = useState<OnboardingResponse | null>(null);
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
                const data = await onboardingService.getTeamRequests({ estado: "Pendiente" });
                setSolicitudes(data);
            } catch (error) {
                console.error("Error cargando solicitudes del equipo:", error);
            }
        };
        fetchData();
    }, []);

    const handleConfirmarSolicitud = async (solicitudId: number) => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const updated = await onboardingService.advanceRequestState(solicitudId);
            if (updated.estado !== "Pendiente") {
                setSolicitudes((prev) => prev.filter((item) => item.id !== solicitudId));
            } else {
                setSolicitudes((prev) => prev.map((item) => (item.id === solicitudId ? updated : item)));
            }
            setMessage({ type: "success", text: `Solicitud #${solicitudId} confirmada (Pendiente → En proceso).` });
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "No fue posible confirmar la solicitud" });
        } finally {
            setLoading(false);
        }
    };

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
                            <h3>Solicitudes Pendientes</h3>
                            <div className="stats-row">
                                <div className="stat-item">
                                    <span className="stat-value">{solicitudes.length}</span>
                                    <span className="stat-label">Por confirmar</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="team-list-section">
                        <h3>Solicitudes Pendientes de tu Equipo</h3>
                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}
                        {solicitudes.length === 0 ? (
                            <p className="helper-text">No hay procesos de onboarding pendientes en tu área.</p>
                        ) : (
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>ID Solicitud</th>
                                        <th>Usuario ID</th>
                                        <th>Fecha Creación</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.map((sol) => (
                                        <tr key={sol.id}>
                                            <td>#{sol.id}</td>
                                            <td>ID: {sol.id_empleado}</td>
                                            <td>{new Date(sol.fecha_creacion).toLocaleDateString()}</td>
                                            <td><span className="badge badge-warning">{sol.estado}</span></td>
                                            <td>
                                                <button
                                                    className="btn-small"
                                                    onClick={() => handleConfirmarSolicitud(sol.id)}
                                                    disabled={loading || sol.estado === "Finalizado" || sol.estado === "Rechazado"}
                                                >
                                                    Confirmar
                                                </button>
                                                <button
                                                    className="btn-small"
                                                    onClick={() => setSelectedSolicitud(sol)}
                                                    style={{ marginLeft: "0.5rem" }}
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
