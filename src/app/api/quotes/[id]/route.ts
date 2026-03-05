import { NextRequest, NextResponse } from 'next/server';
import { quotesService } from '@/lib/quotes-service';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

/**
 * GET /api/quotes/[id]
 * Obtiene una cotización por su ID.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const quote = await quotesService.getById(params.id);
    if (!quote) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: quote });
  } catch (error) {
    console.error('[QUOTES_GET_BY_ID_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/quotes/[id]
 * Actualiza una cotización existente.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const quote = await quotesService.getById(params.id);
    if (!quote) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    const json = await request.json();
    const dataToUpdate = quotesService.quoteUpdateSchema.parse(json);

    await quotesService.update(params.id, dataToUpdate);
    const updatedQuote = await quotesService.getById(params.id);

    return NextResponse.json({
      success: true,
      message: 'Cotización actualizada exitosamente',
      data: updatedQuote,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('[QUOTES_PUT_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/quotes/[id]
 * Elimina una cotización.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const quote = await quotesService.getById(params.id);
    if (!quote) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    await quotesService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Cotización eliminada exitosamente',
    });
  } catch (error) {
    console.error('[QUOTES_DELETE_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}