import { Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RECARGOS_LABORALES } from "@/types/salarios";
import { formatearMoneda, HorasExtrasRecargos } from "@/lib/salarios";

interface LaborSurchargesCardProps {
  horasExtras: HorasExtrasRecargos;
}

export function LaborSurchargesCard({ horasExtras }: LaborSurchargesCardProps) {
  return (
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

        <div className="mt-6 p-4 rounded-lg bg-muted border border-border">
          <p className="text-sm text-foreground">
            <strong>Nota:</strong> Los recargos se calculan sobre el valor total por hora que ya incluye 
            salario base, carga prestacional, ganancia de la empresa e IVA.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
