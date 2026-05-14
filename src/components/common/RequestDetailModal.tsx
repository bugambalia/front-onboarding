import { useState } from "react";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingResponse, OnboardingHistoryResponse } from "@/types/onboarding";

interface Props {
  open: boolean;
  solicitud: OnboardingResponse | null;
  onClose: () => void;
}

export function RequestDetailModal({ open, solicitud, onClose }: Props) {
  if (!open || !solicitud) return null;

  const [historial, setHistorial] = useState<OnboardingHistoryResponse[] | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [histError, setHistError] = useState<string | null>(null);

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

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: "min(900px, 95%)", maxHeight: "90%", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Solicitud #{solicitud.id}</h2>
          <div>
            <button className="btn-small" onClick={loadHistory} disabled={loadingHistorial} style={{ marginRight: 8 }}>
              {loadingHistorial ? "Cargando..." : historial ? "Refrescar historial" : "Ver historial"}
            </button>
            <button className="btn-small" onClick={onClose}>Cerrar</button>
          </div>
        </div>

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

        {/* Historial section */}
        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Historial</h3>
          {loadingHistorial ? (
            <p className="helper-text">Cargando historial...</p>
          ) : histError ? (
            <p className="error-text">{histError}</p>
          ) : !historial || historial.length === 0 ? (
            <p className="helper-text">No hay eventos cargados. Usa "Ver historial" para obtenerlos del servidor.</p>
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

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default RequestDetailModal;
