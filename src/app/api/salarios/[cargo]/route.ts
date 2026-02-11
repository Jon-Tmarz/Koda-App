import { NextResponse } from "next/server";
import { 
  calcularSalarioCompleto, 
  calcularHorasExtrasYRecargos 
} from "@/lib/salarios";
import { CARGO_MULTIPLICADORES } from "@/types/salarios";
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
    const multipliers: Record<string, number> = { ...CARGO_MULTIPLICADORES };
    
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
    const config = await getSalarioConfig(año);
    
    // Si no existe configuración para ese año, retornar error
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
    
    // Calcular salario para el cargo específico con multiplicadores dinámicos
    const salarioCompleto = calcularSalarioCompleto(config, cargo as CargoTipo, multipliers);
    const recargos = calcularHorasExtrasYRecargos(salarioCompleto.porHora);

    return NextResponse.json({
      success: true,
      data: {
        cargo,
        multiplicador: salarioCompleto.mensual.multiplicador,
        horasLegales: config.horasLegales,
        currentRate: {
          divisa: "USD/COP",
          currentRate: exchangeRate?.rate || rate,
          timestamp: exchangeRate?.timestamp,
          fallback: !exchangeRate,
        },
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
            recargoTexto: "-",
            valorPorHora: dualCurrency(recargos.valorHoraBase, rate),
          },
          horaExtraDiurna: {
            recargo: recargos.horaExtraDiurna.recargo,
            recargoTexto: `+${recargos.horaExtraDiurna.recargo * 100}%`,
            valorPorHora: dualCurrency(recargos.horaExtraDiurna.valorPorHora, rate),
          },
          recargoNocturno: {
            recargo: recargos.recargoNocturno.recargo,
            recargoTexto: `+${recargos.recargoNocturno.recargo * 100}%`,
            valorPorHora: dualCurrency(recargos.recargoNocturno.valorPorHora, rate),
          },
          horaExtraNocturna: {
            recargo: recargos.horaExtraNocturna.recargo,
            recargoTexto: `+${recargos.horaExtraNocturna.recargo * 100}%`,
            valorPorHora: dualCurrency(recargos.horaExtraNocturna.valorPorHora, rate),
          },
          dominicalFestivo: {
            recargo: recargos.dominicalFestivo.recargo,
            recargoTexto: `+${recargos.dominicalFestivo.recargo * 100}%`,
            valorPorHora: dualCurrency(recargos.dominicalFestivo.valorPorHora, rate),
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
