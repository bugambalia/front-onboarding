/**
 * src/types/onboarding.ts
 * Tipos de datos para el proceso de onboarding y dotación
 */

export type OnboardingStatus = "Pendiente" | "En proceso" | "Finalizado" | "Rechazado";

export interface OnboardingCreateRequest {
    id_empleado: number;
    fecha_fin: string;
    destinatario?: string | null;
    especificaciones?: string | null;
    estado?: OnboardingStatus;
}

export interface OnboardingResponse {
    id: number;
    id_empleado: number;
    fecha_creacion: string;
    fecha_fin?: string | null;
    estado: OnboardingStatus;
    especificaciones?: string | null;
    destinatario?: string | null;
    aviso?: string | null;
}

export interface OnboardingUpdateRequest {
    fecha_fin?: string | null;
    destinatario?: string | null;
    especificaciones?: string | null;
    estado?: OnboardingStatus | null;
}

export interface OnboardingHistoryResponse {
    id: number;
    id_solicitud: number;
    fecha_cambio: string;
    tipo_cambio: string;
    estado_antiguo?: string | null;
    nuevo_estado?: string | null;
}

export interface DotacionTemplateRequest {
    encargado?: string | null;
    tipo?: string | null;
    especificacion: string;
}

export interface DotacionTemplateResponse {
    id: number;
    encargado?: string | null;
    tipo?: string | null;
    especificacion: string;
    aviso?: string | null;
}

export interface DotacionRequest {
    laptops?: string[];
    uniformes?: string[];
    cursos?: string[];
    otros?: string[];
}

export interface Cargo {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface Area {
    id: number;
    nombre: string;
}

export interface Workstation {
    id: string;
    piso: number;
    ala: string;
    estado: 'disponible' | 'ocupado' | 'mantenimiento';
}

// Estadísticas / Rendimiento
export interface DesempenioDestinatarioResponse {
    destinatario: string;
    cantidad_solicitudes: number;
    solicitudes_finalizadas: number;
    solicitudes_rechazadas: number;
    solicitudes_activas: number;
    tasa_cierre: number;
    tiempo_promedio_total_minutos?: number | null;
    percentil_50_minutos?: number | null;
    percentil_90_minutos?: number | null;
}

export interface DesempenioTipoSolicitudResponse {
    especificacion: string;
    cantidad_solicitudes: number;
    solicitudes_finalizadas: number;
    solicitudes_rechazadas: number;
    solicitudes_activas: number;
    tasa_cierre: number;
    tiempo_promedio_total_minutos?: number | null;
    percentil_50_minutos?: number | null;
    percentil_90_minutos?: number | null;
}

export interface EstadoRendimientoResponse {
    estado: string;
    cantidad_solicitudes: number;
    tiempo_promedio_minutos?: number | null;
    tiempo_minimo_minutos?: number | null;
    tiempo_maximo_minutos?: number | null;
    percentil_50_minutos?: number | null;
    percentil_90_minutos?: number | null;
}

export interface TopRendimientoItemResponse {
    nombre: string;
    cantidad_solicitudes: number;
    tiempo_promedio_total_minutos?: number | null;
    percentil_50_minutos?: number | null;
    percentil_90_minutos?: number | null;
}

export interface EventoTimelineResponse {
    fecha: string;
    solicitudes_finalizadas: number;
    solicitudes_rechazadas: number;
    solicitudes_cerradas: number;
    tiempo_promedio_cierre_minutos?: number | null;
}

export interface TimelineRendimientoResponse {
    fecha_inicio: string;
    fecha_fin: string;
    eventos: EventoTimelineResponse[];
}

export interface ResumenRendimientoResponse {
    total_solicitudes: number;
    solicitudes_finalizadas: number;
    solicitudes_rechazadas: number;
    solicitudes_activas: number;
    tasa_cierre: number;
    tiempo_promedio_total_minutos?: number | null;
    percentil_50_total_minutos?: number | null;
    percentil_90_total_minutos?: number | null;
    estado_mas_lento?: string | null;
    por_estado: EstadoRendimientoResponse[];
    top_destinatarios_lentos: TopRendimientoItemResponse[];
    top_tipos_solicitud_lentos: TopRendimientoItemResponse[];
}

export interface TopSolicitudResponse {
    id: number;
    destinatario: string;
    especificacion: string;
    estado_actual: string;
    total_minutes: number;
    finalized_at?: string | null;
}
