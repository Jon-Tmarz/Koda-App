import { NextRequest, NextResponse } from 'next/server';
import { leadsService } from '@/lib/leads-service';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

/**
 * GET /api/leads/[id]
 * Obtiene un lead por su ID.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const lead = await leadsService.getById(params.id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('[LEADS_GET_BY_ID_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/leads/[id]
 * Actualiza un lead existente.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const lead = await leadsService.getById(params.id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const json = await request.json();
    const dataToUpdate = leadsService.leadUpdateSchema.parse(json);

    await leadsService.update(params.id, dataToUpdate);
    const updatedLead = await leadsService.getById(params.id);

    return NextResponse.json({
      success: true,
      message: 'Lead actualizado exitosamente',
      data: updatedLead,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('[LEADS_PUT_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/leads/[id]
 * Elimina un lead.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const lead = await leadsService.getById(params.id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    await leadsService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Lead eliminado exitosamente',
    });
  } catch (error) {
    console.error('[LEADS_DELETE_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}