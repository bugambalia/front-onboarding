/**
 * Carpeta: pages
 * 
 * Esta carpeta contiene los componentes que representan páginas completas.
 * Cada archivo suele corresponder a una ruta en el router de la aplicación.
 * 
 * Ejemplos: HomePage, LoginPage, DashboardPage, ProfilePage, NotFoundPage, etc.
 * 
 * Características:
 * - Se mapean directamente a rutas
 * - Coordinan múltiples componentes
 * - Gestionan el estado de la página
 * - Pueden hacer llamadas a servicios y manejar data fetching
 */

export function HomePage() {
  return (
    <main>
      <h1>Home</h1>
      <p>Placeholder page.</p>
    </main>
  );
}
