import { NextRequest, NextResponse } from "next/server";
import { getLeads, createLead } from "@/lib/firestore-services";
import { requireAPIKey } from "@/lib/api-auth";

/**
 * GET /api/leads
 * Obtiene todos los leads
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
    const leads = await getLeads();
    
    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length,
    });
  } catch (error) {
    console.error("Error obteniendo leads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener leads",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Crea un nuevo lead
 * Requiere API key en header Authorization o X-API-Key
 * 
 * Body:
 * {
 *   "empresa": "Empresa XYZ",
 *   "contacto": "Juan Pérez",
 *   "email": "juan@empresa.com",
 *   "telefono": "+57 300 123 4567",
 *   "estado": "nuevo",
 *   "notas": "Lead desde formulario web"
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
    
    // Validar campos requeridos
    if (!body.empresa || !body.contacto || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos incompletos",
          message: "Los campos empresa, contacto y email son requeridos",
        },
        { status: 400 }
      );
    }

    // Validar formato de email
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

    // Validar estado
    const estadosValidos = ["nuevo", "contactado", "negociacion", "cerrado", "perdido"];
    if (body.estado && !estadosValidos.includes(body.estado)) {
      return NextResponse.json(
        {
          success: false,
          error: "Estado inválido",
          message: `El estado debe ser uno de: ${estadosValidos.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const leadData = {
      empresa: body.empresa,
      contacto: body.contacto,
      email: body.email,
      telefono: body.telefono || "",
      estado: body.estado || "nuevo",
      notas: body.notas || "",
    };

    const leadId = await createLead(leadData);

    return NextResponse.json(
      {
        success: true,
        data: { id: leadId, ...leadData },
        message: "Lead creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando lead:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear lead",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
