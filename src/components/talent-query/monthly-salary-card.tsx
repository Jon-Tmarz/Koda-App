import { Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SalarioMensual, SalarioConfig } from "@/types/salarios";
import { formatearMoneda } from "@/lib/salarios";

interface MonthlySalaryCardProps {
  resultado: SalarioMensual;
  config: SalarioConfig;
}

export function MonthlySalaryCard({ resultado, config }: MonthlySalaryCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Salario Mensual - {resultado.cargo}
        </CardTitle>
        <CardDescription>
          Multiplicador: {resultado.multiplicador}x | Año: {config.año}
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
                {formatearMoneda(resultado.salarioBaseCargo)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Auxilio de Transporte</TableCell>
              <TableCell className="text-right">
                {formatearMoneda(resultado.auxilioTransporte)}
              </TableCell>
            </TableRow>
            <TableRow className="border-t-2">
              <TableCell className="font-medium">Salario Bruto</TableCell>
              <TableCell className="text-right font-medium">
                {formatearMoneda(resultado.salarioBruto)}
              </TableCell>
            </TableRow>
            
            <TableRow className="bg-muted/30">
              <TableCell className="text-xs font-semibold uppercase text-muted-foreground" colSpan={2}>
                Deducciones del Empleado (Seguridad Social)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">Aporte Salud (4%)</TableCell>
              <TableCell className="text-right text-red-500">
                - {formatearMoneda(resultado.saludEmpleado)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">Aporte Pensión (4%)</TableCell>
              <TableCell className="text-right text-red-500">
                - {formatearMoneda(resultado.pensionEmpleado)}
              </TableCell>
            </TableRow>
            {resultado.fondoSolidaridad > 0 && (
              <TableRow>
                <TableCell className="pl-6">Fondo Solidaridad Pensional</TableCell>
                <TableCell className="text-right text-red-500">
                  - {formatearMoneda(resultado.fondoSolidaridad)}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="pl-6 font-medium text-xs">Total Deducciones</TableCell>
              <TableCell className="text-right font-medium text-red-600">
                {formatearMoneda(resultado.totalDeducciones)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-green-500/5">
              <TableCell className="font-semibold text-green-700 dark:text-green-400">
                SALARIO NETO (A recibir)
              </TableCell>
              <TableCell className="text-right font-bold text-green-700 dark:text-green-400 font-mono">
                {formatearMoneda(resultado.salarioNeto)}
              </TableCell>
            </TableRow>

            <TableRow className="bg-muted/30">
              <TableCell className="text-xs font-semibold uppercase text-muted-foreground" colSpan={2}>
                Costos de Empresa y Facturación
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Carga prestacional (+{(config.costoEmpleado).toFixed(1)}%)
              </TableCell>
              <TableCell className="text-right">
                {formatearMoneda(resultado.costoEmpresa)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-muted/10">
              <TableCell className="font-medium">Costo Empresa (Base + Carga)</TableCell>
              <TableCell className="text-right font-medium">
                {formatearMoneda(resultado.costoLaboralTotal)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ganancia ({config.ganancia}%)</TableCell>
              <TableCell className="text-right">
                {formatearMoneda(resultado.gananciaValor)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Subtotal</TableCell>
              <TableCell className="text-right font-medium">
                {formatearMoneda(resultado.subtotal)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>IVA ({config.iva}%)</TableCell>
              <TableCell className="text-right">
                {formatearMoneda(resultado.ivaValor)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-primary/5">
              <TableCell className="font-bold text-lg">
                TOTAL MENSUAL
              </TableCell>
              <TableCell className="text-right font-bold text-lg text-primary">
                {formatearMoneda(resultado.totalMensual)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
