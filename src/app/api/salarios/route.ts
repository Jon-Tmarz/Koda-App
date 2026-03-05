import { NextResponse } from "next/server";
import { CARGOS_LIST } from "@/types/salarios";
import type { CargoTipo } from "@/types/salarios";
import { salariosApiService } from "@/lib/salarios-api-service";

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

    // Usar el servicio centralizado para obtener toda la configuración
    const { config, multipliers, exchangeRate, rate, usingFallbackConfig } = await salariosApiService.getApiConfig(año);

    // Calcular valores por hora para todos los cargos
    const salarios = CARGOS_LIST.map((cargo: CargoTipo) => 
      salariosApiService.buildCargoData(cargo, config, multipliers, rate)
    );

    return NextResponse.json({
      success: true,
      data: {
        ...salariosApiService.buildApiMetadata(año, config, exchangeRate, rate, usingFallbackConfig),
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
