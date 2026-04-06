import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { onboardingService } from "@/services/onboardingService";

export function RRHHDashboard() {
    const { usuario } = useAuth();
    const [showSignup, setShowSignup] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [formData, setFormData] = useState({ correo: "", nombre: "", rol: "Operador" });
    const [onboardingData, setOnboardingData] = useState({
        id_empleado: "",
        destinatario: "",
        fecha_fin: "",
        especificaciones: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await authService.signup(formData);
            setMessage({ type: "success", text: "Usuario registrado con éxito. Se ha enviado un correo para activar la contraseña." });
            setFormData({ correo: "", nombre: "", rol: "Operador" });
            setTimeout(() => setShowSignup(false), 3000);
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
            setTimeout(() => setShowOnboarding(false), 3000);
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

            {showSignup && (
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
                            <label>Rol en el Sistema</label>
                            <select
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                className="form-select"
                            >
                                <option value="Operador">Usuario Común (Nuevo Ingreso)</option>
                                <option value="Jefe de Area">Jefe de Área</option>
                                <option value="Jefe de Inventario">Jefe de Inventario</option>
                                <option value="Recursos Humanos">Recursos Humanos</option>
                            </select>
                        </div>

                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowSignup(false)}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Registrando..." : "Confirmar Registro"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {showOnboarding && (
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
                            <button type="button" className="btn-secondary" onClick={() => setShowOnboarding(false)}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Iniciando Proceso" : "Crear Onboarding"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {!showSignup && !showOnboarding && (
                <div className="dashboard-grid">
                    <section className="dashboard-card action-card">
                        <div className="card-icon">👤</div>
                        <h3>Gestión de Usuarios</h3>
                        <p>Registra nuevos colaboradores en la plataforma y gestiona sus credenciales.</p>
                        <button className="btn-primary" onClick={() => setShowSignup(true)}>Registrar Usuario</button>
                    </section>

                    <section className="dashboard-card action-card">
                        <div className="card-icon">🚀</div>
                        <h3>Iniciar Onboarding</h3>
                        <p>Crea un nuevo proceso de inducción vinculando al usuario con su área y equipo.</p>
                        <button className="btn-primary" onClick={() => setShowOnboarding(true)}>Crear Onboarding</button>
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
