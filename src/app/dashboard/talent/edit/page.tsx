"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { SalarioConfig, DEFAULT_SALARIO_CONFIG, CARGO_MULTIPLICADORES, CargoTipo } from "@/types/salarios";
import { calcularIncremento } from "@/lib/salarios";
import { useSalarios } from "@/hooks/use-salarios";
import { GlobalConfigCard } from "./components/GlobalConfigCard";
import { CargoFactorsCard } from "./components/CargoFactorsCard";

export default function EditSalarioPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const { config: remoteConfig, allConfigs, cargos, loading, saveConfig, saveCargo, fetchAllConfigs, fetchCargos } = useSalarios();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">>({
    ...DEFAULT_SALARIO_CONFIG,
    año: currentYear,
  });

  // Estado para los multiplicadores (cargamos de la base o usamos los por defecto)
  const [multipliersData, setMultipliersData] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.entries(CARGO_MULTIPLICADORES).map(([key, val]) => [key, val])
    )
  );

  // Cargar historial y cargos
  useEffect(() => {
    fetchAllConfigs();
    fetchCargos();
  }, [fetchAllConfigs, fetchCargos]);

  // Sincronizar con datos de Firestore al cargar
  useEffect(() => {
    if (remoteConfig) {
      setFormData({
        año: remoteConfig.año,
        salarioBase: remoteConfig.salarioBase,
        auxilioTransporte: remoteConfig.auxilioTransporte,
        horasLegales: remoteConfig.horasLegales,
        iva: remoteConfig.iva,
        ganancia: remoteConfig.ganancia,
        costoEmpleado: remoteConfig.costoEmpleado,
      });
    }
  }, [remoteConfig?.id]);

  // Sincronizar multiplicadores cuando cargan de Firestore
  useEffect(() => {
    if (cargos && cargos.length > 0) {
      const newMap: Record<string, number> = { ...multipliersData };
      cargos.forEach(c => {
        newMap[c.nombre] = c.multiplicador;
      });
      setMultipliersData(newMap);
    }
  }, [cargos]);

  const previousConfig = allConfigs.find(c => c.año === formData.año - 1) || null;

  const handleSave = async () => {
    setSaving(true);
    const success = await saveConfig(formData);
    
    // Guardar también los multiplicadores
    const cargoPromises = Object.entries(multipliersData).map(([nombre, multiplicador]) => 
      saveCargo({
        nombre: nombre as CargoTipo,
        multiplicador,
        activo: true
      })
    );
    
    await Promise.all(cargoPromises);

    setSaving(false);
    if (success) {
      router.push("/dashboard/talent/cost");
    }
  };

  const incremento = previousConfig
    ? calcularIncremento(previousConfig.salarioBase, formData.salarioBase)
    : 0;

  const handleMultiplierChange = (cargo: string, value: number) => {
    setMultipliersData(prev => ({
      ...prev,
      [cargo]: value
    }));
  };

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
            Configuración del Talento
          </h2>
          <p className="text-muted-foreground">
            Ajusta los parámetros financieros y niveles salariales
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
              Estás modificando parámetros globales. Estos cambios afectarán todas las cotizaciones y cálculos de costos futuros.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlobalConfigCard 
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          incremento={incremento}
          previousConfig={previousConfig}
          currentYear={currentYear}
        />

        <CargoFactorsCard 
          multipliersData={multipliersData}
          onMultiplierChange={handleMultiplierChange}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
        <Link href="/dashboard/talent/cost" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full" disabled={saving}>Cancelar</Button>
        </Link>
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto px-8">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando Cambios...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Aplicar Cambios Globales
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

