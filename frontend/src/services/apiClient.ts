/**
 * Carpeta: services
 * 
 * Esta carpeta contiene la lógica para comunicarse con APIs externas,
 * backends, y servicios de terceros. Centraliza las llamadas HTTP.
 * 
 * Ejemplos: apiClient.ts, authService.ts, userService.ts, storageService.ts
 * 
 * Características:
 * - Abstrae las llamadas HTTP (fetch, axios, etc.)
 * - Maneja transformación de datos entre frontend y backend
 * - Gestiona autenticación, headers, errores
 * - Puede incluir lógica de retry, caching, etc.
 */

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
