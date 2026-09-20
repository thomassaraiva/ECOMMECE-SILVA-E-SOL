/**
 * Next.js Pages Router Webhook Handler
 * Rota: POST /api/webhooks/melhor-envio
 */

import { processMelhorEnvioWebhook, MelhorEnvioWebhookPayload } from '@/src/lib/melhorEnvioWebhook';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({
      service: 'Silva e Sol - Webhook Melhor Envio & Resend (Pages Router)',
      status: 'active'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  try {
    const expectedSecret = process.env.MELHOR_ENVIO_WEBHOOK_SECRET;
    if (expectedSecret) {
      const auth = req.headers['x-melhor-envio-token'] || req.headers['authorization'] || req.headers['x-webhook-secret'];
      if (auth && auth !== expectedSecret && !auth.includes(expectedSecret)) {
        return res.status(401).json({ error: 'Não autorizado: token inválido' });
      }
    }

    const payload: MelhorEnvioWebhookPayload = req.body;
    const result = await processMelhorEnvioWebhook(payload);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('[Pages Router Webhook Error]', error);
    return res.status(500).json({ error: error.message || 'Erro ao processar webhook' });
  }
}
