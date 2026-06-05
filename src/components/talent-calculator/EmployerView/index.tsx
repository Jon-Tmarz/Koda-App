"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { formatearMoneda } from "@/lib/salarios";
import { SectionHeader } from "../SectionHeader";

interface EmployerViewProps {
  resultados: any;
  horas: number;
  costoEmpleadoPercent?: number;
  gananciaPercent?: number;
}

export function EmployerView({ 
  resultados, 
  horas, 
  costoEmpleadoPercent = 48.3, 
  gananciaPercent = 30 
}: EmployerViewProps) {
  return (
    <Card className="border-primary/10 bg-koda-white shadow-sm">
      <SectionHeader
        title="Costo Total Empresa"
        description="Desglose total de inversión requerida para el cargo."
      />
      <CardContent className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-koda-blue-dark font-semibold">Concepto de Gasto</TableHead>
                <TableHead className="text-right text-koda-blue-dark font-semibold">Inversión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark">Salario Base (Proporcional {horas}h)</TableCell>
                <TableCell className="text-right font-medium text-koda-blue-dark">{formatearMoneda(resultados.salarioEmpresa)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark">Carga Empresa (+{costoEmpleadoPercent}%)</TableCell>
                <TableCell className="text-right font-medium text-koda-blue-dark">{formatearMoneda(resultados.cargaEmpresa)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="text-muted-koda-blue-dark font-medium">Costo Empresa (Base + Carga)</TableCell>
                <TableCell className="text-right font-medium text-koda-blue-dark">{formatearMoneda(resultados.costoLaboralTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark">Ganancia ({gananciaPercent}%)</TableCell>
                <TableCell className="text-right font-medium text-koda-blue-dark">{formatearMoneda(resultados.gananciaEmpresa)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark">Transporte y Recargos</TableCell>
                <TableCell className="text-right font-medium text-koda-blue-dark">{formatearMoneda(resultados.subsidioTransporte + resultados.pagoRecargos)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-koda-blue-dark">IVA (19% sobre subtotal)</TableCell>
                <TableCell className="text-right font-medium text-koda-blue-dark">{formatearMoneda(resultados.ivaEmpresa)}</TableCell>
              </TableRow>
              <TableRow className="bg-koda-blue/5 hover:bg-koda-blue/10 border-t-2">
                <TableCell className="font-bold text-koda-blue text-lg">Costo Total a Pagar</TableCell>
                <TableCell className="text-right font-bold text-koda-blue text-2xl">
                  {formatearMoneda(resultados.costoTotalEmpresa)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 p-4 bg-koda-purple rounded-lg flex items-start gap-3 borde">
          <p className="text-xs text-koda-white leading-relaxed italic">
            * El cálculo incluye: Salario base por horas, recargos adicionales, auxilio de transporte (si aplica), ganancia proyectada ({gananciaPercent}%) e IVA (19%).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
