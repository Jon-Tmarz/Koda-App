import { NextRequest, NextResponse } from 'next/server';
import { herramientasService } from '@/lib/tools-service';
import { requireAPIKey } from '@/lib/api-auth';
import { z } from 'zod';

/**
 * GET /api/tools
 * Obtiene una lista de herramientas, con filtros opcionales.
 * No requiere autenticación.
 *
 * Query Params (opcionales):
 * - disponible=true|false
 * - categoria=Software|infraestructura|...
 * - nombre=... (búsqueda exacta)
 * - proveedor=... (búsqueda exacta)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });

    const tools = await herramientasService.getAll(filters);
    return NextResponse.json({ success: true, data: tools, count: tools.length });
  } catch (error) {
    console.error('[TOOLS_GET_ALL_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/tools
 * Crea una nueva herramienta.
 * Requiere autenticación por API Key.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar API Key
    const auth = await requireAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    // 2. Validar Body
    const json = await request.json();
    const data = herramientasService.herramientaCreateSchema.parse(json);

    // 3. Crear en la base de datos
    const toolId = await herramientasService.create(data);
    const newTool = await herramientasService.getById(toolId);

    return NextResponse.json({
      success: true,
      message: 'Herramienta creada exitosamente',
      data: newTool,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[TOOLS_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}