import { useAuth } from "@/context/AuthContext";

export function JefeDashboard() {
    const { usuario } = useAuth();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Panel de Jefe de Área</h1>
                <p>Pendientes de tu equipo, {usuario?.correo}</p>
            </header>

            <div className="dashboard-grid">
                <section className="dashboard-card status-card">
                    <h3>Onboardings Pendientes</h3>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-value">3</span>
                            <span className="stat-label">Nuevos ingresos</span>
                        </div>
                    </div>
                </section>

                <section className="dashboard-card status-card">
                    <h3>Equipo</h3>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-value">15</span>
                            <span className="stat-label">Colaboradores</span>
                        </div>
                    </div>
                </section>
            </div>

            <section className="team-list-section">
                <h3>Procesos de Ingreso</h3>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Colaborador</th>
                            <th>Fecha de Inicio</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Carlos Pérez</td>
                            <td>12 Abr 2026</td>
                            <td><span className="badge badge-warning">En Progreso</span></td>
                            <td><button className="btn-small">Ver Detalle</button></td>
                        </tr>
                        <tr>
                            <td>Lucia Gómez</td>
                            <td>15 Abr 2026</td>
                            <td><span className="badge badge-info">Pendiente</span></td>
                            <td><button className="btn-small">Gestionar</button></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    );
}
