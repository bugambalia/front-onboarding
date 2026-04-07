import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { onboardingService } from "@/services/onboardingService";
import type { OnboardingResponse } from "@/types/onboarding";

export function UsuarioDashboard() {
    const { usuario } = useAuth();
    const [miOnboarding, setMiOnboarding] = useState<OnboardingResponse | null>(null);
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
        if (!miOnboarding || !usuario) return;
        try {
            await onboardingService.advanceUserState(usuario.id);
            const data = await onboardingService.getMyRequests();
            if (data.length > 0) {
                setMiOnboarding(data[0]);
            }
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
            case "Pendiente": return 30;
            case "En proceso": return 70;
            case "Finalizado": return 100;
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
                        <p><strong>Estado Actual:</strong> <span className="badge badge-info">{miOnboarding.estado}</span></p>
                        <p><strong>Fecha Inicio:</strong> {new Date(miOnboarding.fecha_creacion).toLocaleDateString()}</p>
                        {miOnboarding.fecha_fin && (
                            <p><strong>Fecha Fin:</strong> {new Date(miOnboarding.fecha_fin).toLocaleDateString()}</p>
                        )}
                    </div>

                    {miOnboarding.estado === "En proceso" && (
                        <button className="btn-primary btn-finalize" onClick={handleFinalizar}>
                            Finalizar Mi Onboarding
                        </button>
                    )}
                    {miOnboarding.estado === "Finalizado" && (
                        <div className="message-banner success">🎉 ¡Integración completada exitosamente!</div>
                    )}
                </section>

                <section className="dashboard-card info-card">
                    <h3>Tu Estación de Trabajo</h3>
                    {(miOnboarding.destinatario || miOnboarding.especificaciones) ? (
                        <div className="workstation-placeholder">
                            <span className="workstation-icon">💻</span>
                            <p className="workstation-id">Asignado a: {miOnboarding.destinatario || "Por confirmar"}</p>
                            <p className="helper-text">{miOnboarding.especificaciones || "Especificaciones pendientes de confirmación."}</p>
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

