import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { processMelhorEnvioWebhook } from './src/lib/melhorEnvioWebhook';
import { sendTrackingNotificationEmail, getResendApiKey } from './src/lib/resendEmail';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware de JSON para webhooks e requisições de API
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      resendConfigured: Boolean(getResendApiKey())
    });
  });

  // GET informativo da rota de webhook do Melhor Envio
  app.get(['/api/webhooks/melhor-envio', '/api/webhook/melhor-envio'], (_req, res) => {
    res.json({
      service: 'Silva e Sol - Webhook do Melhor Envio & Resend',
      status: 'online',
      endpoint: '/api/webhooks/melhor-envio',
      method: 'POST',
      resendConfigured: Boolean(getResendApiKey()),
      instructions: 'Configure esta URL no painel do Melhor Envio > Configurações > Webhooks.',
      samplePayload: {
        event: 'order.tracking',
        data: {
          id: 'me_pedido_123',
          protocol: 'ORD-7890',
          reference: 'SOL-123456',
          tracking: 'ME987654321BR',
          status: 'posted',
          service_name: 'Correios SEDEX',
          to: {
            name: 'Cliente Silva e Sol',
            email: 'cliente@exemplo.com'
          }
        }
      }
    });
  });

  // Rota de Webhook do Melhor Envio (suporte com e sem 's')
  app.post(['/api/webhooks/melhor-envio', '/api/webhook/melhor-envio'], async (req, res) => {
    try {
      // Validação opcional de Secret/Token
      const expectedSecret = process.env.MELHOR_ENVIO_WEBHOOK_SECRET;
      if (expectedSecret) {
        const token = req.headers['x-melhor-envio-token'] || 
                      req.headers['authorization'] || 
                      req.headers['x-webhook-secret'];
        if (token && token !== expectedSecret && !String(token).includes(expectedSecret)) {
          return res.status(401).json({ success: false, error: 'Token do webhook inválido.' });
        }
      }

      const result = await processMelhorEnvioWebhook(req.body);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error('[Webhook Express Erro]:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro interno ao processar webhook do Melhor Envio.'
      });
    }
  });

  // Rota auxiliar para testes manuais de envio via Resend
  app.post('/api/tracking/test-resend', async (req, res) => {
    try {
      const { to, customerName, orderNumber, trackingCode, carrierName } = req.body;
      const result = await sendTrackingNotificationEmail({
        to: to || 'cliente@exemplo.com',
        customerName: customerName || 'Cliente Exemplo',
        orderNumber: orderNumber || 'SOL-TESTE',
        trackingCode: trackingCode || 'ME123456789BR',
        carrierName: carrierName || 'Correios SEDEX'
      });
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
