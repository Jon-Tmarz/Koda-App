import { salariosService } from "@/lib/salarios-service";
import { getLatestExchangeRate } from "@/lib/divisas-service";
import { calcularSalarioCompleto, calcularHorasExtrasYRecargos } from "@/lib/salarios";
import type { SalarioConfig, CargoTipo } from "@/types";

/**
 * Redondea un número a 2 decimales.
 */
const round2 = (num: number): number => Math.round(num * 100) / 100;

/**
 * Crea un objeto con valores en COP y USD.
 */
const dualCurrency = (cop: number, rate: number) => ({
  cop: round2(cop),
  usd: round2(cop / rate),
});

/**
 * Obtiene los datos de configuración necesarios para los cálculos de la API.
 * Incluye lógica de fallback para configuración de salarios y tasa de cambio.
 */
async function getApiConfig(año: number) {
  // 1. Obtener configuración de salarios desde Firestore
  let config = await salariosService.getConfigByYear(año);
  let usingFallbackConfig = false;

  if (!config) {
    usingFallbackConfig = true;
    config = {
      año: año,
      salarioBase: 1300000, // SMMLV 2024 como fallback razonable
      auxilioTransporte: 162000,
      horasLegales: 192,
      costoEmpleado: 48.3,
      ganancia: 30,
      iva: 19,
    } as SalarioConfig;
  }

  // 2. Obtener multiplicadores de cargos desde Firestore
  const cargosDb = await salariosService.getCargos();
  const multipliers: Record<string, number> = {};
  cargosDb.forEach(c => {
    multipliers[c.nombre] = c.multiplicador;
  });

  // 3. Obtener tasa de cambio
  const exchangeRate = await getLatestExchangeRate();
  const rate = exchangeRate?.rate || 4000; // Fallback si no hay rate guardado

  return { config, multipliers, exchangeRate, rate, usingFallbackConfig };
}

/**
 * Construye la respuesta de datos para un cargo específico.
 */
function buildCargoData(
  cargo: CargoTipo,
  config: SalarioConfig,
  multipliers: Record<string, number>,
  rate: number
) {
  const salarioCompleto = calcularSalarioCompleto(config, cargo, multipliers);
  const recargos = calcularHorasExtrasYRecargos(salarioCompleto.porHora);

  return {
    cargo,
    multiplicador: salarioCompleto.mensual.multiplicador,
    horasLegales: config.horasLegales,
    desglosePorHora: {
      salarioBase: dualCurrency(salarioCompleto.porHora.salarioHoraBase, rate),
      costoEmpresa: dualCurrency(salarioCompleto.porHora.costoHoraEmpresa, rate),
      ganancia: dualCurrency(salarioCompleto.porHora.gananciaHora, rate),
      iva: dualCurrency(salarioCompleto.porHora.ivaHora, rate),
      auxTransporte: dualCurrency(salarioCompleto.porHora.auxTransporteHora || 0, rate),
      total: dualCurrency(salarioCompleto.porHora.totalPorHora, rate),
    },
    'extras&recargosHora': {
      ordinaria: {
        recargo: 0,
        valorPorHora: dualCurrency(recargos.valorHoraBase, rate),
      },
      extraDiurna: {
        recargo: recargos.horaExtraDiurna.recargo,
        valorPorHora: dualCurrency(recargos.horaExtraDiurna.valorPorHora, rate),
      },
      recargoNocturno: {
        recargo: recargos.recargoNocturno.recargo,
        valorPorHora: dualCurrency(recargos.recargoNocturno.valorPorHora, rate),
      },
      extraNocturna: {
        recargo: recargos.horaExtraNocturna.recargo,
        valorPorHora: dualCurrency(recargos.horaExtraNocturna.valorPorHora, rate),
      },
      dominicalFestivo: {
        recargo: recargos.dominicalFestivo.recargo,
        valorPorHora: dualCurrency(recargos.dominicalFestivo.valorPorHora, rate),
      },
      extraDiurnaFestiva: {
        recargo: recargos.extraDiurnaDominical.recargo,
        valorPorHora: dualCurrency(recargos.extraDiurnaDominical.valorPorHora, rate),
      },
      extraNocturnaFestiva: {
        recargo: recargos.extraNocturnaDominical.recargo,
        valorPorHora: dualCurrency(recargos.extraNocturnaDominical.valorPorHora, rate),
      },
    },
  };
}

/**
 * Construye la respuesta de metadatos de la API.
 */
function buildApiMetadata(
  año: number,
  config: SalarioConfig,
  exchangeRate: { rate: number; timestamp: any } | null,
  rate: number,
  usingFallbackConfig: boolean
) {
  return {
    año,
    salarioBase: config.salarioBase,
    horasLegales: config.horasLegales,
    configStatus: {
      isFallback: usingFallbackConfig,
      message: usingFallbackConfig ? `ADVERTENCIA: No se encontró configuración para ${año}. Usando valores de respaldo.` : `Configuración para ${año} cargada correctamente.`
    },
    currentRate: {
      divisa: "USD/COP",
      rate: exchangeRate?.rate || rate,
      timestamp: exchangeRate?.timestamp || null,
      fallback: !exchangeRate,
    },
  };
}

export const salariosApiService = {
  getApiConfig,
  buildCargoData,
  buildApiMetadata,
};