// src/app/api/divisas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateExchangeRate, getExchangeRates, getLatestExchangeRate } from "@/lib/divisas-service";

/**
 * GET - Obtener exchange rates
 * Query params:
 *  - latest=true: Retorna solo el último exchange rate
 *  - Sin params: Retorna todos los exchange rates (max 25)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latest = searchParams.get("latest");

    if (latest === "true") {
      const rate = await getLatestExchangeRate();
      if (!rate) {
        return NextResponse.json(
          { error: "No hay exchange rates almacenados" },
          { status: 404 }
        );
      }
      return NextResponse.json(rate);
    }

    const rates = await getExchangeRates();
    return NextResponse.json(rates);
  } catch (error) {
    console.error("Error en GET /api/divisas:", error);
    return NextResponse.json(
      { error: "Error al obtener exchange rates", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST - Consultar API y guardar nuevo exchange rate
 */
export async function POST(request: NextRequest) {
  try {
    const rate = await updateExchangeRate();
    return NextResponse.json(
      {
        success: true,
        message: "Exchange rate actualizado correctamente",
        data: rate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/divisas:", error);
    return NextResponse.json(
      { error: "Error al actualizar exchange rate", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
