import { useState, useCallback } from 'react';
import { salariosService } from '@/lib/salarios-service';
import type { SalarioConfig } from '@/types';

export function useSalarios() {
  const [config, setConfig] = useState<SalarioConfig | null>(null);
  const [multipliers, setMultipliers] = useState<Record<string, number> | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLatestConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [salarioConfigData, cargosData] = await Promise.all([
        salariosService.getLatestConfig(),
        salariosService.getCargos(),
      ]);

      setConfig(salarioConfigData);

      if (cargosData) {
        const multipliersMap = Object.fromEntries(cargosData.map(c => [c.nombre, c.multiplicador]));
        setMultipliers(multipliersMap);
      }
    } catch (err) {
      console.error("Error al cargar datos de salarios:", err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { config, multipliers, loading, error, fetchLatestConfig };
}