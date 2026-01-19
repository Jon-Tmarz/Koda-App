import { NextRequest, NextResponse } from "next/server";
import { getCotizaciones, saveCotizacion } from "@/lib/firestore-services";
import { Timestamp } from "firebase/firestore";
import { requireAPIKey } from "@/lib/api-auth";

/**
 * GET /api/quotes
 * Obtiene todas las cotizaciones
 * Requiere API key en header Authorization o X-API-Key
 */
export async function GET(request: NextRequest) {
  // Validar API key
  const auth = await requireAPIKey(request);
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const cotizaciones = await getCotizaciones();
    
    // Transformar datos para n8n (convertir Timestamps a ISO strings)
    const cotizacionesFormatted = cotizaciones.map(cot => ({
      id: cot.id,
      numero: cot.numero,
      items: cot.items,
      subtotal: cot.subtotal,
      iva: cot.iva,
      total: cot.total,
      estado: cot.estado,
      fecha: cot.fecha?.toDate?.()?.toISOString() || null,
      pdfUrl: cot.pdfUrl || null,
    }));

    return NextResponse.json({
      success: true,
      data: cotizacionesFormatted,
      count: cotizacionesFormatted.length,
    });
  } catch (error) {
    console.error("Error obteniendo cotizaciones:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener cotizaciones",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quotes
 * Crea una nueva cotización
 * Requiere API key en header Authorization o X-API-Key
 * 
 * Body:
 * {
 *   "numero": "COT-2026-0001",
 *   "items": [
 *     {
 *       "descripcion": "Desarrollo web",
 *       "horas": 40,
 *       "costoPorHora": 50000,
 *       "subtotal": 2000000
 *     }
 *   ],
 *   "subtotal": 2000000,
 *   "iva": 380000,
 *   "total": 2380000,
 *   "estado": "borrador" | "enviada" | "aprobada" | "rechazada"
 * }
 */
export async function POST(request: NextRequest) {
  // Validar API key
  const auth = await requireAPIKey(request);
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validaciones
    if (!body.numero) {
      return NextResponse.json(
        {
          success: false,
          error: "Validación fallida",
          message: "El número de cotización es requerido",
        },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validación fallida",
          message: "Debe incluir al menos un item",
        },
        { status: 400 }
      );
    }

    // Validar items
    for (const item of body.items) {
      if (!item.descripcion || typeof item.horas !== 'number' || typeof item.costoPorHora !== 'number') {
        return NextResponse.json(
          {
            success: false,
            error: "Validación fallida",
            message: "Cada item debe tener descripcion, horas y costoPorHora válidos",
          },
          { status: 400 }
        );
      }
    }

    // Validar estado
    const estadosValidos = ["borrador", "enviada", "aprobada", "rechazada"];
    if (!estadosValidos.includes(body.estado)) {
      return NextResponse.json(
        {
          success: false,
          error: "Validación fallida",
          message: `Estado debe ser uno de: ${estadosValidos.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Crear cotización
    const nuevaCotizacion = {
      numero: body.numero,
      items: body.items.map((item: {
        descripcion: string;
        horas: number;
        costoPorHora: number;
        subtotal: number;
      }) => ({
        descripcion: item.descripcion,
        horas: item.horas,
        costoPorHora: item.costoPorHora,
        subtotal: item.subtotal,
      })),
      subtotal: body.subtotal || 0,
      iva: body.iva || 0,
      total: body.total || 0,
      estado: body.estado,
      fecha: Timestamp.now(),
      pdfUrl: body.pdfUrl || "",
    };

    const docRef = await saveCotizacion(nuevaCotizacion);

    return NextResponse.json(
      {
        success: true,
        message: "Cotización creada exitosamente",
        data: {
          id: docRef.id,
          ...nuevaCotizacion,
          fecha: nuevaCotizacion.fecha.toDate().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando cotización:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear cotización",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
