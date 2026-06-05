/**
 * Componente de pie de página reutilizable para la aplicación.
 * Muestra el copyright y los créditos del desarrollador.
 */
export function Footer() {
  return (
    <footer className="pt-10 pb-6 text-center text-sm text-muted-foreground border-t">
      <p>© {new Date().getFullYear()} Koda - Gestión de Proyectos Tecnológicos</p>
      <p>Desarrollado por <a href="https://jontmarz.com" target="_blank" rel="noopener noreferrer" className="text-koda-blue hover:underline">Jon Tmarz</a></p>
    </footer>
  );
}