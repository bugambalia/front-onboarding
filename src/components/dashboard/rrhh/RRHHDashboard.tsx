import { useAuth } from "@/context/AuthContext";

export function RRHHDashboard() {
    const { usuario } = useAuth();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Panel de Recursos Humanos</h1>
                <p>Bienvenido de nuevo, {usuario?.correo}</p>
            </header>

            <div className="dashboard-grid">
                <section className="dashboard-card action-card">
                    <div className="card-icon">👤</div>
                    <h3>Gestión de Usuarios</h3>
                    <p>Registra nuevos colaboradores en la plataforma y gestiona sus credenciales.</p>
                    <button className="btn-primary">Registrar Usuario</button>
                </section>

                <section className="dashboard-card action-card">
                    <div className="card-icon">🚀</div>
                    <h3>Iniciar Onboarding</h3>
                    <p>Crea un nuevo proceso de inducción vinculando al usuario con su área y equipo.</p>
                    <button className="btn-primary">Crear Onboarding</button>
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
