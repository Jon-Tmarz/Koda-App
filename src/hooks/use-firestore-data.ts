// Hook personalizado para obtener configuración de salarios de Firestore
"use client";

import { useState, useEffect, useCallback } from "react";
import type { SalarioConfig } from "@/types/salarios";
import { DEFAULT_SALARIO_CONFIG } from "@/types/salarios";
import {
  getLatestSalarioConfig,
  getSalarioConfig,
  getAllSalarioConfigs,
  saveSalarioConfig,
  checkFirestoreConnection,
} from "@/lib/firestore-services";

interface UseSalarioConfigResult {
  config: SalarioConfig | null;
  allConfigs: SalarioConfig[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  refetch: () => Promise<void>;
  saveConfig: (config: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">) => Promise<boolean>;
}

export function useSalarioConfig(año?: number): UseSalarioConfigResult {
  const [config, setConfig] = useState<SalarioConfig | null>(null);
  const [allConfigs, setAllConfigs] = useState<SalarioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar conexión
      const connectionStatus = await checkFirestoreConnection();
      setIsOnline(connectionStatus.connected);

      if (!connectionStatus.connected) {
        // Si no hay conexión, usar valores por defecto
        console.warn("Firestore no disponible, usando configuración por defecto");
        setConfig({
          ...DEFAULT_SALARIO_CONFIG,
          id: "default",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setAllConfigs([]);
        return;
      }

      // Obtener configuración específica o la más reciente
      let fetchedConfig: SalarioConfig | null;
      
      if (año) {
        fetchedConfig = await getSalarioConfig(año);
      } else {
        fetchedConfig = await getLatestSalarioConfig();
      }

      // Si no existe en Firestore, usar valores por defecto
      if (!fetchedConfig) {
        setConfig({
          ...DEFAULT_SALARIO_CONFIG,
          id: "default",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        setConfig(fetchedConfig);
      }

      // Obtener todas las configuraciones
      const configs = await getAllSalarioConfigs();
      setAllConfigs(configs);

    } catch (err) {
      console.error("Error obteniendo configuración:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      
      // En caso de error, usar configuración por defecto
      setConfig({
        ...DEFAULT_SALARIO_CONFIG,
        id: "default",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, [año]);

  const saveConfigHandler = useCallback(async (
    newConfig: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">
  ): Promise<boolean> => {
    try {
      setError(null);
      
      if (!isOnline) {
        setError("No hay conexión a Firestore");
        return false;
      }

      await saveSalarioConfig(newConfig);
      await fetchConfig(); // Refrescar datos
      return true;
    } catch (err) {
      console.error("Error guardando configuración:", err);
      setError(err instanceof Error ? err.message : "Error al guardar");
      return false;
    }
  }, [isOnline, fetchConfig]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    allConfigs,
    loading,
    error,
    isOnline,
    refetch: fetchConfig,
    saveConfig: saveConfigHandler,
  };
}

// Hook para obtener servicios
export function useServicios() {
  const [servicios, setServicios] = useState<import("@/lib/firestore-services").Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        const { getServicios, checkFirestoreConnection } = await import("@/lib/firestore-services");
        
        const connection = await checkFirestoreConnection();
        if (!connection.connected) {
          setServicios([]);
          return;
        }

        const data = await getServicios();
        setServicios(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
        setServicios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  return { servicios, loading, error };
}

// Hook para obtener cargos
export function useCargos() {
  const [cargos, setCargos] = useState<import("@/lib/firestore-services").Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        setLoading(true);
        const { getCargos, checkFirestoreConnection } = await import("@/lib/firestore-services");
        
        const connection = await checkFirestoreConnection();
        if (!connection.connected) {
          // Usar cargos por defecto del archivo de tipos
          const { CARGO_MULTIPLICADORES } = await import("@/types/salarios");
          const defaultCargos = Object.entries(CARGO_MULTIPLICADORES).map(([nombre, mult]) => ({
            nombre: nombre as import("@/types/salarios").CargoTipo,
            multiplicador: mult,
            activo: true,
          }));
          setCargos(defaultCargos);
          return;
        }

        const data = await getCargos();
        if (data.length === 0) {
          // Si no hay cargos en Firestore, usar defaults
          const { CARGO_MULTIPLICADORES } = await import("@/types/salarios");
          const defaultCargos = Object.entries(CARGO_MULTIPLICADORES).map(([nombre, mult]) => ({
            nombre: nombre as import("@/types/salarios").CargoTipo,
            multiplicador: mult,
            activo: true,
          }));
          setCargos(defaultCargos);
        } else {
          setCargos(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
        // Usar cargos por defecto
        const { CARGO_MULTIPLICADORES } = await import("@/types/salarios");
        const defaultCargos = Object.entries(CARGO_MULTIPLICADORES).map(([nombre, mult]) => ({
          nombre: nombre as import("@/types/salarios").CargoTipo,
          multiplicador: mult,
          activo: true,
        }));
        setCargos(defaultCargos);
      } finally {
        setLoading(false);
      }
    };

    fetchCargos();
  }, []);

  return { cargos, loading, error };
}

// Hook para manejar talento
export function useTalento() {
  const [talento, setTalento] = useState<import("@/lib/firestore-services").Talento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTalento = useCallback(async () => {
    try {
      setLoading(true);
      const { getTalento, checkFirestoreConnection } = await import("@/lib/firestore-services");
      
      const connection = await checkFirestoreConnection();
      if (!connection.connected) {
        setTalento([]);
        return;
      }

      const data = await getTalento();
      setTalento(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setTalento([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTalento();
  }, [fetchTalento]);

  const addTalento = async (data: Omit<import("@/lib/firestore-services").Talento, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { saveTalento } = await import("@/lib/firestore-services");
      await saveTalento(data);
      await fetchTalento();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      return false;
    }
  };

  const editTalento = async (id: string, data: Partial<Omit<import("@/lib/firestore-services").Talento, "id" | "createdAt">>) => {
    try {
      const { updateTalento } = await import("@/lib/firestore-services");
      await updateTalento(id, data);
      await fetchTalento();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
      return false;
    }
  };

  const removeTalento = async (id: string) => {
    try {
      const { deleteTalento } = await import("@/lib/firestore-services");
      await deleteTalento(id);
      await fetchTalento();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      return false;
    }
  };

  return { 
    talento, 
    loading, 
    error, 
    refetch: fetchTalento,
    addTalento,
    editTalento,
    removeTalento,
  };
}
