/**
 * Next.js App Router - Endpoint de Pagamento Stone / Pagar.me
 * Rota: POST /api/checkout/stone
 *
 * Processa cobranças de PIX e Cartão de Crédito com chave privada no servidor.
 * Ativa automaticamente o modo Sandbox/Simulação quando STONE_API_KEY não estiver definida.
 */

import { generateStonePix, processStoneCreditCard, isStoneConfigured, StoneCreditCardInput } from '@/src/lib/stonePayment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, amount, orderNumber, cardData } = body;

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valor do pedido inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const orderRef = orderNumber || `SOL-${Date.now().toString().slice(-6)}`;

    // Ação: Gerar PIX
    if (action === 'pix') {
      const pix = generateStonePix(amount, orderRef);
      return new Response(
        JSON.stringify({
          success: true,
          mode: isStoneConfigured() ? 'production' : 'simulation',
          data: pix
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ação: Processar Cartão de Crédito
    if (action === 'credit_card') {
      if (!cardData) {
        return new Response(
          JSON.stringify({ success: false, error: 'Dados do cartão não fornecidos.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const result = await processStoneCreditCard(amount, cardData as StoneCreditCardInput, orderRef);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Ação de pagamento não reconhecida (use "pix" ou "credit_card").' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[API Stone Error]:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro interno no gateway Stone.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      gateway: 'Stone / Pagar.me Gateway Service - Silva e Sol',
      status: 'active',
      isConfigured: isStoneConfigured(),
      mode: isStoneConfigured() ? 'production' : 'sandbox_simulation'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
