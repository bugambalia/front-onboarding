import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingCreateRequest, OnboardingResponse } from "@/types/onboarding";
import { useLocation } from "react-router-dom";

export function EquipoDashboard() {
  const { usuario } = useAuth();
  const location = useLocation();
  const [solicitudes, setSolicitudes] = useState<OnboardingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(() => new URLSearchParams(location.search).get("mode") === "create");
  const [createData, setCreateData] = useState<OnboardingCreateRequest>({
    id_empleado: 0,
    fecha_fin: "",
    destinatario: "",
    especificaciones: "",
    estado: "Pendiente",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadTeamRequests = async (overrides?: {
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }) => {
    const estadoValue = overrides?.estado ?? estado;
    const fechaDesdeValue = overrides?.fecha_desde ?? fechaDesde;
    const fechaHastaValue = overrides?.fecha_hasta ?? fechaHasta;

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const data = await onboardingService.getTeamRequests({
        estado: estadoValue || undefined,
        fecha_desde: fechaDesdeValue || undefined,
        fecha_hasta: fechaHastaValue || undefined,
      });
      setSolicitudes(data);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "No fue posible cargar las solicitudes del equipo" });
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamRequests();
  }, []);

  useEffect(() => {
    setShowCreateForm(new URLSearchParams(location.search).get("mode") === "create");
  }, [location.search]);

  const handleCreateTeamRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage({ type: "", text: "" });

    try {
      await onboardingService.create({
        id_empleado: Number(createData.id_empleado),
        fecha_fin: new Date(createData.fecha_fin).toISOString(),
        destinatario: createData.destinatario || null,
        especificaciones: createData.especificaciones || null,
        estado: "Pendiente",
      });

      setMessage({ type: "success", text: "Solicitud de equipo creada correctamente." });
      setCreateData({
        id_empleado: 0,
        fecha_fin: "",
        destinatario: "",
        especificaciones: "",
        estado: "Pendiente",
      });
      await loadTeamRequests();
      setShowCreateForm(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "No fue posible crear la solicitud del equipo" });
    } finally {
      setCreating(false);
    }
  };

  const handleSendToAreaManager = async (solicitudId: number) => {
    setUpdatingId(solicitudId);
    setMessage({ type: "", text: "" });

    try {
      await onboardingService.advanceRequestState(solicitudId);
      setMessage({ type: "success", text: `Solicitud #${solicitudId} actualizada y enviada al encargado del área.` });
      await loadTeamRequests();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "No fue posible enviar la solicitud al encargado del área" });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Solicitudes de Mi Equipo</h1>
        <p>Vista de solicitudes relacionadas con tu equipo para {usuario?.correo}</p>
      </header>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <section className="dashboard-card signup-section">
        <div className="section-heading">
          <div>
            <h3>Solicitudes del Equipo</h3>
            <p className="helper-text">Crea nuevas solicitudes o consulta el listado de tu equipo.</p>
          </div>
          <div className="form-actions" style={{ marginTop: 0 }}>
            <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
              Ver Solicitudes
            </button>
            <button type="button" className="btn-primary" onClick={() => setShowCreateForm(true)}>
              Crear Solicitud
            </button>
          </div>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateTeamRequest} className="signup-form">
            <div className="form-group">
              <label>ID del Empleado</label>
              <input
                type="number"
                required
                min="1"
                value={createData.id_empleado || ""}
                onChange={(e) => setCreateData({ ...createData, id_empleado: Number(e.target.value) })}
                placeholder="Ej: 125"
              />
            </div>
            <div className="form-group">
              <label>Fecha Límite</label>
              <input
                type="date"
                required
                value={createData.fecha_fin}
                onChange={(e) => setCreateData({ ...createData, fecha_fin: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Destinatario</label>
              <input
                type="text"
                value={createData.destinatario ?? ""}
                onChange={(e) => setCreateData({ ...createData, destinatario: e.target.value })}
                placeholder="Ej: Jefatura Comercial"
              />
            </div>
            <div className="form-group">
              <label>Especificaciones</label>
              <textarea
                rows={4}
                value={createData.especificaciones ?? ""}
                onChange={(e) => setCreateData({ ...createData, especificaciones: e.target.value })}
                placeholder="Ej: Laptop, uniforme y accesos a sistemas"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? "Creando..." : "Crear Solicitud"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="dashboard-card status-card">
        <div className="section-heading">
          <div>
            <h3>Listado de Solicitudes</h3>
            <p className="helper-text">Puedes filtrar por estado y rango de fechas.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => loadTeamRequests()} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="filters-grid">
          <label>
            <span>Estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
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
            <button type="button" className="btn-primary" onClick={() => loadTeamRequests()} disabled={loading}>
              Aplicar filtros
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEstado("");
                setFechaDesde("");
                setFechaHasta("");
                loadTeamRequests({ estado: "", fecha_desde: "", fecha_hasta: "" });
              }}
              disabled={loading}
            >
              Limpiar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="helper-text">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="helper-text">No hay solicitudes del equipo para los filtros seleccionados.</p>
        ) : (
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Empleado</th>
                  <th>Estado</th>
                  <th>Fecha creación</th>
                  <th>Fecha fin</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td>#{solicitud.id}</td>
                    <td>{solicitud.id_empleado}</td>
                    <td><span className="badge badge-info">{solicitud.estado}</span></td>
                    <td>{new Date(solicitud.fecha_creacion).toLocaleDateString()}</td>
                    <td>{solicitud.fecha_fin ? new Date(solicitud.fecha_fin).toLocaleDateString() : "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => handleSendToAreaManager(solicitud.id)}
                        disabled={updatingId === solicitud.id || solicitud.estado === "Finalizado" || solicitud.estado === "Rechazado"}
                      >
                        {updatingId === solicitud.id ? "Enviando..." : "Enviar a Encargado"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}