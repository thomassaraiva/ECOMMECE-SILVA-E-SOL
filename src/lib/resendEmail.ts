/**
 * @license
 * SILVA E SOL - Serviço de E-mails Transacionais via Resend
 * Envio automatizado de notificações de envio e código de rastreio (Melhor Envio)
 */

import { Resend } from 'resend';
import { OrderItem, CustomerAddress } from '../types/ecommerce';

let resendInstance: Resend | null = null;

export function getResendApiKey(): string {
  if (typeof process !== 'undefined' && process.env?.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_RESEND_API_KEY) {
    return (import.meta as any).env.VITE_RESEND_API_KEY;
  }
  return '';
}

export function getResendFromEmail(): string {
  if (typeof process !== 'undefined' && process.env?.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_RESEND_FROM_EMAIL) {
    return (import.meta as any).env.VITE_RESEND_FROM_EMAIL;
  }
  return 'Silva e Sol <onboarding@resend.dev>';
}

export function getResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey || apiKey.includes('placeholder') || apiKey.length < 10) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface SendTrackingEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingCode: string;
  carrierName?: string;
  trackingUrl?: string;
  deliveryAddress?: CustomerAddress | string;
  items?: OrderItem[];
  subtotal?: number;
  shippingCost?: number;
  total?: number;
}

export interface SendEmailResult {
  success: boolean;
  emailId?: string;
  simulated?: boolean;
  message?: string;
  error?: string;
}

/**
 * Gera o template HTML responsivo e sofisticado da Silva e Sol
 */
export function buildTrackingEmailHtml(params: SendTrackingEmailParams): string {
  const {
    customerName,
    orderNumber,
    trackingCode,
    carrierName = 'Melhor Envio / Correios',
    trackingUrl = `https://melhorrastreio.com.br/rastreio/${trackingCode}`,
    deliveryAddress,
    items = []
  } = params;

  const firstName = customerName ? customerName.split(' ')[0] : 'Cliente';
  
  let formattedAddress = '';
  if (typeof deliveryAddress === 'string') {
    formattedAddress = deliveryAddress;
  } else if (deliveryAddress) {
    const cep = (deliveryAddress as any).cep || (deliveryAddress as any).zipCode || '';
    formattedAddress = `${deliveryAddress.street}, nº ${deliveryAddress.number}${deliveryAddress.complement ? ` (${deliveryAddress.complement})` : ''} - ${deliveryAddress.neighborhood}, ${deliveryAddress.city} - ${deliveryAddress.state}${cep ? `, CEP ${cep}` : ''}`;
  }

  const itemsHtml = items.length > 0 ? items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #EAE4DC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #2D2823;">
        <strong>${item.productName}</strong>
        ${item.size || item.color ? `<br><span style="font-size: 12px; color: #7A7269;">${[item.size ? `Tam: ${item.size}` : '', item.color ? `Cor: ${item.color}` : ''].filter(Boolean).join(' • ')}</span>` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #EAE4DC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #7A7269; text-align: center;">
        ${item.quantity}x
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #EAE4DC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #2D2823; text-align: right;">
        R$ ${(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
      </td>
    </tr>
  `).join('') : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu Pedido Silva e Sol foi Enviado!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EFEB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5EFEB; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(45,40,35,0.06); border: 1px solid #EAE4DC;">
          
          <!-- Cabeçalho da Marca -->
          <tr>
            <td style="background-color: #2D2823; padding: 36px 32px; text-align: center;">
              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #FAF7F2; text-transform: uppercase; display: block;">
                SILVA & SOL
              </span>
              <span style="font-size: 11px; letter-spacing: 2px; color: #C49A45; text-transform: uppercase; font-weight: 600; margin-top: 6px; display: block;">
                Moda Praia & Balneário Chic
              </span>
            </td>
          </tr>

          <!-- Banner de Status -->
          <tr>
            <td style="background-color: #2A8882; padding: 14px 24px; text-align: center;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #FFFFFF; letter-spacing: 0.5px;">
                📦 ETIQUETA GERADA • SEU PEDIDO ESTÁ A CAMINHO!
              </p>
            </td>
          </tr>

          <!-- Conteúdo do E-mail -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #2D2823; line-height: 1.3;">
                Olá, ${firstName}! ✨
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #524B43; line-height: 1.6;">
                Temos uma ótima notícia! A etiqueta de envio do seu pedido <strong>#${orderNumber}</strong> foi gerada com sucesso através do <strong>${carrierName}</strong> e suas peças já foram preparadas com todo carinho.
              </p>

              <!-- Card Destaque: Código de Rastreio -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F2; border: 1px solid #E5DDD2; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; color: #7A7269; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">
                      Código de Rastreamento Oficial
                    </span>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 800; color: #2A8882; letter-spacing: 2px; padding: 10px 16px; background-color: #FFFFFF; border: 1px dashed #2A8882; border-radius: 8px; display: inline-block; margin-bottom: 12px;">
                      ${trackingCode}
                    </div>
                    <p style="margin: 0 0 18px 0; font-size: 12px; color: #7A7269;">
                      Transportadora: <strong style="color: #2D2823;">${carrierName}</strong>
                    </p>

                    <!-- Botão CTA Principal -->
                    <div>
                      <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2A8882; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(42,136,130,0.25);">
                        ACOMPANHAR RASTREAMENTO &rarr;
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Endereço de Entrega -->
              ${formattedAddress ? `
              <div style="margin-bottom: 28px; padding: 18px; background-color: #FAF7F2; border-radius: 10px; border-left: 4px solid #C49A45;">
                <span style="font-size: 12px; font-weight: 700; color: #2D2823; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                  📍 Endereço de Destino:
                </span>
                <p style="margin: 0; font-size: 13px; color: #524B43; line-height: 1.5;">
                  ${formattedAddress}
                </p>
              </div>
              ` : ''}

              <!-- Resumo das Peças -->
              ${itemsHtml ? `
              <div style="margin-bottom: 28px;">
                <span style="font-size: 12px; font-weight: 700; color: #2D2823; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 12px; border-bottom: 2px solid #EAE4DC; padding-bottom: 6px;">
                  Resumo das Peças do Pedido:
                </span>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  ${itemsHtml}
                </table>
              </div>
              ` : ''}

              <!-- Dica de Rastreio -->
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #7A7269; line-height: 1.5; background-color: #FFF9ED; padding: 12px 16px; border-radius: 8px; border: 1px solid #FFE7B3;">
                💡 <strong>Dica:</strong> O código de rastreamento pode levar até 24 horas úteis após a postagem para registrar a primeira movimentação no sistema da transportadora.
              </p>

              <!-- Suporte e Contato -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #EAE4DC; padding-top: 24px; text-align: center;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #524B43;">
                      Dúvidas com a entrega ou precisa de ajuda com o tamanho?
                    </p>
                    <a href="https://wa.me/5581920019982?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20rastreio%20do%20pedido%20${orderNumber}" target="_blank" rel="noopener noreferrer" style="display: inline-block; color: #2A8882; font-weight: 700; font-size: 13px; text-decoration: none; border: 1px solid #2A8882; padding: 8px 18px; border-radius: 6px;">
                      Falar no WhatsApp (81) 92001-9982
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #FAF7F2; padding: 24px 32px; text-align: center; border-top: 1px solid #EAE4DC;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #2D2823;">
                SILVA E SOL MODA PRAIA
              </p>
              <p style="margin: 0; font-size: 11px; color: #7A7269; line-height: 1.5;">
                Recife - PE • Enviando estilo e liberdade para todo o Brasil.<br>
                Este é um e-mail transacional referente ao seu pedido.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envia o e-mail de notificação de rastreio via Resend
 */
export async function sendTrackingNotificationEmail(params: SendTrackingEmailParams): Promise<SendEmailResult> {
  const { to, customerName, orderNumber, trackingCode } = params;

  if (!to || !to.includes('@')) {
    return {
      success: false,
      error: `E-mail do cliente inválido ou não informado: "${to}"`
    };
  }

  const resend = getResendClient();
  const htmlContent = buildTrackingEmailHtml(params);
  const fromEmail = getResendFromEmail();
  const subject = `Seu pedido #${orderNumber} foi enviado! Código de Rastreio: ${trackingCode}`;

  // Se não houver chave real configurada, simula o envio com log e retorno estruturado
  if (!resend) {
    console.info(`[Resend Simulação] E-mail de rastreio gerado para ${to} (Pedido #${orderNumber}, Rastreio: ${trackingCode}). Para envio real, defina RESEND_API_KEY no ambiente.`);
    return {
      success: true,
      simulated: true,
      emailId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      message: `Simulação de envio bem-sucedida para ${to}. Configure RESEND_API_KEY no .env para disparos reais.`
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html: htmlContent
    });

    if (error) {
      console.error('[Resend Erro]', error);
      return {
        success: false,
        error: error.message || 'Falha ao enviar e-mail através do Resend'
      };
    }

    console.info(`[Resend Sucesso] E-mail enviado com ID ${data?.id} para ${to}`);
    return {
      success: true,
      emailId: data?.id,
      simulated: false,
      message: `E-mail de rastreio enviado com sucesso para ${to} (ID: ${data?.id}).`
    };
  } catch (err: any) {
    console.error('[Resend Exceção]', err);
    return {
      success: false,
      error: err.message || 'Erro inesperado ao conectar com a API do Resend'
    };
  }
}
