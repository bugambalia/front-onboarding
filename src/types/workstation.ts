export interface WorkstationAssignRequest {
  id_empleado?: number | null;
  piso: number;
  fila: number;
  columna: number;
  tipo_puesto?: string | null;
}

export interface WorkstationResponse {
  id: number;
  id_empleado?: number | null;
  coordenadas: string;
  piso: number;
  fila: number;
  columna: number;
  tipo_puesto?: string | null;
}

export interface WorkstationPosition {
  piso: number;
  fila: number;
  columna: number;
}

export interface WorkstationSugerenciaRequest {
  id_empleado?: number | null;
  tipo_puesto?: string | null;
  piso?: number | null;
  fila?: number | null;
  columna?: number | null;
}

export interface SugerenciaPosicion {
  numero: number;
  piso: number;
  fila: number;
  columna: number;
  coordenadas: string;
  puntuacion: number;
  razon: string;
}

export interface WorkstationSugerenciaResponse {
  posiciones_recomendadas: SugerenciaPosicion[];
  respuesta_ia_completa: string;
  estadisticas: {
    total_ocupados: number;
    por_tipo: Record<string, number>;
    por_area: Record<string, number>;
  };
  empleado?: {
    id: number;
    nombre: string;
    area: string;
  } | null;
  tipo_puesto_solicitado?: string | null;
}
