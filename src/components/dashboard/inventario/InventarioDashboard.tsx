import { useAuth } from "@/context/AuthContext";

export function InventarioDashboard() {
    const { usuario } = useAuth();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Panel de Jefe de Inventario</h1>
                <p>Gestión de implementos y estaciones de trabajo, {usuario?.correo}</p>
            </header>

            <div className="dashboard-grid">
                <section className="dashboard-card status-card">
                    <h3>Solicitudes Pendientes</h3>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-value">5</span>
                            <span className="stat-label">Implementos por entregar</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">2</span>
                            <span className="stat-label">Puestos por asignar</span>
                        </div>
                    </div>
                </section>

                <section className="dashboard-card status-card">
                    <h3>Infraestructura</h3>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-value">8</span>
                            <span className="stat-label">Estaciones disponibles</span>
                        </div>
                    </div>
                </section>
            </div>

            <section className="inventory-requests">
                <h3>Solicitudes de Implementos (Dotación)</h3>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Nuevo Trabajador</th>
                            <th>Solicitado por</th>
                            <th>Implementos</th>
                            <th>Acción Puesto</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Mateo Arango</td>
                            <td>Pepito (Jefe Desarrollo)</td>
                            <td>Laptop, Kit Bienvenida, Uniforme</td>
                            <td><button className="btn-primary btn-small">Asignar Puesto</button></td>
                        </tr>
                        <tr>
                            <td>Sofia Calle</td>
                            <td>Laura (Jefe RRHH)</td>
                            <td>Teclado, Mouse, Monitor</td>
                            <td><button className="btn-primary btn-small">Asignar Puesto</button></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    );
}
