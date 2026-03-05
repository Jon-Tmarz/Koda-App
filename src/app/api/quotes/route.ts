import { NextRequest, NextResponse } from 'next/server';
import { quotesService } from '@/lib/quotes-service';
import { z } from 'zod';

/**
 * GET /api/quotes
 * Obtiene todas las cotizaciones.
 */
export async function GET() {
  try {
    const quotes = await quotesService.getAll();
    return NextResponse.json({ success: true, data: quotes, count: quotes.length });
  } catch (error) {
    console.error('[QUOTES_GET_ALL_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/quotes
 * Crea una nueva cotización.
 */
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = quotesService.quoteCreateSchema.parse(json);

    const quoteId = await quotesService.create(data);
    const newQuote = await quotesService.getById(quoteId);

    return NextResponse.json({
      success: true,
      message: 'Cotización creada exitosamente',
      data: newQuote,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('[QUOTES_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}