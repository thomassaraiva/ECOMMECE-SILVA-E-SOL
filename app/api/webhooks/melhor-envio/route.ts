/**
 * Next.js App Router Webhook Handler
 * Rota: POST /api/webhooks/melhor-envio
 *
 * Recebe atualizações de rastreamento e geração de etiquetas do Melhor Envio
 * e despacha o e-mail automatizado para o cliente através do Resend.
 */

import { processMelhorEnvioWebhook, MelhorEnvioWebhookPayload } from '@/src/lib/melhorEnvioWebhook';

export async function POST(request: Request) {
  try {
    // 1. Verificação opcional de segurança com Token/Secret do webhook
    const expectedSecret = process.env.MELHOR_ENVIO_WEBHOOK_SECRET;
    if (expectedSecret) {
      const authHeader = request.headers.get('x-melhor-envio-token') || 
                         request.headers.get('authorization') || 
                         request.headers.get('x-webhook-secret');
      
      if (authHeader && authHeader !== expectedSecret && !authHeader.includes(expectedSecret)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Não autorizado: token do webhook inválido.' 
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Parse do corpo da requisição
    const body: MelhorEnvioWebhookPayload = await request.json();

    if (!body) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload vazio ou JSON inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Processar evento, atualizar status no Supabase e enviar e-mail via Resend
    const result = await processMelhorEnvioWebhook(body);

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        trackingCode: result.trackingCode,
        carrier: result.carrier,
        emailResult: result.emailResult
      }),
      {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('[Next.js Webhook Melhor Envio Erro]:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno ao processar webhook do Melhor Envio.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Suporte a requisições GET para verificação de status e saúde do webhook
export async function GET() {
  return new Response(
    JSON.stringify({
      service: 'Silva e Sol - Webhook Melhor Envio & Resend',
      status: 'active',
      method: 'POST',
      description: 'Envie o webhook do Melhor Envio para esta rota via POST para atualizar o rastreio e notificar o cliente via Resend.'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
