import { NextResponse } from "next/server";
import { 
  calcularSalarioCompleto, 
  calcularHorasExtrasYRecargos 
} from "@/lib/salarios";
import { CARGOS_LIST } from "@/types/salarios";
import type { CargoTipo } from "@/types/salarios";
import { getSalarioConfig } from "@/lib/firestore-services";
import { getLatestExchangeRate } from "@/lib/divisas-service";

/**
 * Redondea un número a 2 decimales
 */
const round2 = (num: number): number => Math.round(num * 100) / 100;

/**
 * Convierte COP a USD usando el último exchange rate de Firestore
 */
const copToUsd = (cop: number, rate: number): number => round2(cop / rate);

/**
 * Crea un objeto con valores en COP y USD
 */
const dualCurrency = (cop: number, rate: number) => ({
  cop: round2(cop),
  usd: copToUsd(cop, rate)
});

/**
 * GET /api/salarios?año=2025
 * Retorna los valores por hora para todos los cargos con sus recargos legales
 * 
 * @query año - Año para consultar la configuración (ej: 2025, 2026)
 */
export async function GET(request: Request) {
  try {
    // Obtener año desde query params
    const { searchParams } = new URL(request.url);
    const añoParam = searchParams.get("año");
    const año = añoParam ? parseInt(añoParam) : new Date().getFullYear();

    // Validar año
    if (isNaN(año) || año < 2020 || año > 2100) {
      return NextResponse.json(
        {
          success: false,
          error: "Año no válido",
          message: "El año debe ser un número entre 2020 y 2100",
        },
        { status: 400 }
      );
    }

    // Obtener configuración desde Firestore
    const config = await getSalarioConfig(año);
    
    // Si no existe configuración para ese año, usar default
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuración no encontrada",
          message: `No existe configuración de salarios para el año ${año}`,
        },
        { status: 404 }
      );
    }

    // Obtener exchange rate para conversión USD
    const exchangeRate = await getLatestExchangeRate();
    const rate = exchangeRate?.rate || 4000; // Fallback si no hay rate guardado

    // Calcular valores por hora para todos los cargos
    const salarios = CARGOS_LIST.map((cargo: CargoTipo) => {
      const salarioCompleto = calcularSalarioCompleto(config, cargo);
      const recargos = calcularHorasExtrasYRecargos(salarioCompleto.porHora);
      
      return {
        cargo,
        multiplicador: salarioCompleto.mensual.multiplicador,
        horasLegales: config.horasLegales,
        desglose: {
          salarioBasePorHora: dualCurrency(salarioCompleto.porHora.salarioHoraBase, rate),
          costoEmpresaPorHora: dualCurrency(salarioCompleto.porHora.costoHoraEmpresa, rate),
          gananciaPorHora: dualCurrency(salarioCompleto.porHora.gananciaHora, rate),
          ivaPorHora: dualCurrency(salarioCompleto.porHora.ivaHora, rate),
          totalPorHora: dualCurrency(salarioCompleto.porHora.totalPorHora, rate),
        },
        tiposDeHora: {
          horaOrdinaria: {
            recargo: 0,
            valorPorHora: dualCurrency(recargos.valorHoraBase, rate),
          },
          horaExtraDiurna: {
            recargo: recargos.horaExtraDiurna.recargo,
            valorPorHora: dualCurrency(recargos.horaExtraDiurna.valorPorHora, rate),
          },
          recargoNocturno: {
            recargo: recargos.recargoNocturno.recargo,
            valorPorHora: dualCurrency(recargos.recargoNocturno.valorPorHora, rate),
          },
          horaExtraNocturna: {
            recargo: recargos.horaExtraNocturna.recargo,
            valorPorHora: dualCurrency(recargos.horaExtraNocturna.valorPorHora, rate),
          },
          dominicalFestivo: {
            recargo: recargos.dominicalFestivo.recargo,
            valorPorHora: dualCurrency(recargos.dominicalFestivo.valorPorHora, rate),
          },
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        año: config.año,
        salarioBase: config.salarioBase,
        horasLegales: config.horasLegales,
        currentRate: {
          divisa: "USD/COP",
          rate,
          timestamp: exchangeRate?.timestamp,
          fallback: !exchangeRate,
        },
        salarios,
      },
    });
  } catch (error) {
    console.error("Error al obtener salarios:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al calcular los salarios",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
