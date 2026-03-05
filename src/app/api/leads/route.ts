import { NextRequest, NextResponse } from 'next/server';
import { leadsService } from '@/lib/leads-service';
import { z } from 'zod';

/**
 * GET /api/leads
 * Obtiene todos los leads.
 */
export async function GET() {
  try {
    const leads = await leadsService.getAll();
    return NextResponse.json({ success: true, data: leads, count: leads.length });
  } catch (error) {
    console.error('[LEADS_GET_ALL_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/leads
 * Crea un nuevo lead.
 */
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = leadsService.leadCreateSchema.parse(json);

    const leadId = await leadsService.create(data);
    const newLead = await leadsService.getById(leadId);

    return NextResponse.json({
      success: true,
      message: 'Lead creado exitosamente',
      data: newLead,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('[LEADS_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}