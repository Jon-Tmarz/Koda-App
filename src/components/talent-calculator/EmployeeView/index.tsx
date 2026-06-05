"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { formatearMoneda } from "@/lib/salarios";
import { Info } from "lucide-react";
import { SectionHeader } from "../SectionHeader";

interface EmployeeViewProps {
  resultados: any;
  horas: number;
}

export function EmployeeView({ resultados, horas }: EmployeeViewProps) {
  return (
    <Card className="border-primary/10 bg-koda-white shadow-sm">
      <SectionHeader
        title="Resumen para el Empleado"
        description="Lo que el talento recibe netamente antes de deducciones."
      />
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-koda-blue-dark font-semibold">Concepto</TableHead>
                <TableHead className="text-right text-koda-blue-dark font-semibold">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark">Salario Base ({horas} horas)</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatearMoneda(resultados.salarioBase)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark">Horas Extras y Recargos</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatearMoneda(resultados.pagoRecargos)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark">
                  Subsidio de Transporte
                  {!resultados.tieneSubsidio && resultados.salarioBase > 0 && (
                    <span className="block text-[10px] italic text-koda-orange dark:text-koda-orange-400">Supera el tope de 2 SMMLV</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium text-koda-blue-dark">
                  {resultados.tieneSubsidio ? formatearMoneda(resultados.subsidioTransporte) : "$0"}
                </TableCell>
              </TableRow>
              <TableRow className="bg-koda-blue/5 hover:bg-primary/5 border-t-2">
                <TableCell className="font-bold text-koda-blue text-base">Total Ingresos Brutos</TableCell>
                <TableCell className="text-right font-bold text-koda-blue text-xl">
                  {formatearMoneda(resultados.salarioBruto)}
                </TableCell>
              </TableRow>
              
              <TableRow className="bg-muted/30">
                <TableCell className="text-xs font-semibold uppercase text-koda-blue-dark" colSpan={2}>
                  Deducciones de Ley (A cargo del empleado)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark pl-6 text-sm">Aporte Salud (4%)</TableCell>
                <TableCell className="text-right font-medium text-red-500">
                  - {formatearMoneda(resultados.saludEmpleado)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark pl-6 text-sm">Aporte Pensión (4%)</TableCell>
                <TableCell className="text-right font-medium text-red-500">
                  - {formatearMoneda(resultados.pensionEmpleado)}
                </TableCell>
              </TableRow>
              {resultados.solidaridadEmpleado > 0 && (
                <TableRow>
                  <TableCell className="text-muted-koda-blue-dark pl-6 text-sm">Fondo Solidaridad Pensional</TableCell>
                  <TableCell className="text-right font-medium text-red-500">
                    - {formatearMoneda(resultados.solidaridadEmpleado)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="bg-koda-blue/5 hover:bg-koda-blue/10 border-t-2">
                <TableCell className="font-bold text-koda-blue dark:text-koda-blue text-lg">
                  SALARIO NETO A RECIBIR
                </TableCell>
                <TableCell className="text-right font-bold text-koda-blue dark:text-koda-blue text-2xl font-mono">
                  {formatearMoneda(resultados.salarioNeto)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 p-4 bg-koda-purple rounded-lg flex items-start gap-3 border">
          <Info className="h-5 w-5 text-koda-orange mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-koda-orange">Información de Seguridad Social</p>
            <p className="text-xs text-koda-white leading-relaxed">
              Las deducciones de salud y pensión se calculan sobre el Salario Base + Recargos (IBC). El Auxilio de Transporte no hace parte de la base para aportes a seguridad social.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
