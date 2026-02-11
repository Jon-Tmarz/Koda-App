"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { formatearMoneda } from "@/lib/salarios";

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
    <Card className="border-primary/10">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-foreground text-2xl font-bold">Costo Total Empresa</CardTitle>
        <CardDescription>Desglose total de inversión requerida para el cargo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-foreground font-semibold">Concepto de Gasto</TableHead>
                <TableHead className="text-right text-foreground font-semibold">Inversión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-foreground">Salario Base (Proporcional {horas}h)</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatearMoneda(resultados.salarioEmpresa)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Carga Empresa (+{costoEmpleadoPercent}%)</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatearMoneda(resultados.cargaEmpresa)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="text-muted-foreground font-medium">Costo Empresa (Base + Carga)</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatearMoneda(resultados.costoLaboralTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Ganancia ({gananciaPercent}%)</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatearMoneda(resultados.gananciaEmpresa)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Transporte y Recargos</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatearMoneda(resultados.subsidioTransporte + resultados.pagoRecargos)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">IVA (19% sobre subtotal)</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatearMoneda(resultados.ivaEmpresa)}</TableCell>
              </TableRow>
              <TableRow className="bg-primary/10 hover:bg-primary/10 border-t-2">
                <TableCell className="font-bold text-primary text-lg">Costo Total de Inversión</TableCell>
                <TableCell className="text-right font-bold text-primary text-2xl">
                  {formatearMoneda(resultados.costoTotalEmpresa)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-foreground/80 leading-relaxed italic">
            * El cálculo incluye: Salario base por horas, recargos adicionales, auxilio de transporte (si aplica), ganancia proyectada ({gananciaPercent}%) e IVA (19%).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
