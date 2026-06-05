import { TalentCalculator } from "@/components/talent-calculator";
import { KodaLogo } from "@/components/koda-logo";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function PublicTalentCalculatorPage() {
  return (
    <div className="min-h-screen bg-koda-blue-dark/3">
      {/* Header Público Simple */}
      <header className="border-b bg-koda-white sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/"><KodaLogo /></Link>
          <span className="text-sm text-muted-foreground font-medium text-koda-blue">Calculadora Salarial</span>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-koda-purple">Calculadora de Talento</h1>
            <p className="text-muted-foreground">
              Herramienta profesional para el cálculo de costos laborales y salarios en Colombia.
            </p>
          </div>
          
          <TalentCalculator />
          
          <Footer />
        </div>
      </main>
    </div>
  );
}