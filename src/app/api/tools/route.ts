import { NextResponse, NextRequest } from "next/server";
import { requireAPIKey } from "@/lib/api-auth";
import { herramientasService, type HerramientaFormData } from "@/lib/tools-service";

// GET /api/tools - Obtener herramientas con filtros opcionales
// Parámetros: ?disponibles=true | ?id=X | ?proveedor=X | ?categoria=X | ?nombre=X
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disponiblesOnly = searchParams.get("disponibles") === "true";
    const id = searchParams.get("id");
    const proveedor = searchParams.get("proveedor");
    const categoria = searchParams.get("categoria");
    const nombre = searchParams.get("nombre");

    let herramientas = disponiblesOnly
      ? await herramientasService.getDisponibles()
      : await herramientasService.getAll();

    // Aplicar filtros adicionales
    if (id) {
      herramientas = herramientas.filter(h => h.id === id);
    }
    if (proveedor) {
      herramientas = herramientas.filter(h =>
        h.proveedor?.toLowerCase().includes(proveedor.toLowerCase())
      );
    }
    if (categoria) {
      herramientas = herramientas.filter(h =>
        h.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }
    if (nombre) {
      herramientas = herramientas.filter(h =>
        h.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
    }

    return NextResponse.json({ success: true, data: herramientas });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/tools - Crear una nueva herramienta
export async function POST(request: NextRequest) {
  const auth = await requireAPIKey(request);
  if (!auth.valid) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validación básica
    if (!body.nombre || !body.categoria || !body.tipoCobranza) {
      return NextResponse.json(
        { success: false, error: "nombre, categoria y tipoCobranza son requeridos" },
        { status: 400 }
      );
    }

    const herramientaData: HerramientaFormData = {
      nombre: body.nombre,
      categoria: body.categoria,
      tipoCobranza: body.tipoCobranza,
      costo: body.costo ?? 0,
      divisa: body.divisa ?? "USD",
      descripcion: body.descripcion,
      proveedor: body.proveedor,
      disponible: body.disponible ?? true,
    };

    await herramientasService.create(herramientaData);

    return NextResponse.json(
      { success: true, message: "Herramienta creada exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}