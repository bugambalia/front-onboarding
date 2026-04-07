import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingResponse } from "@/types/onboarding";

export function EncargadoDashboard() {
  const { usuario } = useAuth();
  const [solicitudes, setSolicitudes] = useState<OnboardingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadAssigned = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getAssignedRequests({ estado: "En proceso" });
      setSolicitudes(data);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error cargando solicitudes asignadas" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssigned();
  }, []);

  const handleFinalizar = async (solicitudId: number) => {
    try {
      setProcessingId(solicitudId);
      setMessage({ type: "", text: "" });
      await onboardingService.advanceRequestState(solicitudId);
      setSolicitudes((prev) => prev.filter((item) => item.id !== solicitudId));
      setMessage({ type: "success", text: `Solicitud #${solicitudId} finalizada correctamente.` });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "No fue posible finalizar la solicitud" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Mis Solicitudes Asignadas</h1>
        <p>Solicitudes en proceso asignadas a {usuario?.correo}</p>
      </header>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <section className="dashboard-card status-card">
        <h3>Solicitudes para resolver</h3>
        {loading ? (
          <p className="helper-text">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="helper-text">No tienes solicitudes en proceso asignadas.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Empleado</th>
                <th>Creación</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>#{solicitud.id}</td>
                  <td>{solicitud.id_empleado}</td>
                  <td>{new Date(solicitud.fecha_creacion).toLocaleDateString()}</td>
                  <td><span className="badge badge-info">{solicitud.estado}</span></td>
                  <td>
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => handleFinalizar(solicitud.id)}
                      disabled={processingId === solicitud.id}
                    >
                      {processingId === solicitud.id ? "Finalizando..." : "Finalizar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
