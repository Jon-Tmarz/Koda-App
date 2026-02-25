import { NextResponse } from "next/server";
import { calcularSalarioCompleto, calcularHorasExtrasYRecargos, type SalarioConfig } from "@/lib/salarios";
import type { CargoTipo } from "@/types/salarios";
import { getSalarioConfig } from "@/lib/firestore-services";
import { getLatestExchangeRate } from "@/lib/divisas-service";


/**
 * Redondea un número a 2 decimales
 */
const round2 = (num: number): number => Math.round(num * 100) / 100;

/**
 * Convierte COP a USD usando el último exchange rate de Firestore
 * Crea un objeto con valores en COP y USD
 */
const dualCurrency = (cop: number, rate: number) => ({
  cop: round2(cop),
  usd: round2(cop / rate)
});

/**
 * GET /api/salarios/[cargo]?año=2025
 * Retorna los valores por hora para un cargo específico con sus recargos legales
 * 
 * @param params.cargo - Nombre del cargo (Auxiliar, Técnico, Tecnólogo, Profesional, Especialista, Master)
 * @query año - Año para consultar la configuración (ej: 2025, 2026)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ cargo: string }> }
) {
  try {
    const { cargo } = await params;
    
    // Obtener multiplicadores de Firestore
    const { getCargos } = await import("@/lib/firestore-services");
    const cargosDb = await getCargos();    
    const multipliers: Record<string, number> = {};
    cargosDb.forEach(c => {
        multipliers[c.nombre] = c.multiplicador;
    });

    // Validar que el cargo existe
    if (!(cargo in multipliers)) {
      return NextResponse.json(
        {
          success: false,
          error: "Cargo no válido",
          message: `El cargo "${cargo}" no existe. Cargos válidos: ${Object.keys(multipliers).join(", ")}`,
        },
        { status: 400 }
      );
    }

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
    let config = await getSalarioConfig(año);
    let usingFallbackConfig = false;
    
    // Si no existe configuración para ese año, usar una de respaldo para evitar el error 404
    if (!config) {
      usingFallbackConfig = true;
      config = {
        año: año,
        salarioBase: 1300000, // SMMLV 2024 como fallback razonable
        auxilioTransporte: 162000, // Aux. Transporte 2024
        horasLegales: 192,
        costoEmpleado: 48.3, // Carga prestacional aproximada
        ganancia: 30,
        iva: 19,
      } as SalarioConfig;
    }

    // Obtener exchange rate para conversión USD
    const exchangeRate = await getLatestExchangeRate();
    const rate = exchangeRate?.rate || 4000; // Fallback si no hay rate guardado
    
    // Calcular salario para el cargo específico con multiplicadores dinámicos
    const salarioCompleto = calcularSalarioCompleto(config, cargo as CargoTipo, multipliers);
    const recargos = calcularHorasExtrasYRecargos(salarioCompleto.porHora);

    return NextResponse.json({
      success: true,
      data: {
        cargo,
        multiplicador: salarioCompleto.mensual.multiplicador,
        horasLegales: config.horasLegales,
        año,
        configStatus: {
          isFallback: usingFallbackConfig,
          message: usingFallbackConfig 
            ? `ADVERTENCIA: No se encontró configuración para ${año}. Usando valores de respaldo.` 
            : `Configuración para ${año} cargada correctamente.`
        },
        currentRate: {
          divisa: "USD/COP",
          rate: exchangeRate?.rate || rate,
          timestamp: exchangeRate?.timestamp || null,
          fallback: !exchangeRate,
        },
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
      },
    });
  } catch (error) {
    console.error("Error al obtener salario:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al calcular el salario",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
