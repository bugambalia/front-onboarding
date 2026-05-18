import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { workstationService } from "@/services/workstationService";
import { onboardingService } from "@/services/onboardingService";
import type { WorkstationPosition, SugerenciaPosicion } from "@/types/workstation";
import type { OnboardingResponse } from "@/types/onboarding";
import { RequestDetailModal } from "@/components/common/RequestDetailModal";

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

function StarRating({ score }: { score: number }) {
  return (
    <span style={{ color: "#f59e0b", letterSpacing: "0.05em" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ opacity: i < score ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

export function OficinasDashboard() {
  const { usuario } = useAuth();
  const [floor, setFloor] = useState<Floor>(1);
  const [selected, setSelected] = useState<{ piso: Floor; fila: number; columna: number } | null>(null);
  const [occupied, setOccupied] = useState<Set<string>>(new Set());
  const [assignedRequests, setAssignedRequests] = useState<OnboardingResponse[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [detailRequest, setDetailRequest] = useState<OnboardingResponse | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [tipoPuesto, setTipoPuesto] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // AI suggestion state
  const [showSugerencia, setShowSugerencia] = useState(false);
  const [loadingSugerencia, setLoadingSugerencia] = useState(false);
  const [sugerencias, setSugerencias] = useState<SugerenciaPosicion[]>([]);
  const [sugerenciaError, setSugerenciaError] = useState("");

  const canAssign = usuario?.cargo === 4;

  const floorRows = useMemo(() => Array.from({ length: 20 }, (_, idx) => idx + 1), []);

  const keyFor = (p: number, r: number, c: number) => `${p}-${r}-${c}`;

  const truncateText = (text?: string, max = 60) => {
    if (!text) return "";
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  };

  // Build a map of suggestion key -> position rank (1 = best)
  const sugerenciasMap = useMemo(() => {
    const map = new Map<string, SugerenciaPosicion>();
    sugerencias.forEach((s) => {
      map.set(keyFor(s.piso, s.fila, s.columna), s);
    });
    return map;
  }, [sugerencias]);

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
      setSugerencias([]);
      await loadOccupied();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "No se pudo asignar el puesto." });
    } finally {
      setLoading(false);
    }
  };

  const handleSugerenciaIA = async () => {
    setSugerenciaError("");
    setSugerencias([]);
    setLoadingSugerencia(true);
    setShowSugerencia(true);

    try {
      const employee = employeeId ? Number(employeeId) : null;
      const resp = await workstationService.getSugerencia({
        id_empleado: employee && !Number.isNaN(employee) ? employee : null,
        tipo_puesto: tipoPuesto || null,
        piso: selected?.piso ?? null,
        fila: selected?.fila ?? null,
        columna: selected?.columna ?? null,
      });

      setSugerencias(resp.posiciones_recomendadas ?? []);

      // Merge puestos ocupados from response into occupied set (if provided)
      if (resp.puestos_ocupados) {
        try {
          const respOccupied = extractPositions(resp.puestos_ocupados);
          setOccupied((prev) => {
            const newSet = new Set(prev);
            respOccupied.forEach((p) => newSet.add(keyFor(p.piso, p.fila, p.columna)));
            return newSet;
          });
        } catch (e) {
          // ignore parse issues from response
        }
      }

      // Auto-switch floor to show best suggestion if it differs
      if (resp.posiciones_recomendadas?.length > 0) {
        const bestFloor = resp.posiciones_recomendadas[0].piso as Floor;
        if (bestFloor === 1 || bestFloor === 2) {
          setFloor(bestFloor);
        }
      }
    } catch (error: any) {
      setSugerenciaError(error.message || "No se pudo obtener la sugerencia de IA.");
    } finally {
      setLoadingSugerencia(false);
    }
  };

  const handleUseSugerencia = (s: SugerenciaPosicion) => {
    const f = s.piso as Floor;
    if (f === 1 || f === 2) setFloor(f);
    setSelected({ piso: f, fila: s.fila, columna: s.columna });
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
                  <th>Destinatario</th>
                  <th>Detalle</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {assignedRequests.map((request) => (
                  <tr key={request.id}>
                    <td>#{request.id}</td>
                    <td>{request.id_empleado}</td>
                    <td>{request.destinatario || "—"}</td>
                    <td>{request.especificaciones || request.aviso || "—"}</td>
                    <td><span className="badge badge-warning">{request.estado}</span></td>
                    <td>
                      <button type="button" className="btn-small" onClick={() => setDetailRequest(request)}>Ver</button>
                      <button type="button" className="btn-small" onClick={() => handleUseRequest(request)} style={{ marginLeft: "0.5rem" }}>
                        Usar Solicitud
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {detailRequest && (
          <RequestDetailModal open={!!detailRequest} solicitud={detailRequest} onClose={() => setDetailRequest(null)} />
        )}

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

          {/* AI Suggestion button */}
          <button
            type="button"
            onClick={handleSugerenciaIA}
            disabled={loadingSugerencia}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
              padding: "0.55rem 1.1rem",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: loadingSugerencia ? "not-allowed" : "pointer",
              opacity: loadingSugerencia ? 0.75 : 1,
              transition: "opacity 0.2s, transform 0.15s",
              boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
            }}
            onMouseEnter={(e) => { if (!loadingSugerencia) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
          >
            <span style={{ fontSize: "1rem" }}>✨</span>
            {loadingSugerencia ? "Consultando IA..." : "Sugerencia de IA"}
          </button>

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

      {/* AI Suggestion Panel */}
      {showSugerencia && (
        <section
          className="dashboard-card"
          style={{
            marginBottom: "1.5rem",
            border: "1.5px solid #7c3aed44",
            background: "linear-gradient(135deg, #1e1b4b08, #4f46e508)",
            position: "relative",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>✨</span>
              Sugerencias de IA
            </h3>
            <button
              type="button"
              onClick={() => setShowSugerencia(false)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#94a3b8", lineHeight: 1 }}
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          {loadingSugerencia && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#7c3aed", padding: "1rem 0" }}>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span>
              <span>La IA está analizando la distribución de la oficina...</span>
            </div>
          )}

          {sugerenciaError && (
            <div className="message-banner error">{sugerenciaError}</div>
          )}

          {!loadingSugerencia && sugerencias.length > 0 && (
            <>
              {/* Suggestion cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {sugerencias.map((s) => (
                  <div
                    key={s.numero}
                    style={{
                      background: s.numero === 1 ? "linear-gradient(135deg, #7c3aed15, #4f46e515)" : "var(--card-bg, #f8fafc)",
                      border: s.numero === 1 ? "1.5px solid #7c3aed66" : "1px solid #e2e8f0",
                      borderRadius: "0.6rem",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#7c3aed" }}>Posición {s.numero}</span>
                      <StarRating score={s.puntuacion} />
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Piso {s.piso} · Fila {s.fila} · Col {s.columna}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.4 }}>{s.razon}</div>
                    <button
                      type="button"
                      onClick={() => handleUseSugerencia(s)}
                      style={{
                        marginTop: "0.3rem",
                        padding: "0.3rem 0.7rem",
                        background: "#7c3aed",
                        color: "#fff",
                        border: "none",
                        borderRadius: "0.35rem",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        alignSelf: "flex-start",
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                    >
                      Usar esta posición
                    </button>
                  </div>
                ))}
              </div>


            </>
          )}
        </section>
      )}

      {/* Map legend when suggestions are active */}
      {sugerencias.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem", alignItems: "center", fontSize: "0.82rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#7c3aed" }} /> Sugerencia IA (mejor)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#a78bfa" }} /> Sugerencias IA (otras)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#22c55e" }} /> Seleccionado
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#f1f5f9", border: "1px solid #e2e8f0" }} /> Libre
          </span>
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
                    const sugerencia = sugerenciasMap.get(cellKey);
                    const isBestSugerencia = sugerencia?.numero === 1;

                    const classes = ["btn-small", "celda"];
                    if (isOccupied) classes.push("celda-ocupado");
                    else if (isSelected) classes.push("celda-selected");
                    else if (sugerencia) {
                      classes.push("celda-sugerencia");
                      if (isBestSugerencia) classes.push("celda-sugerencia-mejor");
                    }

                    const title = sugerencia ? `Posición ${sugerencia.numero}: ${sugerencia.razon}` : undefined;

                    let label = "•";
                    if (isOccupied) label = "X";
                    else if (isSelected) label = "✓";
                    else if (sugerencia) label = `${sugerencia.numero}`;

                    return (
                      <td key={cellKey}>
                        <button
                          type="button"
                          className={classes.join(" ")}
                          onClick={() => setSelected({ piso: floor, fila: row, columna: col })}
                          disabled={isOccupied}
                          title={title}
                          aria-label={title}
                        >
                          <span>{label}</span>
                          {sugerencia && (
                            <>
                              <span className="badge-sugerencia" title={sugerencia.razon}>{truncateText(sugerencia.razon, 48)}</span>
                              <span className="badge-puntuacion" aria-hidden>{sugerencia.puntuacion}★</span>
                            </>
                          )}
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
