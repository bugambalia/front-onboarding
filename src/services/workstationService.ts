import { API_BASE_URL } from "@/config/env";
import { authService } from "@/services/authService";
import type { WorkstationAssignRequest, WorkstationResponse, WorkstationSugerenciaRequest, WorkstationSugerenciaResponse } from "@/types/workstation";

const WORKSTATION_ENDPOINTS = {
  ASSIGN: `${API_BASE_URL}/v1/puesto-trabajo/asignar`,
  MAP: `${API_BASE_URL}/v1/puesto-trabajo/mapa`,
  OCCUPIED: `${API_BASE_URL}/v1/puesto-trabajo/ocupadas`,
  SUGGESTION: `${API_BASE_URL}/v1/puesto-trabajo/sugerencia`,
};

class WorkstationService {
  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authService.getToken()}`,
    };
  }

  async assign(data: WorkstationAssignRequest): Promise<WorkstationResponse> {
    const response = await fetch(WORKSTATION_ENDPOINTS.ASSIGN, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error asignando puesto de trabajo");
    return response.json();
  }

  async getMap(): Promise<unknown> {
    const response = await fetch(WORKSTATION_ENDPOINTS.MAP, {
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error("Error obteniendo mapa de puestos");
    return response.json();
  }

  async getOccupied(): Promise<unknown> {
    const response = await fetch(WORKSTATION_ENDPOINTS.OCCUPIED, {
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error("Error obteniendo puestos ocupados");
    return response.json();
  }

  async getSugerencia(data: WorkstationSugerenciaRequest): Promise<WorkstationSugerenciaResponse> {
    const response = await fetch(WORKSTATION_ENDPOINTS.SUGGESTION, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error obteniendo sugerencia de IA");
    return response.json();
  }
}

export const workstationService = new WorkstationService();
