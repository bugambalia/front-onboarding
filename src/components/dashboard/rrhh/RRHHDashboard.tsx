import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { onboardingService } from "@/services/onboardingService";
import { useLocation, useNavigate } from "react-router-dom";
import type {
    OnboardingHistoryResponse,
    OnboardingResponse,
    OnboardingStatus,
} from "@/types/onboarding";
import type { CargoJerarquia } from "@/types/auth";

export function RRHHDashboard() {
    const { usuario } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<"home" | "signup" | "onboarding" | "solicitudes" | "dotacion">("home");
    const [formData, setFormData] = useState({ correo: "", nombre: "", cargoId: "" });
    const [cargos, setCargos] = useState<CargoJerarquia[]>([]);
    const [loadingCargos, setLoadingCargos] = useState(false);
    const [onboardingData, setOnboardingData] = useState({
        id_empleado: "",
        destinatario: "",
        fecha_fin: "",
        especificaciones: "",
    });
    const [dotacionTemplateData, setDotacionTemplateData] = useState({
        encargado: "",
        tipo: "Onboarding",
        especificacion: "",
    });
    const [scope, setScope] = useState<"all" | "team" | "assigned">("all");
    const [filters, setFilters] = useState({
        estado: "",
        fecha_desde: "",
        fecha_hasta: "",
    });
    const [solicitudes, setSolicitudes] = useState<OnboardingResponse[]>([]);
    const [selectedSolicitud, setSelectedSolicitud] = useState<OnboardingResponse | null>(null);
    const [editData, setEditData] = useState({
        estado: "Pendiente" as OnboardingStatus,
        destinatario: "",
        especificaciones: "",
        fecha_fin: "",
    });
    const [historial, setHistorial] = useState<OnboardingHistoryResponse[]>([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const path = location.pathname;

        if (path === "/home/rrhh/signup") {
            setCurrentView("signup");
            return;
        }

        if (path === "/home/rrhh/onboarding") {
            setCurrentView("onboarding");
            return;
        }

        if (path === "/home/rrhh/solicitudes") {
            setCurrentView("solicitudes");
            return;
        }

        if (path === "/home/rrhh/dotacion") {
            setCurrentView("dotacion");
            return;
        }

        const query = new URLSearchParams(location.search);
        const view = query.get("view");

        if (view === "signup") {
            setCurrentView("signup");
            return;
        }

        if (view === "onboarding") {
            setCurrentView("onboarding");
            return;
        }

        if (view === "solicitudes") {
            setCurrentView("solicitudes");
            return;
        }

        if (view === "dotacion") {
            setCurrentView("dotacion");
            return;
        }

        setCurrentView("home");
    }, [location.pathname, location.search]);

    useEffect(() => {
        const loadCargos = async () => {
            if (cargos.length > 0) return;
            setLoadingCargos(true);
            try {
                const data = await authService.getCargos();
                setCargos(data);
            } catch (error: any) {
                setMessage({ type: "error", text: error.message || "Error cargando cargos" });
            } finally {
                setLoadingCargos(false);
            }
        };

        if (currentView === "signup") {
            loadCargos();
        }
    }, [currentView]);

    const loadSolicitudes = async (selectedScope = scope) => {
        setLoadingSolicitudes(true);
        setMessage({ type: "", text: "" });

        try {
            const params = {
                estado: filters.estado || undefined,
                fecha_desde: filters.fecha_desde || undefined,
                fecha_hasta: filters.fecha_hasta || undefined,
            };

            let data: OnboardingResponse[] = [];
            if (selectedScope === "all") {
                data = await onboardingService.getAll();
            } else if (selectedScope === "team") {
                data = await onboardingService.getTeamRequests(params);
            } else {
                data = await onboardingService.getAssignedRequests(params);
            }

            setSolicitudes(data);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error cargando solicitudes" });
        } finally {
            setLoadingSolicitudes(false);
        }
    };

    useEffect(() => {
        if (currentView === "solicitudes") {
            loadSolicitudes(scope);
        }
    }, [currentView, scope]);

    const handleSelectSolicitud = async (solicitud: OnboardingResponse) => {
        setSelectedSolicitud(solicitud);
        setEditData({
            estado: solicitud.estado,
            destinatario: solicitud.destinatario ?? "",
            especificaciones: solicitud.especificaciones ?? "",
            fecha_fin: solicitud.fecha_fin ? solicitud.fecha_fin.slice(0, 10) : "",
        });
        setHistorial([]);
    };

    const handleLoadHistory = async (solicitudId: number) => {
        setLoadingHistorial(true);
        try {
            const data = await onboardingService.getHistory(solicitudId);
            setHistorial(data);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error cargando historial" });
        } finally {
            setLoadingHistorial(false);
        }
    };

    const handleUpdateSolicitud = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSolicitud) return;

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const updated = await onboardingService.updateStatus(selectedSolicitud.id, {
                estado: editData.estado,
                destinatario: editData.destinatario || null,
                especificaciones: editData.especificaciones || null,
                fecha_fin: editData.fecha_fin ? new Date(editData.fecha_fin).toISOString() : null,
            });

            setSelectedSolicitud(updated);
            setSolicitudes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            setMessage({ type: "success", text: `Solicitud #${updated.id} actualizada correctamente.` });
            await handleLoadHistory(updated.id);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error actualizando la solicitud" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDotacionTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await onboardingService.createDotacionTemplate({
                encargado: dotacionTemplateData.encargado || null,
                tipo: dotacionTemplateData.tipo || null,
                especificacion: dotacionTemplateData.especificacion,
            });

            setMessage({ type: "success", text: `Plantilla creada con ID ${response.id}.` });
            setDotacionTemplateData({ encargado: "", tipo: "Onboarding", especificacion: "" });
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error creando plantilla de dotación" });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const cargoSeleccionado = cargos.find((cargo) => cargo.id === Number(formData.cargoId));
        if (!cargoSeleccionado) {
            setMessage({ type: "error", text: "Debes seleccionar un cargo válido." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await authService.signup({
                correo: formData.correo,
                nombre: formData.nombre,
                rol: cargoSeleccionado.nombre_cargo,
                cargo: cargoSeleccionado.id,
            });
            setMessage({ type: "success", text: "Usuario registrado con éxito. Se ha enviado un correo para activar la contraseña." });
            setFormData({ correo: "", nombre: "", cargoId: "" });
            setTimeout(() => navigate("/home"), 2000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error al registrar usuario" });
        } finally {
            setLoading(false);
        }
    };

    const handleStartOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await onboardingService.create({
                id_empleado: Number(onboardingData.id_empleado),
                fecha_fin: new Date(onboardingData.fecha_fin).toISOString(),
                destinatario: onboardingData.destinatario || null,
                especificaciones: onboardingData.especificaciones || null,
                estado: "Pendiente",
            });
            setMessage({ type: "success", text: "Proceso de onboarding iniciado. Se ha notificado al jefe de área." });
            setOnboardingData({ id_empleado: "", destinatario: "", fecha_fin: "", especificaciones: "" });
            setTimeout(() => navigate("/home"), 2000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error al iniciar onboarding" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Panel de Recursos Humanos</h1>
                <p>Bienvenido de nuevo, {usuario?.correo}</p>
            </header>

            {currentView === "signup" && (
                <section className="dashboard-card signup-section">
                    <h3>Registrar Nuevo Colaborador</h3>
                    <p>Se enviará un correo automático para la activación de la cuenta.</p>

                    <form onSubmit={handleSignup} className="signup-form">
                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                required
                                value={formData.correo}
                                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                placeholder="ejemplo@empresa.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Ana Pérez"
                            />
                        </div>
                        <div className="form-group">
                            <label>Cargo (Jerarquía)</label>
                            <select
                                value={formData.cargoId}
                                onChange={(e) => setFormData({ ...formData, cargoId: e.target.value })}
                                className="form-select"
                                required
                                disabled={loadingCargos}
                            >
                                <option value="">{loadingCargos ? "Cargando cargos..." : "Selecciona un cargo"}</option>
                                {cargos.map((cargo) => (
                                    <option key={cargo.id} value={String(cargo.id)}>
                                        {cargo.id} - {cargo.nombre_cargo} ({cargo.area})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.cargoId && (() => {
                            const cargoSeleccionado = cargos.find((cargo) => cargo.id === Number(formData.cargoId));
                            if (!cargoSeleccionado) return null;
                            return (
                                <div className="form-group">
                                    <label>Rol derivado del cargo</label>
                                    <input
                                        type="text"
                                        value={cargoSeleccionado.nombre_cargo}
                                        readOnly
                                    />
                                </div>
                            );
                        })()}

                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => navigate("/home")}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Registrando..." : "Confirmar Registro"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {currentView === "onboarding" && (
                <section className="dashboard-card signup-section">
                    <h3>Vincular Onboarding</h3>
                    <p>Asocia a un usuario con su jefe de área para iniciar el flujo de dotación.</p>

                    <form onSubmit={handleStartOnboarding} className="signup-form">
                        <div className="form-group">
                            <label>ID del Usuario (Nuevo Ingreso)</label>
                            <input
                                type="number"
                                required
                                value={onboardingData.id_empleado}
                                onChange={(e) => setOnboardingData({ ...onboardingData, id_empleado: e.target.value })}
                                placeholder="Ej: 15"
                            />
                        </div>
                        <div className="form-group">
                            <label>Destinatario (Jefe/Área)</label>
                            <input
                                type="text"
                                required
                                value={onboardingData.destinatario}
                                onChange={(e) => setOnboardingData({ ...onboardingData, destinatario: e.target.value })}
                                placeholder="Ej: Jefe de Operaciones"
                            />
                        </div>
                        <div className="form-group">
                            <label>Fecha Fin del Proceso</label>
                            <input
                                type="date"
                                required
                                value={onboardingData.fecha_fin}
                                onChange={(e) => setOnboardingData({ ...onboardingData, fecha_fin: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Especificaciones (Opcional)</label>
                            <input
                                type="text"
                                value={onboardingData.especificaciones}
                                onChange={(e) => setOnboardingData({ ...onboardingData, especificaciones: e.target.value })}
                                placeholder="Ej: Laptop, uniforme, inducción de seguridad"
                            />
                        </div>

                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => navigate("/home")}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Iniciando Proceso" : "Crear Onboarding"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {currentView === "solicitudes" && (
                <>
                    <section className="dashboard-card signup-section">
                        <h3>Gestión de Solicitudes de Onboarding</h3>
                        <p>Consulta y administra solicitudes globales, de equipo o asignadas.</p>

                        <div className="form-actions" style={{ marginBottom: "1rem" }}>
                            <button type="button" className="btn-secondary" onClick={() => setScope("all")}>Todas</button>
                            <button type="button" className="btn-secondary" onClick={() => setScope("team")}>Equipo</button>
                            <button type="button" className="btn-secondary" onClick={() => setScope("assigned")}>Asignadas</button>
                        </div>

                        <div className="signup-form">
                            <div className="form-group">
                                <label>Estado</label>
                                <select
                                    value={filters.estado}
                                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                                    className="form-select"
                                >
                                    <option value="">Todos</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En proceso">En proceso</option>
                                    <option value="Finalizado">Finalizado</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Fecha Desde</label>
                                <input
                                    type="date"
                                    value={filters.fecha_desde}
                                    onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={filters.fecha_hasta}
                                    onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-primary" onClick={() => loadSolicitudes(scope)} disabled={loadingSolicitudes}>
                                    {loadingSolicitudes ? "Cargando..." : "Aplicar Filtros"}
                                </button>
                            </div>
                        </div>

                        <section className="team-list-section">
                            <h3>Solicitudes ({scope === "all" ? "Todas" : scope === "team" ? "Equipo" : "Asignadas"})</h3>
                            {solicitudes.length === 0 ? (
                                <p className="helper-text">No hay solicitudes para los filtros seleccionados.</p>
                            ) : (
                                <div className="table-wrapper">
                                    <table className="dashboard-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Empleado</th>
                                                <th>Estado</th>
                                                <th>Creación</th>
                                                <th>Destinatario</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {solicitudes.map((solicitud) => (
                                                <tr key={solicitud.id}>
                                                    <td>#{solicitud.id}</td>
                                                    <td>{solicitud.id_empleado}</td>
                                                    <td><span className="badge badge-warning">{solicitud.estado}</span></td>
                                                    <td>{new Date(solicitud.fecha_creacion).toLocaleDateString()}</td>
                                                    <td>{solicitud.destinatario || "—"}</td>
                                                    <td>
                                                        <button className="btn-small" onClick={() => handleSelectSolicitud(solicitud)}>Editar</button>
                                                        <button className="btn-small" onClick={() => handleLoadHistory(solicitud.id)} style={{ marginLeft: "0.5rem" }}>Historial</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </section>

                    {selectedSolicitud && (
                        <section className="dashboard-card signup-section">
                            <h3>Editar Solicitud #{selectedSolicitud.id}</h3>
                            <form onSubmit={handleUpdateSolicitud} className="signup-form">
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select
                                        value={editData.estado}
                                        onChange={(e) => setEditData({ ...editData, estado: e.target.value as OnboardingStatus })}
                                        className="form-select"
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En proceso">En proceso</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Destinatario</label>
                                    <input
                                        type="text"
                                        value={editData.destinatario}
                                        onChange={(e) => setEditData({ ...editData, destinatario: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Fin</label>
                                    <input
                                        type="date"
                                        value={editData.fecha_fin}
                                        onChange={(e) => setEditData({ ...editData, fecha_fin: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Especificaciones</label>
                                    <input
                                        type="text"
                                        value={editData.especificaciones}
                                        onChange={(e) => setEditData({ ...editData, especificaciones: e.target.value })}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? "Actualizando..." : "Guardar Cambios"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className="dashboard-card signup-section">
                        <h3>Historial de Solicitud</h3>
                        {loadingHistorial ? (
                            <p className="helper-text">Cargando historial...</p>
                        ) : historial.length === 0 ? (
                            <p className="helper-text">Selecciona una solicitud y presiona "Historial" para ver eventos.</p>
                        ) : (
                            <ul className="activity-list">
                                {historial.map((item) => (
                                    <li className="activity-item" key={item.id}>
                                        <span className="activity-dot dot-success"></span>
                                        <div className="activity-info">
                                            <strong>{item.tipo_cambio}</strong>
                                            <span>
                                                {new Date(item.fecha_cambio).toLocaleString()} · {item.estado_antiguo || "—"} → {item.nuevo_estado || "—"}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}

            {currentView === "dotacion" && (
                <section className="dashboard-card signup-section">
                    <h3>Crear Plantilla de Dotación</h3>
                    <p>Genera plantillas en DOTACION para reutilizarlas en onboarding.</p>

                    <form onSubmit={handleCreateDotacionTemplate} className="signup-form">
                        <div className="form-group">
                            <label>Encargado (Opcional)</label>
                            <input
                                type="text"
                                value={dotacionTemplateData.encargado}
                                onChange={(e) => setDotacionTemplateData({ ...dotacionTemplateData, encargado: e.target.value })}
                                placeholder="Ej: RRHH Central"
                            />
                        </div>
                        <div className="form-group">
                            <label>Tipo</label>
                            <input
                                type="text"
                                value={dotacionTemplateData.tipo}
                                onChange={(e) => setDotacionTemplateData({ ...dotacionTemplateData, tipo: e.target.value })}
                                placeholder="Onboarding"
                            />
                        </div>
                        <div className="form-group">
                            <label>Especificación</label>
                            <input
                                type="text"
                                required
                                value={dotacionTemplateData.especificacion}
                                onChange={(e) => setDotacionTemplateData({ ...dotacionTemplateData, especificacion: e.target.value })}
                                placeholder="Ej: Laptop estándar + kit bienvenida"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => navigate("/home")}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Guardando..." : "Crear Plantilla"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {currentView === "home" && (
                <div className="dashboard-grid">
                    <section className="dashboard-card action-card">
                        <div className="card-icon">👤</div>
                        <h3>Gestión de Usuarios</h3>
                        <p>Registra nuevos colaboradores en la plataforma y gestiona sus credenciales.</p>
                        <button className="btn-primary" onClick={() => navigate("/home/rrhh/signup")}>Registrar Usuario</button>
                    </section>

                    <section className="dashboard-card action-card">
                        <div className="card-icon">🚀</div>
                        <h3>Iniciar Onboarding</h3>
                        <p>Crea un nuevo proceso de inducción vinculando al usuario con su área y equipo.</p>
                        <button className="btn-primary" onClick={() => navigate("/home/rrhh/onboarding")}>Crear Onboarding</button>
                    </section>

                    <section className="dashboard-card action-card">
                        <div className="card-icon">📋</div>
                        <h3>Gestionar Solicitudes</h3>
                        <p>Consulta todas las solicitudes, actualiza estado y revisa historial.</p>
                        <button className="btn-primary" onClick={() => navigate("/home/rrhh/solicitudes")}>Ver Solicitudes</button>
                    </section>

                    <section className="dashboard-card action-card">
                        <div className="card-icon">📦</div>
                        <h3>Plantillas Dotación</h3>
                        <p>Crea plantillas de dotación para onboarding y estandariza especificaciones.</p>
                        <button className="btn-primary" onClick={() => navigate("/home/rrhh/dotacion")}>Crear Plantilla</button>
                    </section>

                    <section className="dashboard-card status-card">
                        <h3>Estado Global</h3>
                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="stat-value">12</span>
                                <span className="stat-label">Activos</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">5</span>
                                <span className="stat-label">Pendientes</span>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            <section className="recent-activity">
                <h3>Actividad Reciente</h3>
                <ul className="activity-list">
                    <li className="activity-item">
                        <span className="activity-dot dot-success"></span>
                        <div className="activity-info">
                            <strong>Nuevo usuario registrado</strong>
                            <span>mateo@ejemplo.com ha sido creado exitosamente.</span>
                        </div>
                    </li>
                    <li className="activity-item">
                        <span className="activity-dot dot-pending"></span>
                        <div className="activity-info">
                            <strong>Onboarding iniciado</strong>
                            <span>Se notificó al jefe de área para el ingreso de Sofia.</span>
                        </div>
                    </li>
                </ul>
            </section>
        </div>
    );
}
