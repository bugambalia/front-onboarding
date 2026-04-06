export function InventarioDashboard() {
    // Mock de datos que vendrán de la API de dotación/inventario
    const itemsOfrecidos = [
        { id: 1, categoria: "Hardware", nombre: "laptop corporativa", stock: 15 },
        { id: 2, categoria: "Hardware", nombre: "monitor 24 pulgadas", stock: 10 },
        { id: 3, categoria: "Uniformes", nombre: "dotación camisa polo", stock: 50 },
        { id: 4, categoria: "Accesorios", nombre: "kit de bienvenida", stock: 30 },
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Inventario y Suministros</h1>
                <p>Consulta de implementos ofrecidos para nuevos colaboradores</p>
            </header>

            <div className="dashboard-grid">
                <section className="dashboard-card status-card">
                    <h3>Items Disponibles en Sistema</h3>
                    <p className="helper-text">Listado de elementos que los jefes de área pueden solicitar para el personal nuevo.</p>

                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Categoría</th>
                                <th>Nombre del Item</th>
                                <th>Existencias</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsOfrecidos.map((item) => (
                                <tr key={item.id}>
                                    <td><span className="badge badge-info">{item.categoria}</span></td>
                                    <td>{item.nombre}</td>
                                    <td><strong>{item.stock} unidades</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="dashboard-card info-card">
                    <h3>Información de Gestión</h3>
                    <p>Este panel es solo de visualización. Los ítems aquí listados son sincronizados con el catálogo central de la API.</p>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-value">4</span>
                            <span className="stat-label">Categorías</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">OK</span>
                            <span className="stat-label">Estado API</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

