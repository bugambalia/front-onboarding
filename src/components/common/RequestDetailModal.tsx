import type { OnboardingResponse } from "@/types/onboarding";

interface Props {
  open: boolean;
  solicitud: OnboardingResponse | null;
  onClose: () => void;
}

export function RequestDetailModal({ open, solicitud, onClose }: Props) {
  if (!open || !solicitud) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: "min(900px, 95%)", maxHeight: "90%", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Solicitud #{solicitud.id}</h2>
          <div>
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

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default RequestDetailModal;
