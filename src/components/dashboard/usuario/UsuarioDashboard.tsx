import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingResponse } from "@/types/onboarding";

export function UsuarioDashboard() {
    const { usuario } = useAuth();
    const [solicitudes, setSolicitudes] = useState<OnboardingResponse[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [loading, setLoading] = useState(true);
    const [acceptingFinalization, setAcceptingFinalization] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const solicitudActiva = useMemo(
        () => solicitudes.find((item) => item.estado !== "Finalizado" && item.estado !== "Rechazado") ?? solicitudes[0] ?? null,
        [solicitudes],
    );

    const loadRequests = async (overrides?: {
        estado?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
    }) => {
        const estado = overrides?.estado ?? estadoFiltro;
        const fechaDesdeValue = overrides?.fecha_desde ?? fechaDesde;
        const fechaHastaValue = overrides?.fecha_hasta ?? fechaHasta;

        try {
            setLoading(true);
            const data = await onboardingService.getMyRequests({
                estado: estado || undefined,
                fecha_desde: fechaDesdeValue || undefined,
                fecha_hasta: fechaHastaValue || undefined,
            });
            setSolicitudes(data);
        } catch (error) {
            console.error("Error cargando mis solicitudes:", error);
            setSolicitudes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleFinalizar = async () => {
        if (!usuario) return;
        try {
            setAcceptingFinalization(true);
            setMessage({ type: "", text: "" });
            await onboardingService.advanceUserState(usuario.id);
            await loadRequests();
            setMessage({ type: "success", text: "Has aceptado la finalización de tu proceso de ingreso." });
        } catch (error) {
            setMessage({ type: "error", text: "Error al aceptar la finalización de tu ingreso" });
        } finally {
            setAcceptingFinalization(false);
        }
    };

    if (loading) return <div className="loading-container">Cargando tu progreso...</div>;

    const hasActiveProcess = solicitudes.some((item) => item.estado !== "Finalizado" && item.estado !== "Rechazado");
    const allRequestsFinished = solicitudes.length > 0 && solicitudes.every((item) => item.estado === "Finalizado");

    if (!solicitudes.length) {
        return (
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>¡Hola de nuevo!</h1>
                    <p>Bienvenido, {usuario?.correo}. No tienes solicitudes de ingreso registradas actualmente.</p>
                </header>
            </div>
        );
    }

    const getProgress = (estado: string) => {
        switch (estado) {
            case "Pendiente": return 30;
            case "En proceso": return 70;
            case "Finalizado": return 100;
            default: return 0;
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Mis Solicitudes</h1>
                <p>Bienvenido, {usuario?.correo}. Aquí puedes ver tus solicitudes de ingreso y su estado.</p>
            </header>

            <div className="dashboard-grid">
                <section className="dashboard-card status-card">
                    <h3>Estado del Proceso</h3>
                    {message.text && (
                        <div className={`message-banner ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${getProgress(solicitudActiva?.estado ?? "")}%` }}
                        ></div>
                    </div>
                    <p className="progress-percentage">{getProgress(solicitudActiva?.estado ?? "")}% Completado</p>

                    <div className="user-details">
                        <p><strong>Estado Actual:</strong> <span className="badge badge-info">{solicitudActiva?.estado ?? "Sin estado"}</span></p>
                        {solicitudActiva && <p><strong>Fecha Inicio:</strong> {new Date(solicitudActiva.fecha_creacion).toLocaleDateString()}</p>}
                        {solicitudActiva?.fecha_fin && (
                            <p><strong>Fecha Fin:</strong> {new Date(solicitudActiva.fecha_fin).toLocaleDateString()}</p>
                        )}
                    </div>

                    {allRequestsFinished && (
                        <button className="btn-primary btn-finalize" onClick={handleFinalizar}>
                            {acceptingFinalization ? "Aceptando..." : "Aceptar Finalización de Ingreso"}
                        </button>
                    )}
                    {solicitudActiva?.estado === "Finalizado" && (
                        <div className="message-banner success">🎉 ¡Integración completada exitosamente!</div>
                    )}
                    {!hasActiveProcess && (
                        <div className="message-banner info">Tu proceso de ingreso ya no tiene tareas pendientes.</div>
                    )}
                </section>

                <section className="dashboard-card info-card">
                    <h3>Tu Estación de Trabajo</h3>
                    {(solicitudActiva?.destinatario || solicitudActiva?.especificaciones) ? (
                        <div className="workstation-placeholder">
                            <span className="workstation-icon">💻</span>
                            <p className="workstation-id">Asignado a: {solicitudActiva?.destinatario || "Por confirmar"}</p>
                            <p className="helper-text">{solicitudActiva?.especificaciones || "Especificaciones pendientes de confirmación."}</p>
                        </div>
                    ) : (
                        <div className="workstation-placeholder">
                            <span className="workstation-icon">🏢</span>
                            <p className="helper-text">Tu estación física está siendo preparada por el equipo de infraestructura.</p>
                        </div>
                    )}
                </section>
            </div>

            <section className="dashboard-card status-card">
                <div className="section-heading">
                    <div>
                        <h3>Listado de Solicitudes</h3>
                        <p className="helper-text">Puedes filtrar por estado y rango de fechas.</p>
                    </div>
                    <button type="button" className="btn-secondary" onClick={() => loadRequests()} disabled={loading}>
                        {loading ? "Actualizando..." : "Actualizar"}
                    </button>
                </div>

                <div className="filters-grid">
                    <label>
                        <span>Estado</span>
                        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En proceso">En proceso</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Rechazado">Rechazado</option>
                        </select>
                    </label>
                    <label>
                        <span>Fecha desde</span>
                        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                    </label>
                    <label>
                        <span>Fecha hasta</span>
                        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
                    </label>
                    <div className="filters-actions">
                        <button type="button" className="btn-primary" onClick={() => loadRequests()} disabled={loading}>
                            Aplicar filtros
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setEstadoFiltro("");
                                setFechaDesde("");
                                setFechaHasta("");
                                loadRequests({ estado: "", fecha_desde: "", fecha_hasta: "" });
                            }}
                            disabled={loading}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="helper-text">Cargando solicitudes...</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Solicitud</th>
                                    <th>Estado</th>
                                    <th>Fecha creación</th>
                                    <th>Fecha fin</th>
                                    <th>Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map((solicitud) => (
                                    <tr key={solicitud.id}>
                                        <td>#{solicitud.id}</td>
                                        <td><span className="badge badge-info">{solicitud.estado}</span></td>
                                        <td>{new Date(solicitud.fecha_creacion).toLocaleDateString()}</td>
                                        <td>{solicitud.fecha_fin ? new Date(solicitud.fecha_fin).toLocaleDateString() : "—"}</td>
                                        <td>{solicitud.aviso || solicitud.especificaciones || "Sin observaciones"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>


            <section className="recent-activity">
                <h3>Recursos y Soporte</h3>
                <div className="help-links">
                    <button className="btn-small">Manual del Colaborador</button>
                    <button className="btn-small">Políticas de Seguridad</button>
                    <button className="btn-small">Contactar RRHH</button>
                </div>
            </section>
        </div>
    );
}

