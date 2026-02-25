"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CargoFactorsCardProps {
  multipliersData: Record<string, number>;
  onMultiplierChange: (cargo: string, value: number) => void;
}

export function CargoFactorsCard({
  multipliersData,
  onMultiplierChange
}: CargoFactorsCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Niveles de Cargo</CardTitle>
        <CardDescription>
          Ajusta los multiplicadores que definen la escala salarial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg border border-border/40 mb-4">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              El salario mensual de cada cargo se calcula multiplicando el 
              <strong> Salario Base</strong> por el <strong> Factor</strong> definido a continuación.
            </p>
          </div>

          <div className="grid gap-4">
            {Object.entries(multipliersData).map(([cargo, value]) => (
              <div key={cargo} className="flex items-center gap-4 bg-card p-3 rounded-lg border border-border/40">
                <div className="flex-1">
                  <label className="text-sm font-semibold">{cargo}</label>
                  <p className="text-[10px] text-muted-foreground uppercase">Multiplicador</p>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => onMultiplierChange(cargo, parseFloat(e.target.value) || 0)}
                    step="0.1"
                    className="text-right font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
