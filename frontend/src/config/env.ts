/**
 * Carpeta: config
 * 
 * Esta carpeta contiene archivos de configuración de la aplicación,
 * constantes, feature flags, y variables de entorno.
 * 
 * Ejemplos: env.ts, constants.ts, features.ts, routes.ts
 * 
 * Características:
 * - Centraliza configuración de la app
 * - Variables de entorno (API URLs, claves, etc.)
 * - Constantes globales
 * - Feature flags para habilitar/deshabilitar funcionalidades
 * - Configuración de rutas
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
