import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { workstationService } from "@/services/workstationService";
import { onboardingService } from "@/services/onboardingService";
import type { WorkstationPosition } from "@/types/workstation";
import type { OnboardingResponse } from "@/types/onboarding";

type Floor = 1 | 2;

function extractPositions(input: unknown): WorkstationPosition[] {
  const positions: WorkstationPosition[] = [];

  const pushIfValid = (piso: unknown, fila: unknown, columna: unknown) => {
    const floor = Number(piso);
    const row = Number(fila);
    const col = Number(columna);
    if (Number.isInteger(floor) && Number.isInteger(row) && Number.isInteger(col) && floor >= 1 && floor <= 2 && row >= 1 && row <= 20 && col >= 1 && col <= 20) {
      positions.push({ piso: floor, fila: row, columna: col });
    }
  };

  const parseCoordinates = (value: unknown) => {
    if (typeof value !== "string") return;
    const nums = value.match(/\d+/g);
    if (!nums || nums.length < 3) return;
    pushIfValid(nums[0], nums[1], nums[2]);
  };

  const walk = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item));
      return;
    }
    if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      if ("piso" in record && "fila" in record && "columna" in record) {
        pushIfValid(record.piso, record.fila, record.columna);
      }
      if ("coordenadas" in record) {
        parseCoordinates(record.coordenadas);
      }
      Object.values(record).forEach((nested) => walk(nested));
    }
  };

  walk(input);
  return positions;
}

export function OficinasDashboard() {
  const { usuario } = useAuth();
  const [floor, setFloor] = useState<Floor>(1);
  const [selected, setSelected] = useState<{ piso: Floor; fila: number; columna: number } | null>(null);
  const [occupied, setOccupied] = useState<Set<string>>(new Set());
  const [assignedRequests, setAssignedRequests] = useState<OnboardingResponse[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [tipoPuesto, setTipoPuesto] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const canAssign = usuario?.cargo === 4;

  const floorRows = useMemo(() => Array.from({ length: 20 }, (_, idx) => idx + 1), []);

  const keyFor = (p: number, r: number, c: number) => `${p}-${r}-${c}`;

  const loadOccupied = async () => {
    try {
      setLoading(true);
      const occupiedData = await workstationService.getOccupied();
      const occupiedPositions = extractPositions(occupiedData);
      setOccupied(new Set(occupiedPositions.map((item) => keyFor(item.piso, item.fila, item.columna))));
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "No fue posible cargar la malla de oficinas" });
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await onboardingService.getAssignedRequests({ estado: "En proceso" });
      setAssignedRequests(data);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "No fue posible cargar las solicitudes asignadas" });
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadOccupied();
    loadAssignedRequests();
  }, []);

  const handleUseRequest = (request: OnboardingResponse) => {
    setSelectedRequestId(request.id);
    setEmployeeId(String(request.id_empleado));
    setMessage({ type: "", text: "" });
  };

  const handleAssign = async () => {
    if (!canAssign) {
      setMessage({ type: "error", text: "Tu cargo no tiene permisos para asignar puestos." });
      return;
    }
    if (!selected) {
      setMessage({ type: "error", text: "Selecciona un puesto en la malla." });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const employee = employeeId ? Number(employeeId) : null;
      if (employee !== null && Number.isNaN(employee)) {
        setMessage({ type: "error", text: "El ID de empleado no es válido." });
        return;
      }

      await workstationService.assign({
        id_empleado: employee,
        piso: selected.piso,
        fila: selected.fila,
        columna: selected.columna,
        tipo_puesto: tipoPuesto || null,
      });

      if (selectedRequestId) {
        await onboardingService.advanceRequestState(selectedRequestId);
      }

      setMessage({ type: "success", text: `Puesto asignado en piso ${selected.piso}, fila ${selected.fila}, columna ${selected.columna}. Solicitud completada.` });
      if (selectedRequestId) {
        setAssignedRequests((prev) => prev.filter((item) => item.id !== selectedRequestId));
      }
      setSelected(null);
      setSelectedRequestId(null);
      setEmployeeId("");
      setTipoPuesto("");
      await loadOccupied();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "No se pudo asignar el puesto." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Gestión de Oficinas</h1>
        <p>Malla de puestos por piso (20x20) para asignación de estaciones de trabajo.</p>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-card status-card">
          <h3>Solicitudes Asignadas</h3>
          <p className="helper-text">Solo se muestran solicitudes en proceso. Al asignar puesto, pasan a completado.</p>
          {loadingRequests ? (
            <p className="helper-text">Cargando solicitudes...</p>
          ) : assignedRequests.length === 0 ? (
            <p className="helper-text">No hay solicitudes en proceso asignadas para tu cargo.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Empleado</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {assignedRequests.map((request) => (
                  <tr key={request.id}>
                    <td>#{request.id}</td>
                    <td>{request.id_empleado}</td>
                    <td><span className="badge badge-warning">{request.estado}</span></td>
                    <td>
                      <button type="button" className="btn-small" onClick={() => handleUseRequest(request)}>
                        Usar Solicitud
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="dashboard-card status-card">
          <h3>Pisos</h3>
          <div className="form-actions">
            <button type="button" className="btn-small" onClick={() => setFloor(1)}>Piso 1</button>
            <button type="button" className="btn-small" onClick={() => setFloor(2)}>Piso 2</button>
            <button type="button" className="btn-small" onClick={loadOccupied} disabled={loading}>Refrescar</button>
            <button type="button" className="btn-small" onClick={loadAssignedRequests} disabled={loadingRequests}>Refrescar Solicitudes</button>
          </div>
          <p className="helper-text">Piso actual: {floor}. Ocupados deshabilitados; libres seleccionables.</p>
        </section>

        <section className="dashboard-card info-card">
          <h3>Asignación</h3>
          <p className="helper-text">
            {selectedRequestId ? `Solicitud seleccionada: #${selectedRequestId}` : "Sin solicitud seleccionada."}
          </p>
          <div className="form-group">
            <label>ID Empleado</label>
            <input
              type="number"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Opcional"
              disabled={!canAssign}
            />
          </div>
          <div className="form-group">
            <label>Tipo de Puesto</label>
            <input
              type="text"
              value={tipoPuesto}
              onChange={(e) => setTipoPuesto(e.target.value)}
              placeholder="Ej: Operativo"
              disabled={!canAssign}
            />
          </div>
          <p className="helper-text">
            {selected
              ? `Seleccionado: Piso ${selected.piso}, Fila ${selected.fila}, Columna ${selected.columna}`
              : "Selecciona una celda libre en la malla."}
          </p>
          <button type="button" className="btn-primary" onClick={handleAssign} disabled={loading || !canAssign}>
            {loading ? "Procesando..." : "Asignar Puesto"}
          </button>
          {!canAssign && <p className="helper-text">Solo el cargo 4 puede asignar puestos.</p>}
        </section>
      </div>

      {message.text && (
        <div className={`message-banner ${message.type}`} style={{ marginBottom: "1rem" }}>
          {message.text}
        </div>
      )}

      <section className="dashboard-card">
        <h3>Malla Piso {floor}</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Fila/Col</th>
                {floorRows.map((col) => (
                  <th key={`col-${col}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {floorRows.map((row) => (
                <tr key={`row-${row}`}>
                  <td><strong>{row}</strong></td>
                  {floorRows.map((col) => {
                    const cellKey = keyFor(floor, row, col);
                    const isOccupied = occupied.has(cellKey);
                    const isSelected = selected?.piso === floor && selected?.fila === row && selected?.columna === col;
                    return (
                      <td key={cellKey}>
                        <button
                          type="button"
                          className="btn-small"
                          onClick={() => setSelected({ piso: floor, fila: row, columna: col })}
                          disabled={isOccupied}
                          style={{
                            minWidth: "2.2rem",
                            opacity: isOccupied ? 0.5 : 1,
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {isOccupied ? "X" : isSelected ? "✓" : "•"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
