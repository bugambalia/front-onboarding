/**
 * Carpeta: hooks
 * 
 * Esta carpeta contiene custom hooks de React que encapsulan lógica reutilizable
 * con estado y efectos.
 * 
 * Ejemplos: useAuth, useDebounce, useFetch, useLocalStorage, usePermissions
 * 
 * Características:
 * - Encapsulan lógica con estado (useState, useEffect, etc.)
 * - Reutilizables en múltiples componentes
 * - Siguen las reglas de hooks de React
 * - Pueden combinar múltiples hooks nativos
 */

import { useState } from "react";

export function useExample(initialValue = 0) {
  const [value, setValue] = useState(initialValue);

  const increment = () => setValue((current) => current + 1);

  return { value, increment };
}
