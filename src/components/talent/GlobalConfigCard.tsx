"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { SalarioConfig } from "@/types/salarios";

interface GlobalConfigCardProps {
  formData: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">;
  setFormData: (data: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">) => void;
  loading: boolean;
  incremento: number;
  previousConfig: SalarioConfig | null;
  currentYear: number;
}

export function GlobalConfigCard({
  formData,
  setFormData,
  loading,
  incremento,
  previousConfig,
  currentYear
}: GlobalConfigCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Cálculo de Salario Base</CardTitle>
        <CardDescription>
          Valores del SMMLV y parámetros prestacionales
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="año" className="text-sm font-medium">
                    Año Aplicación
                  </label>
                  <Input
                    id="año"
                    type="number"
                    value={formData.año}
                    onChange={(e) =>
                      setFormData({ ...formData, año: parseInt(e.target.value) || currentYear })
                    }
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="salarioBase" className="text-sm font-medium">
                    Salario Mínimo (SMMLV)
                  </label>
                  <Input
                    id="salarioBase"
                    type="number"
                    value={formData.salarioBase}
                    onChange={(e) =>
                      setFormData({ ...formData, salarioBase: parseFloat(e.target.value) || 0 })
                    }
                  />
                  {previousConfig && (
                    <p className="text-xs text-muted-foreground">
                      Inc: <span className={incremento > 0 ? "text-green-500" : "text-red-500"}>
                        {incremento.toFixed(2)}%
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="auxilioTransporte" className="text-sm font-medium">
                  Auxilio de Transporte
                </label>
                <Input
                  id="auxilioTransporte"
                  type="number"
                  value={formData.auxilioTransporte}
                  onChange={(e) =>
                    setFormData({ ...formData, auxilioTransporte: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="horasLegales" className="text-sm font-medium">
                    Horas/Mes
                  </label>
                  <Input
                    id="horasLegales"
                    type="number"
                    value={formData.horasLegales}
                    onChange={(e) =>
                      setFormData({ ...formData, horasLegales: parseInt(e.target.value) || 182 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="costoEmpleado" className="text-sm font-medium">
                    Carga Prestacional (%)
                  </label>
                  <Input
                    id="costoEmpleado"
                    type="number"
                    value={formData.costoEmpleado}
                    onChange={(e) =>
                      setFormData({ ...formData, costoEmpleado: parseFloat(e.target.value) || 48.3 })
                    }
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="ganancia" className="text-sm font-medium">
                    Utilidad (%)
                  </label>
                  <Input
                    id="ganancia"
                    type="number"
                    value={formData.ganancia}
                    onChange={(e) =>
                      setFormData({ ...formData, ganancia: parseFloat(e.target.value) || 30 })
                    }
                    step="0.1"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="iva" className="text-sm font-medium">
                    IVA (%)
                  </label>
                  <Input
                    id="iva"
                    type="number"
                    value={formData.iva}
                    onChange={(e) =>
                      setFormData({ ...formData, iva: parseFloat(e.target.value) || 19 })
                    }
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
