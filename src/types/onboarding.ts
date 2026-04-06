/**
 * src/types/onboarding.ts
 * Tipos de datos para el proceso de onboarding y dotación
 */

export interface OnboardingRequest {
    id: number;
    usuario_id: number;
    jefe_id: number;
    estado: OnboardingStatus;
    fecha_inicio: string;
    puesto_id?: number | string;
    puesto_asignado?: string;
    dotacion_id?: number;
}

export type OnboardingStatus =
    | 'creado'                // Recién creado por RRHH
    | 'dotacion_enviada'      // Jefe de área envió su parte
    | 'activo'                // Inventario asignó puesto, el usuario puede verlo
    | 'completado';           // Finalizado por el usuario

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
