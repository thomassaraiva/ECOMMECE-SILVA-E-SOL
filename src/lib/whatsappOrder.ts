import { CartItem, StoreSettings } from '../types/ecommerce';
import { formatBRL as brl } from './format';
import { effectivePrice } from './pricing';

export function buildWhatsAppOrderUrl(
  cart: CartItem[],
  settings: StoreSettings,
  opts: { orderNumber?: string; customerName?: string; customerCity?: string; customerNotes?: string } = {}
): string {
  if (cart.length === 0) return '';
  const phone = settings.whatsappNumber.replace(/\D/g, '');
  const orderNumber = opts.orderNumber ?? `SES-${Date.now().toString().slice(-6)}`;

  const lines: string[] = [`Pedido Silva e Sol ${orderNumber}`, 'Olá! Quero fechar este pedido:', ''];
  if (opts.customerName) lines.push(`Nome: ${opts.customerName}`);
  if (opts.customerCity) lines.push(`Cidade: ${opts.customerCity}`);

  let subtotal = 0;
  cart.forEach((item, i) => {
    const unit = effectivePrice(item);
    const total = unit * item.quantity;
    subtotal += total;
    const details = [
      item.selectedSize && `Tamanho: ${item.selectedSize}`,
      item.selectedColor && `Cor: ${item.selectedColor}`,
      item.selectedModel && `Modelo: ${item.selectedModel}`,
    ].filter(Boolean).join(' | ');
    lines.push(`${i + 1}. ${item.name}`);
    if (details) lines.push(`   ${details}`);
    lines.push(`   ${item.quantity} un. x ${brl(unit)} = ${brl(total)}`);
  });

  lines.push('', `Subtotal: ${brl(subtotal)}`, 'Frete: a combinar');
  if (opts.customerNotes) lines.push('', `Observações: ${opts.customerNotes}`);

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function waUrl(settings: StoreSettings, text: string): string {
  return `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export function buildBackInStockUrl(
  product: { name: string },
  settings: StoreSettings,
  { size, color }: { size?: string; color?: string }
): string {
  const parts = [color, size].filter(Boolean).join(', ');
  return waUrl(settings, `Olá! Quero ser avisado quando a ${product.name}${parts ? ` (${parts})` : ''} voltar ao estoque.`);
}

export function buildProductDoubtUrl(product: { name: string }, settings: StoreSettings): string {
  return waUrl(settings, `Olá! Tenho uma dúvida sobre a ${product.name}.`);
}
