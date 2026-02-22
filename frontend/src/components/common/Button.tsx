/**
 * Carpeta: components/common
 * 
 * Esta carpeta contiene componentes reutilizables y genéricos que se usan
 * en múltiples partes de la aplicación. Son agnósticos del dominio/negocio.
 * 
 * Ejemplos: Button, Input, Modal, Card, Spinner, Tooltip, Badge, etc.
 * 
 * Características:
 * - No dependen de lógica de negocio específica
 * - Son altamente reutilizables
 * - Reciben props para personalizar comportamiento y apariencia
 */

type ButtonProps = {
  label: string;
  onClick?: () => void;
};

export function Button({ label, onClick }: ButtonProps) {
  return (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );
}
