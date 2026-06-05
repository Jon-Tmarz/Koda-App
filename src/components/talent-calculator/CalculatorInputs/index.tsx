"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

interface CalculatorInputsProps {
  salarioInput: string;
  setSalarioInput: (val: string) => void;
  horas: number;
  setHoras: (val: number) => void;
  extras: any;
  setExtras: (val: any) => void;
  placeholderSalario?: string;
}

const Separator = () => <div className="h-px w-full bg-border" />;

export function CalculatorInputs({
  salarioInput,
  setSalarioInput,
  horas,
  setHoras,
  extras,
  setExtras,
  placeholderSalario
}: CalculatorInputsProps) {
  return (
    <div className="max-w-2xl mx-auto w-full bg-koda-white">
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-koda-purple">
            <Calculator className="h-5 w-5 text-koda-purple" />
            Configuración de Cálculo
          </CardTitle>
          <CardDescription className="text-koda-blue-dark">
            Ingresa el salario mensual base y las horas para obtener el desglose.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="salario" className="text-koda-blue-dark">Salario Base Mensual (COP)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-koda-blue-dark">$</span>
                <Input
                  id="salario"
                  type="number"
                  className="pl-7 bg-koda-silver/25 focus:bg-koda-silver/50 transition-colors focus:outline-none rounded-lg"
                  placeholder={placeholderSalario || "0"}
                  value={salarioInput}
                  onChange={(e) => setSalarioInput(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="horas" className="text-koda-blue-dark">Horas a Calcular</Label>
              <Input
                id="horas"
                type="number"
                className="bg-koda-silver/25 focus:bg-koda-silver/50 transition-colors focus:outline-none rounded-lg"
                value={horas}
                onChange={(e) => setHoras(Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-koda-purple">Horas Extras y Recargos (Opcional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="e-diurnas" className="text-xs text-muted-koda-blue-dark">Extras Diurnas (+25%)</Label>
                <Input
                  id="e-diurnas"
                  type="number"
                  className="bg-koda-silver/25 focus:bg-koda-silver/50 transition-colors focus:outline-none rounded-lg"
                  placeholder="0"
                  value={extras.diurnas || ""}
                  onChange={(e) => setExtras({ ...extras, diurnas: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="e-nocturnas" className="text-xs text-muted-koda-blue-dark">Extras Nocturnas (+75%)</Label>
                <Input
                  id="e-nocturnas"
                  className="bg-koda-silver/25 focus:bg-koda-silver/50 transition-colors focus:outline-none rounded-lg"
                  type="number"
                  placeholder="0"
                  value={extras.nocturnas || ""}
                  onChange={(e) => setExtras({ ...extras, nocturnas: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="recargo-n" className="text-xs text-muted-koda-blue-dark">Recargo Nocturno (+35%)</Label>
                <Input
                  id="recargo-n"
                  className="bg-koda-silver/25 focus:bg-koda-silver/50 transition-colors focus:outline-none rounded-lg"
                  type="number"
                  placeholder="0"
                  value={extras.recargoNocturno || ""}
                  onChange={(e) => setExtras({ ...extras, recargoNocturno: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="dominicales" className="text-xs text-muted-koda-blue-dark">Dominical/Festivo (+80%)</Label>
                <Input
                  id="dominicales"
                  className="bg-koda-silver/25 focus:bg-koda-silver/50 transition-colors focus:outline-none rounded-lg"
                  type="number"
                  placeholder="0"
                  value={extras.dominicales || ""}
                  onChange={(e) => setExtras({ ...extras, dominicales: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
