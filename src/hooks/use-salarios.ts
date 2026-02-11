"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { salariosService, type Cargo } from "@/lib/salarios-service";
import type { SalarioConfig } from "@/types/salarios";
import { DEFAULT_SALARIO_CONFIG, CARGO_MULTIPLICADORES } from "@/types/salarios";
import { useToast } from "@/hooks/use-toast";

export function useSalarios() {
  const [config, setConfig] = useState<SalarioConfig | null>(null);
  const [allConfigs, setAllConfigs] = useState<SalarioConfig[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mapear cargos dinámicos a un objeto de multiplicadores
  const multipliers = useMemo(() => {
    const map = { ...CARGO_MULTIPLICADORES } as Record<string, number>;
    cargos.forEach(c => {
      map[c.nombre] = c.multiplicador;
    });
    return map;
  }, [cargos]);

  const fetchLatestConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await salariosService.getLatestConfig();
      if (data) {
        setConfig(data);
      } else {
        // Fallback a configuración por defecto si no existe en la DB
        setConfig({
          ...DEFAULT_SALARIO_CONFIG,
          id: 'default',
          createdAt: new Date(),
          updatedAt: new Date()
        } as SalarioConfig);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching latest salary config:", err);
      setError("No se pudo cargar la configuración de salarios");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await salariosService.getAllConfigs();
      setAllConfigs(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching all salary configs:", err);
      setError("No se pudo cargar el historial de configuraciones");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCargos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await salariosService.getCargos();
      setCargos(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching cargos:", err);
      setError("No se pudo cargar la lista de cargos");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = async (newConfig: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    try {
      await salariosService.saveConfig(newConfig);
      toast({
        title: "Configuración guardada",
        description: `Se actualizó la configuración para el año ${newConfig.año}`,
      });
      await fetchLatestConfig();
      await fetchAllConfigs();
      return true;
    } catch (err) {
      console.error("Error saving salary config:", err);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveCargo = async (cargo: Omit<Cargo, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    try {
      await salariosService.saveCargo(cargo);
      toast({
        title: "Cargo guardado",
        description: `El cargo ${cargo.nombre} ha sido actualizado`,
      });
      await fetchCargos();
      return true;
    } catch (err) {
      console.error("Error saving cargo:", err);
      toast({
        title: "Error",
        description: "No se pudo guardar el cargo",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfig = async (año: number) => {
    setLoading(true);
    try {
      await salariosService.deleteConfig(año);
      toast({
        title: "Configuración eliminada",
        description: `Se eliminó la configuración para el año ${año}`,
      });
      await fetchLatestConfig();
      await fetchAllConfigs();
      return true;
    } catch (err) {
      console.error("Error deleting salary config:", err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la configuración",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCargo = async (nombre: string) => {
    setLoading(true);
    try {
      await salariosService.deleteCargo(nombre);
      toast({
        title: "Cargo eliminado",
        description: `El cargo ${nombre} ha sido eliminado`,
      });
      await fetchCargos();
      return true;
    } catch (err) {
      console.error("Error deleting cargo:", err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cargo",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchLatestConfig();
    fetchCargos();
  }, [fetchLatestConfig, fetchCargos]);

  return {
    config,
    allConfigs,
    cargos,
    multipliers,
    loading,
    error,
    fetchLatestConfig,
    fetchAllConfigs,
    fetchCargos,
    saveConfig,
    saveCargo,
    deleteConfig,
    deleteCargo,
  };
}
