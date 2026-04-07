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
