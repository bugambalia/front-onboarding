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
