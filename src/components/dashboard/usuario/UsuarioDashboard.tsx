import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingRequest } from "@/types/onboarding";

export function UsuarioDashboard() {
    const { usuario } = useAuth();
    const [miOnboarding, setMiOnboarding] = useState<OnboardingRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMiStatus = async () => {
            try {
                const data = await onboardingService.getMyRequests();
                if (data.length > 0) setMiOnboarding(data[0]);
            } catch (error) {
                console.error("Error cargando mi onboarding:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMiStatus();
    }, []);

    const handleFinalizar = async () => {
        if (!miOnboarding) return;
        try {
            await onboardingService.updateStatus(miOnboarding.id, { estado: "completado" });
            setMiOnboarding({ ...miOnboarding, estado: "completado" });
        } catch (error) {
            alert("Error al finalizar el proceso");
        }
    };

    if (loading) return <div className="loading-container">Cargando tu progreso...</div>;

    if (!miOnboarding) {
        return (
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>¡Hola de nuevo!</h1>
                    <p>Bienvenido, {usuario?.correo}. No tienes procesos de onboarding activos actualmente.</p>
                </header>
            </div>
        );
    }

    const getProgress = (estado: string) => {
        switch (estado) {
            case "creado": return 25;
            case "dotacion_enviada": return 60;
            case "activo": return 90;
            case "completado": return 100;
            default: return 0;
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Tu Integración</h1>
                <p>Bienvenido a la empresa. Aquí puedes ver el avance de tu ingreso.</p>
            </header>

            <div className="dashboard-grid">
                <section className="dashboard-card status-card">
                    <h3>Progreso de Onboarding</h3>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${getProgress(miOnboarding.estado)}%` }}
                        ></div>
                    </div>
                    <p className="progress-percentage">{getProgress(miOnboarding.estado)}% Completado</p>

                    <div className="user-details">
                        <p><strong>Estado Actual:</strong> <span className="badge badge-info">{miOnboarding.estado.replace("_", " ")}</span></p>
                        <p><strong>Fecha Inicio:</strong> {new Date(miOnboarding.fecha_inicio).toLocaleDateString()}</p>
                    </div>

                    {miOnboarding.estado === "activo" && (
                        <button className="btn-primary btn-finalize" onClick={handleFinalizar}>
                            Finalizar Mi Onboarding
                        </button>
                    )}
                    {miOnboarding.estado === "completado" && (
                        <div className="message-banner success">🎉 ¡Integración completada exitosamente!</div>
                    )}
                </section>

                <section className="dashboard-card info-card">
                    <h3>Tu Estación de Trabajo</h3>
                    {(miOnboarding.puesto_id || miOnboarding.puesto_asignado) ? (
                        <div className="workstation-placeholder">
                            <span className="workstation-icon">💻</span>
                            <p className="workstation-id">Estación {miOnboarding.puesto_id || miOnboarding.puesto_asignado}</p>
                            <p className="helper-text">Ubicada en el área de desarrollo, piso 2.</p>
                        </div>
                    ) : (
                        <div className="workstation-placeholder">
                            <span className="workstation-icon">🏢</span>
                            <p className="helper-text">Tu estación física está siendo preparada por el equipo de infraestructura.</p>
                        </div>
                    )}
                </section>
            </div>


            <section className="recent-activity">
                <h3>Recursos y Soporte</h3>
                <div className="help-links">
                    <button className="btn-small">Manual del Colaborador</button>
                    <button className="btn-small">Políticas de Seguridad</button>
                    <button className="btn-small">Contactar RRHH</button>
                </div>
            </section>
        </div>
    );
}

