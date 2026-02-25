import { NextResponse, NextRequest } from "next/server";
import { requireAPIKey } from "@/lib/api-auth";
import { herramientasService, HerramientaFormData } from "@/lib/tools-service";

type RouteParams = {
  params: {
    id: string;
  };
};

// GET /api/tools/[id] - Obtener una herramienta por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const herramienta = await herramientasService.getById(id);

    if (!herramienta) {
      return NextResponse.json({ success: false, error: "Herramienta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: herramienta });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/tools/[id] - Actualizar una herramienta
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAPIKey(request);
  if (!auth.valid) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();

    const existingTool = await herramientasService.getById(id);
    if (!existingTool) {
      return NextResponse.json({ success: false, error: "Herramienta no encontrada" }, { status: 404 });
    }

    const dataToUpdate: HerramientaFormData = {
      nombre: body.nombre ?? existingTool.nombre,
      categoria: body.categoria ?? existingTool.categoria,
      tipoCobranza: body.tipoCobranza ?? existingTool.tipoCobranza,
      costo: body.costo ?? existingTool.costo,
      divisa: body.divisa ?? existingTool.divisa,
      descripcion: body.descripcion ?? existingTool.descripcion,
      proveedor: body.proveedor ?? existingTool.proveedor,
      disponible: body.disponible ?? existingTool.disponible,
    };

    await herramientasService.update(id, dataToUpdate);
    const updatedTool = await herramientasService.getById(id);

    return NextResponse.json({ success: true, message: "Herramienta actualizada exitosamente", data: updatedTool });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/tools/[id] - Eliminar una herramienta
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAPIKey(request);
  if (!auth.valid) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const { id } = params;

    const existingTool = await herramientasService.getById(id);
    if (!existingTool) {
      return NextResponse.json({ success: false, error: "Herramienta no encontrada" }, { status: 404 });
    }

    await herramientasService.delete(id);
    return NextResponse.json({ success: true, message: "Herramienta eliminada exitosamente", data: { id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
