"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { SalarioConfig, DEFAULT_SALARIO_CONFIG } from "@/types/salarios";
import { calcularIncremento, formatearMoneda } from "@/lib/salarios";

export default function EditSalarioPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previousConfig, setPreviousConfig] = useState<SalarioConfig | null>(null);
  const [formData, setFormData] = useState<Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">>({
    ...DEFAULT_SALARIO_CONFIG,
    año: currentYear,
  });

  // Cargar configuración existente
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar configuración del año actual
      const docRef = doc(db, "salarios", String(currentYear));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as SalarioConfig;
        setFormData({
          año: data.año,
          salarioBase: data.salarioBase,
          auxilioTransporte: data.auxilioTransporte,
          horasLegales: data.horasLegales,
          iva: data.iva,
          ganancia: data.ganancia,
          costoEmpleado: data.costoEmpleado,
        });
      }

      // Cargar configuración del año anterior para calcular incremento
      const prevDocRef = doc(db, "salarios", String(currentYear - 1));
      const prevDocSnap = await getDoc(prevDocRef);
      if (prevDocSnap.exists()) {
        setPreviousConfig(prevDocSnap.data() as SalarioConfig);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "salarios", String(formData.año));
      
      await setDoc(docRef, {
        ...formData,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });

      alert("Configuración de salario guardada exitosamente");
      router.push("/dashboard/talent");
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const incremento = previousConfig
    ? calcularIncremento(previousConfig.salarioBase, formData.salarioBase)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/talent/cost">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Salario {currentYear}
          </h2>
          <p className="text-muted-foreground">
            Configuración de salario base para cálculo de cotizaciones
          </p>
        </div>
      </div>

      {/* Advertencia */}
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-500">Importante</p>
            <p className="text-sm text-muted-foreground">
              Estás modificando el salario base y los parámetros de cálculo.
              Estos cambios afectarán todas las cotizaciones futuras que se
              generen en el sistema.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 max-w-2xl">
        <CardHeader>
          <CardTitle>Configuración de Salario</CardTitle>
          <CardDescription>
            Ingresa los valores para el cálculo de costos de talento humano
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Campos Obligatorios */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Campos Obligatorios
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="año" className="text-sm font-medium">
                      Año <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="año"
                      type="number"
                      value={formData.año}
                      onChange={(e) =>
                        setFormData({ ...formData, año: parseInt(e.target.value) || currentYear })
                      }
                      min={2020}
                      max={2100}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="salarioBase" className="text-sm font-medium">
                      Salario Base (SMMLV) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="salarioBase"
                      type="number"
                      value={formData.salarioBase}
                      onChange={(e) =>
                        setFormData({ ...formData, salarioBase: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="1423500"
                    />
                    {previousConfig && (
                      <p className="text-xs text-muted-foreground">
                        Anterior: {formatearMoneda(previousConfig.salarioBase)} | 
                        Incremento: <span className={incremento > 0 ? "text-green-500" : "text-red-500"}>
                          {incremento.toFixed(2)}%
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="auxilioTransporte" className="text-sm font-medium">
                    Auxilio de Transporte <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="auxilioTransporte"
                    type="number"
                    value={formData.auxilioTransporte}
                    onChange={(e) =>
                      setFormData({ ...formData, auxilioTransporte: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="200000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Aplica para cargos con salario ≤ 2 SMMLV (Auxiliar y Técnico)
                  </p>
                </div>
              </div>

              {/* Campos Opcionales */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Campos Opcionales
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="horasLegales" className="text-sm font-medium">
                      Horas Legales Mensuales
                    </label>
                    <Input
                      id="horasLegales"
                      type="number"
                      value={formData.horasLegales}
                      onChange={(e) =>
                        setFormData({ ...formData, horasLegales: parseInt(e.target.value) || 192 })
                      }
                      placeholder="192"
                    />
                    <p className="text-xs text-muted-foreground">
                      Por defecto: 192 horas (8h × 24 días)
                    </p>
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
                      placeholder="19"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Colombia: 19%
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="ganancia" className="text-sm font-medium">
                      Ganancia Empresa (%)
                    </label>
                    <Input
                      id="ganancia"
                      type="number"
                      value={formData.ganancia}
                      onChange={(e) =>
                        setFormData({ ...formData, ganancia: parseFloat(e.target.value) || 30 })
                      }
                      placeholder="30"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Margen de ganancia sobre el costo
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="costoEmpleado" className="text-sm font-medium">
                      Factor Costo Empleado
                    </label>
                    <Input
                      id="costoEmpleado"
                      type="number"
                      value={formData.costoEmpleado}
                      onChange={(e) =>
                        setFormData({ ...formData, costoEmpleado: parseFloat(e.target.value) || 1.5 })
                      }
                      placeholder="1.5"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      Factor que incluye prestaciones, seguridad social, etc. (1.5 = 50% adicional)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/dashboard/talent">
                  <Button variant="outline">Cancelar</Button>
                </Link>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
