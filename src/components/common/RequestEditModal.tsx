import { useEffect, useState } from "react";
import type { OnboardingResponse, OnboardingStatus } from "@/types/onboarding";
import type { CargoJerarquia } from "@/types/auth";

interface Props {
  open: boolean;
  solicitud: OnboardingResponse | null;
  cargos: CargoJerarquia[];
  loadingCargos?: boolean;
  onClose: () => void;
  onSave: (data: { estado: OnboardingStatus; destinatario: string; especificaciones: string; fecha_fin: string; }) => Promise<void>;
}

export function RequestEditModal({ open, solicitud, cargos, loadingCargos, onClose, onSave }: Props) {
  if (!open || !solicitud) return null;

  const [form, setForm] = useState({
    estado: solicitud.estado as OnboardingStatus,
    destinatario: solicitud.destinatario ?? "",
    especificaciones: solicitud.especificaciones ?? "",
    fecha_fin: solicitud.fecha_fin ? solicitud.fecha_fin.slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && solicitud) {
      setForm({
        estado: solicitud.estado as OnboardingStatus,
        destinatario: solicitud.destinatario ?? "",
        especificaciones: solicitud.especificaciones ?? "",
        fecha_fin: solicitud.fecha_fin ? solicitud.fecha_fin.slice(0, 10) : "",
      });
      setError(null);
    }
  }, [open, solicitud]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err: any) {
      setError(err?.message || "Error guardando cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: "min(700px, 95%)", maxHeight: "90%", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Editar Solicitud #{solicitud.id}</h2>
          <div>
            <button className="btn-small" onClick={onClose}>Cerrar</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as OnboardingStatus })} className="form-select">
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Destinatario (Encargado)</label>
            <select value={form.destinatario} onChange={(e) => setForm({ ...form, destinatario: e.target.value })} className="form-select" disabled={loadingCargos}>
              <option value="">{loadingCargos ? "Cargando encargados..." : "Selecciona encargado"}</option>
              {cargos.map((cargo) => (
                <option key={`edit-dest-modal-${cargo.id}`} value={cargo.nombre_cargo}>
                  {cargo.id} - {cargo.nombre_cargo} ({cargo.area})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha Fin</label>
            <input type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Especificaciones</label>
            <input type="text" value={form.especificaciones} onChange={(e) => setForm({ ...form, especificaciones: e.target.value })} />
          </div>

          {error && <div className="message-banner error" style={{ marginBottom: 12 }}>{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestEditModal;
