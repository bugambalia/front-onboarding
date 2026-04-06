import { useAuth } from "@/context/AuthContext";

export function UsuarioDashboard() {
    const { usuario } = useAuth();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>¡Bienvenido a tu nueva etapa!</h1>
                <p>Tu proceso de inducción, {usuario?.correo}</p>
            </header>

            <div className="dashboard-grid">
                <section className="dashboard-card status-card">
                    <h3>Progreso de Onboarding</h3>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: '65%' }}></div>
                    </div>
                    <p className="progress-percentage">65% completado</p>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-value">Activo</span>
                            <span className="stat-label">Estado</span>
                        </div>
                        <button className="btn-primary btn-finalize">Finalizar Proceso</button>
                    </div>
                </section>

                <section className="dashboard-card status-card">
                    <h3>Tu Información</h3>
                    <div className="user-details">
                        <p><strong>Correo:</strong> {usuario?.correo}</p>
                        <p><strong>Cargo:</strong> {usuario?.rol}</p>
                        <p><strong>Área:</strong> Desarrollo</p>
                    </div>
                </section>
            </div>

            <div className="dashboard-grid">
                <section className="dashboard-card area-card">
                    <h3>Tu Estación de Trabajo</h3>
                    <div className="workstation-placeholder">
                        <div className="workstation-icon">🏢</div>
                        <p className="workstation-id">Estación B-12</p>
                        <p>Nivel 2, Ala Norte</p>
                        <button className="btn-small">Ver Mapa Completo</button>
                    </div>
                </section>

                <section className="dashboard-card help-card">
                    <h3>Recursos de Apoyo</h3>
                    <div className="help-links">
                        <button className="btn-small">Guía de Bienvenida</button>
                        <button className="btn-small">Contactar Soporte</button>
                    </div>
                </section>
            </div>
        </div>
    );
}
