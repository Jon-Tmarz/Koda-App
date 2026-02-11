"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { CargoTipo } from "@/types/salarios";
import { calcularSalarioCompleto, calcularHorasExtrasYRecargos } from "@/lib/salarios";
import { useSalarios } from "@/hooks/use-salarios";
import { CargoSelector } from "@/components/talent-query/cargo-selector";
import { MonthlySalaryCard } from "@/components/talent-query/monthly-salary-card";
import { HourlySalaryCard } from "@/components/talent-query/hourly-salary-card";
import { LaborSurchargesCard } from "@/components/talent-query/labor-surcharges-card";

export default function QuerySalarioPage() {
  const { config, multipliers, fetchLatestConfig, loading } = useSalarios();
  const [selectedCargo, setSelectedCargo] = useState<CargoTipo>("Auxiliar");

  useEffect(() => {
    fetchLatestConfig();
  }, [fetchLatestConfig]);

  // Cálculo automático unificado y reactivo
  const resultadosUnificados = useMemo(() => {
    if (!config) return null;
    
    const resultado = calcularSalarioCompleto(config, selectedCargo, multipliers);
    const horasExtras = calcularHorasExtrasYRecargos(resultado.porHora);
    
    return {
      resultado,
      horasExtras
    };
  }, [config, selectedCargo, multipliers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/talent/cost">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consultar Salario</h2>
          <p className="text-muted-foreground">
            Consulta el desglose de salarios por cargo (Datos unificados 2026)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <CargoSelector 
            selectedCargo={selectedCargo} 
            onCargoChange={setSelectedCargo} 
          />

          {resultadosUnificados && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <MonthlySalaryCard 
                  resultado={resultadosUnificados.resultado.mensual} 
                  config={config!} 
                />
                <HourlySalaryCard 
                  resultado={resultadosUnificados.resultado.porHora} 
                  config={config!} 
                />
              </div>

              <LaborSurchargesCard 
                horasExtras={resultadosUnificados.horasExtras} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
