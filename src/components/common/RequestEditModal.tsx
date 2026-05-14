import { useEffect, useState } from "react";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingResponse, OnboardingStatus } from "@/types/onboarding";
import type { CargoJerarquia } from "@/types/auth";

interface Props {
  open: boolean;
  solicitud: OnboardingResponse | null;
  onClose: () => void;
  onSaved: (updated: OnboardingResponse) => void;
  encargadoCargos?: CargoJerarquia[];
  loadingCargos?: boolean;
}

export function RequestEditModal({ open, solicitud, onClose, onSaved, encargadoCargos = [], loadingCargos = false }: Props) {
  if (!open || !solicitud) return null;

  const [form, setForm] = useState({
    estado: solicitud.estado as OnboardingStatus,
    destinatario: solicitud.destinatario ?? "",
    especificaciones: solicitud.especificaciones ?? "",
    fecha_fin: solicitud.fecha_fin ? solicitud.fecha_fin.slice(0, 10) : "",
  });

  useEffect(() => {
    if (open && solicitud) {
      setForm({
        estado: solicitud.estado as OnboardingStatus,
        destinatario: solicitud.destinatario ?? "",
        especificaciones: solicitud.especificaciones ?? "",
        fecha_fin: solicitud.fecha_fin ? solicitud.fecha_fin.slice(0, 10) : "",
      });
    }
  }, [open, solicitud]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitud) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await onboardingService.updateStatus(solicitud.id, {
        estado: form.estado,
        destinatario: form.destinatario || null,
        especificaciones: form.especificaciones || null,
        fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : null,
      });
      onSaved(updated);
    } catch (err: any) {
      setError(err?.message || "Error actualizando la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: "min(720px, 95%)", maxHeight: "90%", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Editar Solicitud #{solicitud.id}</h3>
          <div>
            <button className="btn-small" onClick={onClose}>Cerrar</button>
          </div>
        </div>

        {error && <div className="message-banner error" style={{ marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as OnboardingStatus })}
              className="form-select"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Destinatario (Encargado)</label>
            <select
              value={form.destinatario}
              onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
              className="form-select"
              disabled={loadingCargos}
            >
              <option value="">{loadingCargos ? "Cargando encargados..." : "Selecciona encargado"}</option>
              {encargadoCargos.map((cargo) => (
                <option key={`edit-dest-${cargo.id}`} value={cargo.nombre_cargo}>
                  {cargo.id} - {cargo.nombre_cargo} ({cargo.area})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={form.fecha_fin}
              onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Especificaciones</label>
            <input
              type="text"
              value={form.especificaciones}
              onChange={(e) => setForm({ ...form, especificaciones: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestEditModal;
