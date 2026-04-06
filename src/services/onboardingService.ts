/**
 * src/services/onboardingService.ts
 * Servicio para gestionar onboarding y dotación.
 */

import { API_BASE_URL } from "@/config/env";
import { authService } from "./authService";
import type { OnboardingRequest, DotacionRequest } from "@/types/onboarding";

const ONBOARDING_ENDPOINTS = {
    LISTA: `${API_BASE_URL}/v1/onboarding/`,
    EQUIPO: `${API_BASE_URL}/v1/onboarding/solicitudes-equipo`,
    ASIGNADAS: `${API_BASE_URL}/v1/onboarding/solicitudes-asignadas`,
    HISTORIAL: (id: number) => `${API_BASE_URL}/v1/onboarding/solicitudes/${id}/historial`,
    ACTUALIZAR: (id: number) => `${API_BASE_URL}/v1/onboarding/${id}`,
    DOTACION: `${API_BASE_URL}/v1/onboarding/dotacion`,
};

class OnboardingService {
    /**
     * Obtener cabeceras con el token de autorización
     */
    private getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
        };
    }

    /**
     * Listar todas las solicitudes (RRHH)
     */
    async getAll(): Promise<OnboardingRequest[]> {
        const response = await fetch(ONBOARDING_ENDPOINTS.LISTA, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error("Error obteniendo solicitudes");
        return response.json();
    }

    /**
     * Listar solicitudes de mi equipo (Jefe de Área)
     */
    async getTeamRequests(): Promise<OnboardingRequest[]> {
        const response = await fetch(ONBOARDING_ENDPOINTS.EQUIPO, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error("Error obteniendo solicitudes del equipo");
        return response.json();
    }

    /**
     * Listar mis solicitudes (Empleado)
     */
    async getMyRequests(): Promise<OnboardingRequest[]> {
        const response = await fetch(ONBOARDING_ENDPOINTS.ASIGNADAS, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error("Error obteniendo mis solicitudes");
        return response.json();
    }

    /**
     * Crear nueva solicitud de onboarding (RRHH)
     */
    async create(data: { usuario_id: number; jefe_id: number }): Promise<OnboardingRequest> {
        const response = await fetch(ONBOARDING_ENDPOINTS.LISTA, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error creando onboarding");
        return response.json();
    }

    /**
     * Enviar dotación/implementos (Jefe de Área)
     */
    async requestEquipment(solicitudId: number, dotacion: DotacionRequest): Promise<void> {
        const response = await fetch(ONBOARDING_ENDPOINTS.DOTACION, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({
                solicitud_id: solicitudId,
                dotacion
            }),
        });
        if (!response.ok) throw new Error("Error enviando solicitud de dotación");
    }

    /**
     * Actualizar estado o asignar puesto (Inventario/Otros)
     */
    async updateStatus(id: number, update: Partial<OnboardingRequest>): Promise<void> {
        const response = await fetch(ONBOARDING_ENDPOINTS.ACTUALIZAR(id), {
            method: "PATCH",
            headers: this.getHeaders(),
            body: JSON.stringify(update),
        });
        if (!response.ok) throw new Error("Error actualizando proceso de onboarding");
    }
}

export const onboardingService = new OnboardingService();
