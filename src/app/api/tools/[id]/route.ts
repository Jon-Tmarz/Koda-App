import { NextRequest, NextResponse } from 'next/server';
import { herramientasService } from '@/lib/tools-service';
import { requireAPIKey } from '@/lib/api-auth';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

/**
 * GET /api/tools/[id]
 * Obtiene una herramienta por su ID.
 * No requiere autenticación.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const tool = await herramientasService.getById(params.id);
    if (!tool) {
      return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tool });
  } catch (error) {
    console.error('[TOOLS_GET_BY_ID_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/tools/[id]
 * Actualiza una herramienta existente.
 * Requiere autenticación por API Key.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const tool = await herramientasService.getById(params.id);
    if (!tool) {
      return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
    }

    const json = await request.json();
    const dataToUpdate = herramientasService.herramientaUpdateSchema.parse(json);

    await herramientasService.update(params.id, dataToUpdate);
    const updatedTool = await herramientasService.getById(params.id);

    return NextResponse.json({
      success: true,
      message: 'Herramienta actualizada exitosamente',
      data: updatedTool,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[TOOLS_PUT_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/tools/[id]
 * Elimina una herramienta.
 * Requiere autenticación por API Key.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const tool = await herramientasService.getById(params.id);
    if (!tool) {
      return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
    }

    await herramientasService.delete(params.id);

    return NextResponse.json({ success: true, message: 'Herramienta eliminada exitosamente' });
  } catch (error) {
    console.error('[TOOLS_DELETE_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}