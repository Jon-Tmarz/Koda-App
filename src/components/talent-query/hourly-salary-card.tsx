import { Clock, Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SalarioPorHora, SalarioConfig } from "@/types/salarios";
import { formatearMoneda } from "@/lib/salarios";

interface HourlySalaryCardProps {
  resultado: SalarioPorHora;
  config: SalarioConfig;
}

export function HourlySalaryCard({ resultado, config }: HourlySalaryCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Salario por Hora - {resultado.cargo}
        </CardTitle>
        <CardDescription>
          Basado en {config.horasLegales} horas legales mensuales
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
                {formatearMoneda(resultado.salarioHoraBase)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Costo Empresa por Hora</TableCell>
              <TableCell className="text-right">
                {formatearMoneda(resultado.costoHoraEmpresa)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ganancia por Hora</TableCell>
              <TableCell className="text-right">
                {formatearMoneda(resultado.gananciaHora)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>IVA por Hora</TableCell>
              <TableCell className="text-right">
                {formatearMoneda(resultado.ivaHora)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-primary/5">
              <TableCell className="font-bold text-lg">
                TOTAL POR HORA
              </TableCell>
              <TableCell className="text-right font-bold text-lg text-primary">
                {formatearMoneda(resultado.totalPorHora)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Ejemplos de Cálculo
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>8 horas (1 día):</span>
              <span className="font-medium">
                {formatearMoneda(resultado.totalPorHora * 8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>40 horas (1 semana):</span>
              <span className="font-medium">
                {formatearMoneda(resultado.totalPorHora * 40)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>80 horas (2 semanas):</span>
              <span className="font-medium">
                {formatearMoneda(resultado.totalPorHora * 80)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{config.horasLegales} horas (1 mes):</span>
              <span className="font-medium">
                {formatearMoneda(resultado.totalPorHora * config.horasLegales)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
