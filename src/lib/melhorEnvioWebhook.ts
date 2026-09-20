/**
 * @license
 * SILVA E SOL - Processador de Webhook Melhor Envio & Notificação Resend
 */

import { getSupabase } from './supabase';
import { loadLocalStoreState, saveLocalStoreState } from './storage';
import { sendTrackingNotificationEmail, SendEmailResult } from './resendEmail';
import { Order } from '../types/ecommerce';

export interface MelhorEnvioWebhookPayload {
  event?: string;
  action?: string;
  resource?: string;
  id?: string;
  order_id?: string;
  reference?: string;
  protocol?: string;
  tracking?: string;
  tracking_code?: string;
  code?: string;
  status?: string;
  service?: string;
  service_name?: string;
  tracking_url?: string;
  url?: string;
  to?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  recipient_email?: string;
  recipient_name?: string;
  customer_email?: string;
  customer_name?: string;
  data?: {
    id?: string;
    order_id?: string;
    reference?: string;
    protocol?: string;
    tracking?: string;
    tracking_code?: string;
    status?: string;
    service?: string;
    service_name?: string;
    agency_name?: string;
    tracking_url?: string;
    url?: string;
    tags?: Array<{ tag?: string; url?: string }>;
    to?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  [key: string]: any;
}

export interface WebhookProcessResult {
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
  trackingCode?: string;
  carrier?: string;
  trackingUrl?: string;
  customerEmail?: string;
  emailResult?: SendEmailResult;
  error?: string;
}

/**
 * Normaliza os dados recebidos do webhook do Melhor Envio
 */
export function extractMelhorEnvioData(payload: MelhorEnvioWebhookPayload) {
  const data = payload.data || {};

  // Extrair código de rastreio
  const trackingCode = 
    data.tracking || 
    data.tracking_code || 
    payload.tracking || 
    payload.tracking_code || 
    payload.code || 
    (data.tags && data.tags[0]?.tag) ||
    '';

  // Identificador do pedido
  const orderRef = 
    data.reference || 
    data.order_id || 
    payload.reference || 
    payload.order_id || 
    data.protocol || 
    payload.protocol || 
    payload.id || 
    data.id || 
    '';

  // Transportadora ou modalidade (ex: SEDEX, PAC, Jadlog)
  const carrier = 
    data.service_name || 
    payload.service_name || 
    data.service || 
    payload.service || 
    'Melhor Envio / Correios';

  // URL de Rastreamento
  const trackingUrl = 
    data.tracking_url || 
    data.url || 
    payload.tracking_url || 
    payload.url || 
    (data.tags && data.tags[0]?.url) ||
    (trackingCode ? `https://melhorrastreio.com.br/rastreio/${trackingCode}` : 'https://melhorrastreio.com.br');

  // Dados do destinatário
  const customerEmail = 
    data.to?.email || 
    payload.to?.email || 
    payload.recipient_email || 
    payload.customer_email || 
    '';

  const customerName = 
    data.to?.name || 
    payload.to?.name || 
    payload.recipient_name || 
    payload.customer_name || 
    '';

  const status = data.status || payload.status || 'posted';
  const event = payload.event || payload.action || 'order.tracking';

  return {
    trackingCode: String(trackingCode).trim().toUpperCase(),
    orderRef: String(orderRef).trim(),
    carrier: String(carrier).trim(),
    trackingUrl: String(trackingUrl).trim(),
    customerEmail: String(customerEmail).trim(),
    customerName: String(customerName).trim(),
    status,
    event
  };
}

/**
 * Processa o webhook do Melhor Envio, atualiza o pedido e dispara o e-mail via Resend
 */
export async function processMelhorEnvioWebhook(
  payload: MelhorEnvioWebhookPayload
): Promise<WebhookProcessResult> {
  console.info('[Melhor Envio Webhook] Payload recebido:', JSON.stringify(payload, null, 2));

  const extracted = extractMelhorEnvioData(payload);
  const { trackingCode, orderRef, carrier, trackingUrl } = extracted;

  if (!trackingCode && !orderRef) {
    return {
      success: false,
      message: 'Payload inválido: código de rastreio ou referência do pedido ausentes.',
      error: 'Missing tracking code or order reference in webhook payload'
    };
  }

  let matchedOrder: Order | null = null;

  // 1. Tentar localizar o pedido no Supabase
  const supabase = getSupabase();
  if (supabase && orderRef) {
    try {
      // Busca flexível: por id exato, número do pedido ou referência
      const cleanRef = orderRef.replace('#', '');
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${cleanRef},order_number.ilike.%${cleanRef}%`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        matchedOrder = {
          id: row.id,
          orderNumber: row.order_number || row.id.slice(-6).toUpperCase(),
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          customerPhone: row.customer_phone,
          customerAddress: row.customer_address,
          customerCity: row.customer_city,
          shippingCost: Number(row.shipping_cost) || 0,
          total: Number(row.total) || 0,
          status: row.status,
          items: Array.isArray(row.items) ? row.items : [],
          createdAt: row.created_at || new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('[Supabase Order Lookup]', err);
    }
  }

  // 2. Se não encontrou no Supabase ou Supabase offline, buscar no armazenamento local
  if (!matchedOrder && typeof window !== 'undefined') {
    try {
      const localState = loadLocalStoreState();
      const cleanRef = orderRef.replace('#', '').toLowerCase();
      
      const found = localState.orders.find(o => 
        o.id.toLowerCase() === cleanRef || 
        (o.orderNumber && o.orderNumber.toLowerCase().includes(cleanRef)) ||
        (cleanRef && o.id.toLowerCase().endsWith(cleanRef))
      );

      if (found) {
        matchedOrder = found;
      }
    } catch (err) {
      console.warn('[Local Order Lookup]', err);
    }
  }

  // Determinar e-mail e nome do cliente
  const finalEmail = extracted.customerEmail || matchedOrder?.customerEmail || '';
  const finalName = extracted.customerName || matchedOrder?.customerName || 'Cliente Silva e Sol';
  const finalOrderNumber = matchedOrder?.orderNumber || orderRef || (matchedOrder ? matchedOrder.id.slice(-6).toUpperCase() : 'SOL-NOVO');

  // 3. Atualizar o pedido para 'shipped' com o rastreio no Supabase
  if (supabase && (matchedOrder?.id || orderRef)) {
    try {
      const targetId = matchedOrder?.id || orderRef.replace('#', '');
      await supabase
        .from('orders')
        .update({
          status: 'shipped',
          tracking_code: trackingCode || null,
          tracking_carrier: carrier,
          tracking_url: trackingUrl,
          shipped_at: new Date().toISOString()
        })
        .eq('id', targetId);
      console.info(`[Supabase Order Updated] Pedido ${targetId} atualizado para status 'shipped' com rastreio ${trackingCode}`);
    } catch (err) {
      console.warn('[Supabase Order Update]', err);
    }
  }

  // Atualizar localmente se estivermos no cliente
  if (typeof window !== 'undefined') {
    try {
      const local = loadLocalStoreState();
      let updated = false;
      local.orders = local.orders.map(o => {
        if (o.id === matchedOrder?.id || o.orderNumber === finalOrderNumber || (orderRef && o.id.includes(orderRef))) {
          updated = true;
          return {
            ...o,
            status: 'shipped',
            trackingCode,
            trackingCarrier: carrier,
            trackingUrl,
            shippedAt: new Date().toISOString()
          };
        }
        return o;
      });
      if (updated) {
        saveLocalStoreState(local);
      }
    } catch (err) {
      console.warn('[Local Order Update]', err);
    }
  }

  // 4. Disparar e-mail automatizado via Resend com o código de rastreio
  let emailResult: SendEmailResult = {
    success: false,
    message: 'Nenhum e-mail de cliente associado ao pedido.'
  };

  if (finalEmail) {
    emailResult = await sendTrackingNotificationEmail({
      to: finalEmail,
      customerName: finalName,
      orderNumber: finalOrderNumber,
      trackingCode: trackingCode || 'DISPONÍVEL_EM_BREVE',
      carrierName: carrier,
      trackingUrl,
      deliveryAddress: matchedOrder?.shippingAddress || matchedOrder?.customerAddress,
      items: matchedOrder?.items,
      total: matchedOrder?.total
    });
  } else {
    console.warn(`[Melhor Envio Webhook] O pedido #${finalOrderNumber} não possui e-mail cadastrado para envio da notificação.`);
  }

  return {
    success: true,
    message: 'Webhook do Melhor Envio processado com sucesso e status atualizado.',
    orderId: matchedOrder?.id || orderRef,
    orderNumber: finalOrderNumber,
    trackingCode,
    carrier,
    trackingUrl,
    customerEmail: finalEmail || undefined,
    emailResult
  };
}
