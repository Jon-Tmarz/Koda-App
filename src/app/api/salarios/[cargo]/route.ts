import { NextResponse } from "next/server";
import type { CargoTipo } from "@/types/salarios";
import { salariosApiService } from "@/lib/salarios-api-service";

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

    const { multipliers } = await salariosApiService.getApiConfig(new Date().getFullYear()); // Año no es crítico aquí, solo para obtener multipliers

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

    // Usar el servicio centralizado
    const { config, exchangeRate, rate, usingFallbackConfig } = await salariosApiService.getApiConfig(año);
    const cargoData = salariosApiService.buildCargoData(cargo as CargoTipo, config, multipliers, rate);

    return NextResponse.json({
      success: true,
      data: {
        ...salariosApiService.buildApiMetadata(año, config, exchangeRate, rate, usingFallbackConfig),
        ...cargoData,
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
