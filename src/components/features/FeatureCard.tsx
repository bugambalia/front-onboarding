/**
 * Carpeta: components/features
 * 
 * Esta carpeta contiene componentes ligados a funcionalidades o dominios específicos
 * del negocio. Son componentes que tienen lógica de negocio o están acoplados
 * a una característica particular.
 * 
 * Ejemplos: UserProfile, ProductCard, OrderSummary, EmployeeOnboarding, etc.
 * 
 * Características:
 * - Relacionados con una funcionalidad específica del negocio
 * - Pueden usar hooks personalizados y servicios
 * - Menos reutilizables que los componentes common
 * - Agregan lógica de dominio
 */

type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  // Ejemplo: usa esta card para resumir una feature del producto en un dashboard.
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
