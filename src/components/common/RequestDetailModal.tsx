import { useState, useEffect } from "react";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingResponse, OnboardingHistoryResponse, OnboardingStatus } from "@/types/onboarding";

interface Props {
  open: boolean;
  solicitud: OnboardingResponse | null;
  onClose: () => void;
  initialTab?: "details" | "history" | "edit";
  onUpdate?: (updated: OnboardingResponse) => void;
}

export function RequestDetailModal({ open, solicitud, onClose, initialTab = "details", onUpdate }: Props) {
  if (!open || !solicitud) return null;

  const [historial, setHistorial] = useState<OnboardingHistoryResponse[] | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [histError, setHistError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "history" | "edit">(initialTab);

  const [editData, setEditData] = useState<{
    estado: OnboardingStatus;
    destinatario: string;
    especificaciones: string;
    fecha_fin: string;
  }>({
    estado: solicitud.estado as OnboardingStatus,
    destinatario: solicitud.destinatario ?? "",
    especificaciones: solicitud.especificaciones ?? "",
    fecha_fin: solicitud.fecha_fin ? solicitud.fecha_fin.slice(0, 10) : "",
  });

  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (open && solicitud) {
      setEditData({
        estado: solicitud.estado as OnboardingStatus,
        destinatario: solicitud.destinatario ?? "",
        especificaciones: solicitud.especificaciones ?? "",
        fecha_fin: solicitud.fecha_fin ? solicitud.fecha_fin.slice(0, 10) : "",
      });
      setHistorial(null);
      setHistError(null);
      setUpdateMessage(null);
    }
  }, [open, solicitud]);

  const loadHistory = async () => {
    if (!solicitud) return;
    setLoadingHistorial(true);
    setHistError(null);
    try {
      const data = await onboardingService.getHistory(solicitud.id);
      setHistorial(data);
    } catch (err: any) {
      setHistError(err?.message || "Error cargando historial");
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // when switching to history tab, load it if not loaded
  useEffect(() => {
    if (activeTab === "history" && historial === null && !loadingHistorial) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!solicitud) return;
    setUpdating(true);
    setUpdateMessage(null);
    try {
      const updated = await onboardingService.updateStatus(solicitud.id, {
        estado: editData.estado,
        destinatario: editData.destinatario || null,
        especificaciones: editData.especificaciones || null,
        fecha_fin: editData.fecha_fin ? new Date(editData.fecha_fin).toISOString() : null,
      });
      setUpdateMessage("Solicitud actualizada correctamente.");
      if (typeof (arguments as any)[1] === "function") {
        // noop - compatibility
      }
      if (typeof (onUpdate) === "function") onUpdate(updated);
      // switch to details tab to show updated values
      setActiveTab("details");
      // refresh history for the updated request
      setHistorial(null);
      loadHistory();
    } catch (err: any) {
      setUpdateMessage(err?.message || "Error actualizando la solicitud");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: "min(900px, 95%)", maxHeight: "90%", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Solicitud #{solicitud.id}</h2>
          <div>
            <button
              className={`btn-small ${activeTab === "details" ? "btn-primary" : ""}`}
              onClick={() => setActiveTab("details")}
              style={{ marginRight: 8 }}
            >
              Detalle
            </button>
            <button
              className={`btn-small ${activeTab === "edit" ? "btn-primary" : ""}`}
              onClick={() => setActiveTab("edit")}
              style={{ marginRight: 8 }}
            >
              Editar
            </button>
            <button
              className={`btn-small ${activeTab === "history" ? "btn-primary" : ""}`}
              onClick={() => setActiveTab("history")}
              style={{ marginRight: 8 }}
            >
              Historial
            </button>
            <button className="btn-small" onClick={onClose}>Cerrar</button>
          </div>
        </div>

        {activeTab === "details" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <p><strong>Empleado:</strong> {solicitud.id_empleado}</p>
                <p><strong>Estado:</strong> {solicitud.estado}</p>
                <p><strong>Fecha creación:</strong> {new Date(solicitud.fecha_creacion).toLocaleString()}</p>
                <p><strong>Fecha fin:</strong> {solicitud.fecha_fin ? new Date(solicitud.fecha_fin).toLocaleString() : "—"}</p>
              </div>

              <div>
                <p><strong>Destinatario:</strong> {solicitud.destinatario || "—"}</p>
                <p><strong>Especificaciones:</strong></p>
                <div style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 8, borderRadius: 4 }}>{solicitud.especificaciones || solicitud.aviso || "—"}</div>
              </div>
            </div>

            {solicitud.aviso && (
              <div style={{ marginTop: 12 }}>
                <p><strong>Aviso:</strong> {solicitud.aviso}</p>
              </div>
            )}
          </>
        )}

        {activeTab === "edit" && (
          <div style={{ marginTop: 8 }}>
            <h3 style={{ marginBottom: 8 }}>Editar Solicitud #{solicitud.id}</h3>
            {updateMessage && (
              <div className={`message-banner ${updateMessage.startsWith("Error") ? "error" : "success"}`} style={{ marginBottom: 8 }}>
                {updateMessage}
              </div>
            )}
            <form onSubmit={handleUpdate} className="signup-form">
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
                  <option value="Rechazado">Rechazado</option>
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
                <button type="button" className="btn-secondary" onClick={() => setActiveTab("details")} disabled={updating}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={updating}>
                  {updating ? "Actualizando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ marginTop: 8 }}>
            <h3 style={{ marginBottom: 8 }}>Historial</h3>
            {loadingHistorial ? (
              <p className="helper-text">Cargando historial...</p>
            ) : histError ? (
              <p className="error-text">{histError}</p>
            ) : !historial || historial.length === 0 ? (
              <p className="helper-text">No hay eventos en el historial.</p>
            ) : (
              <ul style={{ paddingLeft: 16 }}>
                {historial.map((item) => (
                  <li key={item.id} style={{ marginBottom: 6 }}>
                    <strong>{new Date(item.fecha_cambio).toLocaleString()}</strong> — {item.tipo_cambio}
                    <div style={{ fontSize: "0.95rem", color: "#444" }}>
                      {item.estado_antiguo ? `De: ${item.estado_antiguo}` : ""} {item.nuevo_estado ? ` → A: ${item.nuevo_estado}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default RequestDetailModal;
