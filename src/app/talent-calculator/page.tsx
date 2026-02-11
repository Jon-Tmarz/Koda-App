import { TalentCalculator } from "@/components/talent-calculator";
import Link from "next/link";

export default function PublicTalentCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Público Simple */}
      <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight">KODA</span>
          </Link>
          <span className="text-sm text-muted-foreground font-medium">Calculadora Salarial</span>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Calculadora de Talento</h1>
            <p className="text-muted-foreground">
              Herramienta profesional para el cálculo de costos laborales y salarios en Colombia.
            </p>
          </div>
          
          <TalentCalculator />
          
          <footer className="pt-10 pb-6 text-center text-sm text-muted-foreground border-t">
            <p>© {new Date().getFullYear()} Koda - Gestión de Proyectos Tecnológicos</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
