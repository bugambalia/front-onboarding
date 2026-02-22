/**
 * Carpeta: utils
 * 
 * Esta carpeta contiene funciones puras y helpers que realizan operaciones
 * genéricas sin depender de React o del estado de la aplicación.
 * 
 * Ejemplos: formatDate, validateEmail, parseQueryParams, debounce, clamp
 * 
 * Características:
 * - Funciones puras (entrada -> salida, sin side effects)
 * - No usan hooks de React
 * - Testables de forma aislada
 * - Reutilizables en cualquier parte del código
 */

export function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
