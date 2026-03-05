import { NextRequest, NextResponse } from 'next/server';
import { quotesService } from '@/lib/quotes-service';
import { leadsService } from '@/lib/leads-service';
import { configService } from '@/lib/config-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;

  if (!quoteId) {
    return NextResponse.json({ success: false, error: 'Quote ID is required' }, { status: 400 });
  }

  try {
    const quote = await quotesService.getById(quoteId);
    if (!quote) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    const lead = await leadsService.getById(quote.clienteId);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Client not found for this quote' }, { status: 404 });
    }

    // 1. Obtener configuración global para la URL del webhook de N8N
    const config = await configService.getGlobalConfig();
    const n8nWebhookUrl = config?.n8nWebhookUrl;

    if (!n8nWebhookUrl) {
      console.error("N8N Webhook URL no está configurada en Setup.");
      return NextResponse.json({ success: false, error: 'N8N Webhook URL is not configured.' }, { status: 500 });
    }

    // 2. Enviar los datos de la cotización y el cliente al webhook de N8N
    await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote,
        lead,
        config, // Enviamos también la config por si N8N necesita datos de la empresa
      }),
    });

    // 3. Actualizar el estado de la cotización a "enviada"
    await quotesService.update(quoteId, {
      estado: "enviada",
    });

    return NextResponse.json({ success: true, message: 'Data sent to webhook successfully' });
  } catch (error) {
    console.error('[SEND_TO_N8N_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
