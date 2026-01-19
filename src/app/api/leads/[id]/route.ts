import { NextRequest, NextResponse } from "next/server";
import { getLead, updateLead, deleteLead } from "@/lib/firestore-services";
import { requireAPIKey } from "@/lib/api-auth";

/**
 * GET /api/leads/[id]
 * Obtiene un lead específico por ID
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
    const lead = await getLead(params.id);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          error: "Lead no encontrado",
          message: `No se encontró el lead con ID: ${params.id}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Error obteniendo lead:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener lead",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/leads/[id]
 * Actualiza un lead existente
 * Requiere API key en header Authorization o X-API-Key
 * 
 * Body (todos los campos son opcionales):
 * {
 *   "empresa": "Empresa XYZ",
 *   "contacto": "Juan Pérez",
 *   "email": "juan@empresa.com",
 *   "telefono": "+57 300 123 4567",
 *   "estado": "contactado",
 *   "notas": "Llamar la próxima semana"
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
    const body = await request.json();

    // Verificar que el lead existe
    const existingLead = await getLead(params.id);
    if (!existingLead) {
      return NextResponse.json(
        {
          success: false,
          error: "Lead no encontrado",
          message: `No se encontró el lead con ID: ${params.id}`,
        },
        { status: 404 }
      );
    }

    // Validar email si se proporciona
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          {
            success: false,
            error: "Email inválido",
            message: "El formato del email no es válido",
          },
          { status: 400 }
        );
      }
    }

    // Validar estado si se proporciona
    if (body.estado) {
      const estadosValidos = ["nuevo", "contactado", "negociacion", "cerrado", "perdido"];
      if (!estadosValidos.includes(body.estado)) {
        return NextResponse.json(
          {
            success: false,
            error: "Estado inválido",
            message: `El estado debe ser uno de: ${estadosValidos.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar (solo campos proporcionados)
    const updateData: Record<string, any> = {};
    if (body.empresa !== undefined) updateData.empresa = body.empresa;
    if (body.contacto !== undefined) updateData.contacto = body.contacto;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.telefono !== undefined) updateData.telefono = body.telefono;
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.notas !== undefined) updateData.notas = body.notas;

    await updateLead(params.id, updateData);

    // Obtener el lead actualizado
    const updatedLead = await getLead(params.id);

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: "Lead actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error actualizando lead:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar lead",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 * Elimina un lead
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
    // Verificar que el lead existe
    const existingLead = await getLead(params.id);
    if (!existingLead) {
      return NextResponse.json(
        {
          success: false,
          error: "Lead no encontrado",
          message: `No se encontró el lead con ID: ${params.id}`,
        },
        { status: 404 }
      );
    }

    await deleteLead(params.id);

    return NextResponse.json({
      success: true,
      message: "Lead eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando lead:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar lead",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
