"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, Search, Calculator, Clock, Calendar, Zap } from "lucide-react";
import Link from "next/link";
import {
  SalarioConfig,
  DEFAULT_SALARIO_CONFIG,
  CARGOS_LIST,
  CargoTipo,
  RECARGOS_LABORALES,
} from "@/types/salarios";
import {
  calcularSalarioCompleto,
  formatearMoneda,
  ConsultaSalario,
  calcularHorasExtrasYRecargos,
  HorasExtrasRecargos,
} from "@/lib/salarios";

export default function QuerySalarioPage() {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SalarioConfig | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<CargoTipo>("Auxiliar");
  const [resultado, setResultado] = useState<ConsultaSalario | null>(null);
  const [horasExtras, setHorasExtras] = useState<HorasExtrasRecargos | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Cargar configuración
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "salarios", String(currentYear));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setConfig(docSnap.data() as SalarioConfig);
      } else {
        // Usar valores por defecto si no existe configuración
        setConfig({
          ...DEFAULT_SALARIO_CONFIG,
          año: currentYear,
        });
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
      // Usar valores por defecto en caso de error
      setConfig({
        ...DEFAULT_SALARIO_CONFIG,
        año: currentYear,
      });
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleConsultar = () => {
    if (!config) return;
    const salario = calcularSalarioCompleto(config, selectedCargo);
    const recargos = calcularHorasExtrasYRecargos(salario.porHora);
    setResultado(salario);
    setHorasExtras(recargos);
    setShowResult(true);
  };

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
            Consulta el desglose de salarios por cargo
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Formulario de Consulta */}
          <Card className="border-border/40 max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Seleccionar Cargo
              </CardTitle>
              <CardDescription>
                Elige un cargo para ver el desglose completo de salario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="cargo" className="text-sm font-medium">
                    Cargo
                  </label>
                  <select
                    id="cargo"
                    className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedCargo}
                    onChange={(e) => {
                      setSelectedCargo(e.target.value as CargoTipo);
                      setShowResult(false);
                    }}
                  >
                    {CARGOS_LIST.map((cargo) => (
                      <option key={cargo} value={cargo}>
                        {cargo}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleConsultar} className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Mostrar Salario
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          {showResult && resultado && horasExtras && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Tabla Salario Mensual */}
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Salario Mensual - {resultado.mensual.cargo}
                    </CardTitle>
                    <CardDescription>
                      Multiplicador: {resultado.mensual.multiplicador}x | Año: {config?.año}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Salario Base Cargo</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatearMoneda(resultado.mensual.salarioBaseCargo)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Auxilio de Transporte</TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(resultado.mensual.auxilioTransporte)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-t-2">
                          <TableCell className="font-medium">Salario Bruto</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatearMoneda(resultado.mensual.salarioBruto)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            Costo Empresa (×{config?.costoEmpleado})
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(resultado.mensual.costoEmpresa)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Ganancia ({config?.ganancia}%)</TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(resultado.mensual.gananciaValor)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Subtotal</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatearMoneda(resultado.mensual.subtotal)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>IVA ({config?.iva}%)</TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(resultado.mensual.ivaValor)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-primary/5">
                          <TableCell className="font-bold text-lg">
                            TOTAL MENSUAL
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg text-primary">
                            {formatearMoneda(resultado.mensual.totalMensual)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Tabla Salario por Hora */}
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Salario por Hora - {resultado.porHora.cargo}
                    </CardTitle>
                    <CardDescription>
                      Basado en {resultado.porHora.horasLegales} horas legales mensuales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Valor/Hora</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Salario Base por Hora</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatearMoneda(resultado.porHora.salarioHoraBase)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Costo Empresa por Hora</TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(resultado.porHora.costoHoraEmpresa)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Ganancia por Hora</TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(resultado.porHora.gananciaHora)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>IVA por Hora</TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(resultado.porHora.ivaHora)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-primary/5">
                          <TableCell className="font-bold text-lg">
                            TOTAL POR HORA
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg text-primary">
                            {formatearMoneda(resultado.porHora.totalPorHora)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Calculadora rápida */}
                    <div className="mt-6 p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Ejemplos de Cálculo
                      </h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>8 horas (1 día):</span>
                          <span className="font-medium">
                            {formatearMoneda(resultado.porHora.totalPorHora * 8)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>40 horas (1 semana):</span>
                          <span className="font-medium">
                            {formatearMoneda(resultado.porHora.totalPorHora * 40)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>80 horas (2 semanas):</span>
                          <span className="font-medium">
                            {formatearMoneda(resultado.porHora.totalPorHora * 80)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>160 horas (1 mes):</span>
                          <span className="font-medium">
                            {formatearMoneda(resultado.porHora.totalPorHora * 160)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de Recargos Laborales */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recargos Laborales - Normativa Colombiana
                  </CardTitle>
                  <CardDescription>
                    Valores de horas extras y recargos según el Código Sustantivo del Trabajo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Hora Extra Diurna */}
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">Hora Extra Diurna</h4>
                          <p className="text-xs text-muted-foreground">6:00 AM - 9:00 PM</p>
                        </div>
                        <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          +{(RECARGOS_LABORALES.HORA_EXTRA_DIURNA * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-primary">
                          {formatearMoneda(horasExtras.horaExtraDiurna.valorPorHora)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Base: {formatearMoneda(horasExtras.valorHoraBase)}
                        </p>
                      </div>
                    </div>

                    {/* Hora Extra Nocturna */}
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">Hora Extra Nocturna</h4>
                          <p className="text-xs text-muted-foreground">9:00 PM - 6:00 AM</p>
                        </div>
                        <span className="text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                          +{(RECARGOS_LABORALES.HORA_EXTRA_NOCTURNA * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-primary">
                          {formatearMoneda(horasExtras.horaExtraNocturna.valorPorHora)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Base: {formatearMoneda(horasExtras.valorHoraBase)}
                        </p>
                      </div>
                    </div>

                    {/* Recargo Nocturno */}
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">Recargo Nocturno</h4>
                          <p className="text-xs text-muted-foreground">Hora ordinaria nocturna</p>
                        </div>
                        <span className="text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                          +{(RECARGOS_LABORALES.RECARGO_NOCTURNO * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-primary">
                          {formatearMoneda(horasExtras.recargoNocturno.valorPorHora)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Base: {formatearMoneda(horasExtras.valorHoraBase)}
                        </p>
                      </div>
                    </div>

                    {/* Dominical/Festivo */}
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">Dominical/Festivo</h4>
                          <p className="text-xs text-muted-foreground">Domingos y festivos</p>
                        </div>
                        <span className="text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                          +{(RECARGOS_LABORALES.DOMINICAL_FESTIVO * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-primary">
                          {formatearMoneda(horasExtras.dominicalFestivo.valorPorHora)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Base: {formatearMoneda(horasExtras.valorHoraBase)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tabla comparativa */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 text-sm">Tabla Comparativa de Recargos</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo de Hora</TableHead>
                          <TableHead className="text-center">Recargo</TableHead>
                          <TableHead className="text-right">Valor/Hora</TableHead>
                          <TableHead className="text-right">10 Horas</TableHead>
                          <TableHead className="text-right">20 Horas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Hora Ordinaria</TableCell>
                          <TableCell className="text-center">-</TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.valorHoraBase)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.valorHoraBase * 10)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.valorHoraBase * 20)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Extra Diurna</TableCell>
                          <TableCell className="text-center text-blue-600 dark:text-blue-400">
                            +25%
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.horaExtraDiurna.valorPorHora)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.horaExtraDiurna.valorPorHora * 10)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.horaExtraDiurna.valorPorHora * 20)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Recargo Nocturno</TableCell>
                          <TableCell className="text-center text-indigo-600 dark:text-indigo-400">
                            +35%
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.recargoNocturno.valorPorHora)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.recargoNocturno.valorPorHora * 10)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.recargoNocturno.valorPorHora * 20)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Extra Nocturna</TableCell>
                          <TableCell className="text-center text-purple-600 dark:text-purple-400">
                            +75%
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.horaExtraNocturna.valorPorHora)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.horaExtraNocturna.valorPorHora * 10)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.horaExtraNocturna.valorPorHora * 20)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dominical/Festivo</TableCell>
                          <TableCell className="text-center text-amber-600 dark:text-amber-400">
                            +75%
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.dominicalFestivo.valorPorHora)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.dominicalFestivo.valorPorHora * 10)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(horasExtras.dominicalFestivo.valorPorHora * 20)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Nota informativa */}
                  <div className="mt-6 p-4 rounded-lg bg-muted border border-border">
                    <p className="text-sm text-foreground">
                      <strong>Nota:</strong> Los recargos se calculan sobre el valor total por hora que ya incluye 
                      salario base, prestaciones sociales, costos de empleado, ganancia de la empresa e IVA.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
