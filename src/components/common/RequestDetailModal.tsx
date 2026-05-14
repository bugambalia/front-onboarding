import type { OnboardingResponse } from "@/types/onboarding";

interface Props {
  open: boolean;
  solicitud: OnboardingResponse | null;
  onClose: () => void;
}

export function RequestDetailModal({ open, solicitud, onClose }: Props) {
  if (!open || !solicitud) return null;

  return (
    <div className="request-detail-overlay" role="dialog" aria-modal="true">
      <div className="request-detail-dialog">
        <div className="request-detail-header">
          <h2>Solicitud #{solicitud.id}</h2>
          <div>
            <button className="btn-small" onClick={onClose}>Cerrar</button>
          </div>
        </div>

        <div className="request-detail-grid">
          <div>
            <p><strong>Empleado:</strong> {solicitud.id_empleado}</p>
            <p><strong>Estado:</strong> {solicitud.estado}</p>
            <p><strong>Fecha creación:</strong> {new Date(solicitud.fecha_creacion).toLocaleString()}</p>
            <p><strong>Fecha fin:</strong> {solicitud.fecha_fin ? new Date(solicitud.fecha_fin).toLocaleString() : "—"}</p>
          </div>

          <div>
            <p><strong>Destinatario:</strong> {solicitud.destinatario || "—"}</p>
            <p><strong>Especificaciones:</strong></p>
            <div className="request-detail-specs">{solicitud.especificaciones || solicitud.aviso || "—"}</div>
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
