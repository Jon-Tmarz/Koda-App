import { NextRequest, NextResponse } from "next/server";
import { getCotizacionById, updateCotizacion, deleteCotizacion } from "@/lib/firestore-services";
import { requireAPIKey } from "@/lib/api-auth";

/**
 * GET /api/quotes/[id]
 * Obtiene una cotización específica por ID
 * Requiere API key en header Authorization o X-API-Key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar API key
  const auth = await requireAPIKey(request);
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID no proporcionado",
          message: "Se requiere el ID de la cotización",
        },
        { status: 400 }
      );
    }

    const cotizacion = await getCotizacionById(id);

    if (!cotizacion) {
      return NextResponse.json(
        {
          success: false,
          error: "No encontrada",
          message: `No se encontró la cotización con ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Transformar para n8n
    const cotizacionFormatted = {
      id: cotizacion.id,
      numero: cotizacion.numero,
      items: cotizacion.items,
      subtotal: cotizacion.subtotal,
      iva: cotizacion.iva,
      total: cotizacion.total,
      estado: cotizacion.estado,
      fecha: cotizacion.fecha?.toDate?.()?.toISOString() || null,
      pdfUrl: cotizacion.pdfUrl || null,
    };

    return NextResponse.json({
      success: true,
      data: cotizacionFormatted,
    });
  } catch (error) {
    console.error("Error obteniendo cotización:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener cotización",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quotes/[id]
 * Actualiza una cotización existente
 * Requiere API key en header Authorization o X-API-Key
 * 
 * Body:
 * {
 *   "numero": "COT-2026-0001",
 *   "items": [...],
 *   "subtotal": 2000000,
 *   "iva": 380000,
 *   "total": 2380000,
 *   "estado": "aprobada"
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar API key
  const auth = await requireAPIKey(request);
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID no proporcionado",
          message: "Se requiere el ID de la cotización",
        },
        { status: 400 }
      );
    }

    // Verificar que la cotización existe
    const cotizacionExistente = await getCotizacionById(id);
    if (!cotizacionExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "No encontrada",
          message: `No se encontró la cotización con ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Validar estado si se proporciona
    if (body.estado) {
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
    }

    // Validar items si se proporcionan
    if (body.items) {
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Validación fallida",
            message: "Debe incluir al menos un item",
          },
          { status: 400 }
        );
      }

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
    }

    // Preparar datos para actualizar
    const updateData: Record<string, unknown> = {};
    
    if (body.numero !== undefined) updateData.numero = body.numero;
    if (body.items !== undefined) updateData.items = body.items;
    if (body.subtotal !== undefined) updateData.subtotal = body.subtotal;
    if (body.iva !== undefined) updateData.iva = body.iva;
    if (body.total !== undefined) updateData.total = body.total;
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.pdfUrl !== undefined) updateData.pdfUrl = body.pdfUrl;

    // Actualizar cotización
    await updateCotizacion(id, updateData);

    // Obtener cotización actualizada
    const cotizacionActualizada = await getCotizacionById(id);

    return NextResponse.json({
      success: true,
      message: "Cotización actualizada exitosamente",
      data: {
        id: cotizacionActualizada?.id,
        numero: cotizacionActualizada?.numero,
        items: cotizacionActualizada?.items,
        subtotal: cotizacionActualizada?.subtotal,
        iva: cotizacionActualizada?.iva,
        total: cotizacionActualizada?.total,
        estado: cotizacionActualizada?.estado,
        fecha: cotizacionActualizada?.fecha?.toDate?.()?.toISOString() || null,
        pdfUrl: cotizacionActualizada?.pdfUrl || null,
      },
    });
  } catch (error) {
    console.error("Error actualizando cotización:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar cotización",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quotes/[id]
 * Elimina una cotización
 * Requiere API key en header Authorization o X-API-Key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar API key
  const auth = await requireAPIKey(request);
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID no proporcionado",
          message: "Se requiere el ID de la cotización",
        },
        { status: 400 }
      );
    }

    // Verificar que la cotización existe
    const cotizacionExistente = await getCotizacionById(id);
    if (!cotizacionExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "No encontrada",
          message: `No se encontró la cotización con ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Eliminar cotización
    await deleteCotizacion(id);

    return NextResponse.json({
      success: true,
      message: "Cotización eliminada exitosamente",
      data: {
        id,
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error eliminando cotización:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar cotización",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
