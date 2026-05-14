import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    LineChart,
    Line,
    CartesianGrid,
} from "recharts";
import { onboardingService } from "@/services/onboardingService";
import type {
    ResumenRendimientoResponse,
    DesempenioDestinatarioResponse,
    DesempenioTipoSolicitudResponse,
    TimelineRendimientoResponse,
    EventoTimelineResponse,
    TopSolicitudResponse,
} from "@/types/onboarding";

export const StatsDashboard: React.FC = () => {
    const [filters, setFilters] = useState({ fecha_desde: "", fecha_hasta: "", top_n: 10 });
    const [resumen, setResumen] = useState<ResumenRendimientoResponse | null>(null);
    const [porDestinatario, setPorDestinatario] = useState<DesempenioDestinatarioResponse[]>([]);
    const [porTipo, setPorTipo] = useState<DesempenioTipoSolicitudResponse[]>([]);
    const [timeline, setTimeline] = useState<TimelineRendimientoResponse | null>(null);
    const [topSolicitudes, setTopSolicitudes] = useState<TopSolicitudResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                fecha_desde: filters.fecha_desde || undefined,
                fecha_hasta: filters.fecha_hasta || undefined,
                top_n: filters.top_n || undefined,
            } as any;

            const [res, dest, tipo, tl, top] = await Promise.all([
                onboardingService.getResumenGeneral(params),
                onboardingService.getDesempenioPorDestinatario(params),
                onboardingService.getDesempenioPorTipoSolicitud(params),
                onboardingService.getTimeline(params),
                onboardingService.getTopSolicitudes(params),
            ]);

            setResumen(res);
            setPorDestinatario(dest || []);
            setPorTipo(tipo || []);
            setTimeline(tl || null);
            setTopSolicitudes(top || []);
        } catch (err: any) {
            setError(err?.message || "Error cargando estadísticas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const timelineData: (EventoTimelineResponse & { fechaLabel?: string })[] = timeline?.eventos?.map((e) => ({ ...e, fechaLabel: e.fecha })) ?? [];

    return (
        <div className="dashboard-card stats-section">
            <h3>Estadísticas - Rendimiento Onboarding</h3>

            <div className="signup-form" style={{ marginBottom: 12 }}>
                <div className="form-group">
                    <label>Fecha Desde</label>
                    <input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Fecha Hasta</label>
                    <input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Top N</label>
                    <input type="number" min={1} max={100} value={String(filters.top_n)} onChange={(e) => setFilters({ ...filters, top_n: Number(e.target.value) })} />
                </div>
                <div className="form-actions">
                    <button className="btn-primary" onClick={loadAll} disabled={loading}>{loading ? "Cargando..." : "Actualizar"}</button>
                </div>
            </div>

            {error && <div className="message-banner error">{error}</div>}

            <div className="stats-kpis" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div className="stat-item">
                    <div className="stat-value">{resumen?.total_solicitudes ?? "—"}</div>
                    <div className="stat-label">Total solicitudes</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{resumen?.solicitudes_finalizadas ?? "—"}</div>
                    <div className="stat-label">Finalizadas</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{resumen?.solicitudes_rechazadas ?? "—"}</div>
                    <div className="stat-label">Rechazadas</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{resumen?.solicitudes_activas ?? "—"}</div>
                    <div className="stat-label">Activas</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{typeof resumen?.tasa_cierre === 'number' ? `${(resumen!.tasa_cierre * 100).toFixed(1)}%` : "—"}</div>
                    <div className="stat-label">Tasa cierre</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="chart-card">
                    <h4>Desempeño por Destinatario</h4>
                    <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={porDestinatario.map((d) => ({ name: d.destinatario, solicitudes: d.cantidad_solicitudes }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="solicitudes" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h4>Desempeño por Tipo de Solicitud</h4>
                    <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={porTipo.map((d) => ({ name: d.especificacion, solicitudes: d.cantidad_solicitudes }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="solicitudes" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="chart-card" style={{ marginTop: 16 }}>
                <h4>Timeline</h4>
                <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer>
                        <LineChart data={timelineData.map((d) => ({ fecha: d.fecha, finalizadas: d.solicitudes_finalizadas, rechazadas: d.solicitudes_rechazadas, cerradas: d.solicitudes_cerradas }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="finalizadas" stroke="#8884d8" />
                            <Line type="monotone" dataKey="rechazadas" stroke="#ff7f7f" />
                            <Line type="monotone" dataKey="cerradas" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card" style={{ marginTop: 16 }}>
                <h4>Top Solicitudes</h4>
                {topSolicitudes.length === 0 ? (
                    <p className="helper-text">No hay datos disponibles.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Destinatario</th>
                                    <th>Especificación</th>
                                    <th>Estado</th>
                                    <th>Minutos</th>
                                    <th>Finalizado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSolicitudes.map((s) => (
                                    <tr key={s.id}>
                                        <td>#{s.id}</td>
                                        <td>{s.destinatario}</td>
                                        <td>{s.especificacion}</td>
                                        <td>{s.estado_actual}</td>
                                        <td>{s.total_minutes}</td>
                                        <td>{s.finalized_at ? new Date(s.finalized_at).toLocaleString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsDashboard;
