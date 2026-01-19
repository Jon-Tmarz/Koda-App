"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
import { Loader2, Save } from "lucide-react";
import type { ConfiguracionGlobal } from "@/types";

const currencies = [
  { value: "COP", label: "COP - Peso Colombiano" },
  { value: "USD", label: "USD - Dólar Estadounidense" },
  { value: "MXN", label: "MXN - Peso Mexicano" },
  { value: "EUR", label: "EUR - Euro" },
];

export default function GlobalConfigCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfiguracionGlobal>({
    moneda: "COP",
    iva: 19,
    empresa: "Koda",
    logo: "",
  });

  const loadConfig = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "configuracion", "global");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setConfig(docSnap.data() as ConfiguracionGlobal);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "configuracion", "global");
      await setDoc(docRef, config);
      alert("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/40 max-w-2xl">
      <CardHeader>
        <CardTitle>Configuración Global</CardTitle>
        <CardDescription>
          Configuración general de la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="empresa" className="text-sm font-medium">
                Nombre de la Empresa
              </label>
              <Input
                id="empresa"
                value={config.empresa}
                onChange={(e) =>
                  setConfig({ ...config, empresa: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="moneda" className="text-sm font-medium">
                Moneda
              </label>
              <select
                id="moneda"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={config.moneda}
                onChange={(e) =>
                  setConfig({ ...config, moneda: e.target.value })
                }
              >
                {currencies.map((moneda) => (
                  <option key={moneda.value} value={moneda.value}>
                    {moneda.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="iva" className="text-sm font-medium">
                IVA (%)
              </label>
              <Input
                id="iva"
                type="number"
                value={config.iva}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    iva: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="logo" className="text-sm font-medium">
                URL del Logo
              </label>
              <Input
                id="logo"
                value={config.logo}
                onChange={(e) =>
                  setConfig({ ...config, logo: e.target.value })
                }
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>

            <div className="pt-4">
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
  );
}
