import { describe, it, expect } from 'vitest';
import { buildWhatsAppOrderUrl, buildBackInStockUrl, buildProductDoubtUrl } from './whatsappOrder';

const settings = { whatsappNumber: '+55 (81) 92001-9982' } as any;
const cart = [
  { id: 'a', productId: 'p1', name: 'Sunga Slim Cavada', price: 129.9, quantity: 2, selectedSize: 'M', selectedColor: 'Preta', image: '', maxStock: 5 },
  { id: 'b', productId: 'p2', name: 'Ecobag', price: 99.9, promotionalPrice: 79.9, quantity: 1, image: '', maxStock: 5 },
] as any;

describe('buildWhatsAppOrderUrl', () => {
  const url = buildWhatsAppOrderUrl(cart, settings, { orderNumber: 'SES-000001' });
  const text = decodeURIComponent(new URL(url).searchParams.get('text') || '');

  it('vai para o número da loja só com dígitos', () => {
    expect(url.startsWith('https://wa.me/5581920019982?text=')).toBe(true);
  });

  it('lista cada peça com tamanho, cor, quantidade e valor', () => {
    expect(text).toContain('Sunga Slim Cavada');
    expect(text).toContain('Tamanho: M');
    expect(text).toContain('Cor: Preta');
    expect(text).toContain('2 un. x R$ 129,90 = R$ 259,80');
    expect(text).toContain('1 un. x R$ 79,90 = R$ 79,90');
  });

  it('mostra o subtotal e avisa que o frete é combinado', () => {
    expect(text).toContain('Subtotal: R$ 339,70');
    expect(text).toContain('Frete: a combinar');
  });

  it('promoção zerada ou maior que o preço não muda o valor cobrado', () => {
    const odd = [
      { id: 'c', productId: 'p3', name: 'Boné', price: 59.9, promotionalPrice: 0, quantity: 1, image: '', maxStock: 5 },
      { id: 'd', productId: 'p4', name: 'Viseira', price: 49.9, promotionalPrice: 69.9, quantity: 1, image: '', maxStock: 5 },
    ] as any;
    const t = decodeURIComponent(new URL(buildWhatsAppOrderUrl(odd, settings, { orderNumber: 'X' })).searchParams.get('text') || '');
    expect(t).toContain('1 un. x R$ 59,90 = R$ 59,90');
    expect(t).toContain('1 un. x R$ 49,90 = R$ 49,90');
    expect(t).toContain('Subtotal: R$ 109,80');
  });

  it('carrinho vazio não gera link', () => {
    expect(buildWhatsAppOrderUrl([], settings)).toBe('');
  });
});

const txt = (u: string) => decodeURIComponent(new URL(u).searchParams.get('text') || '');

describe('uma peça só pelo WhatsApp', () => {
  it('leva tamanho, cor, modelo, quantidade e preço promocional', () => {
    const item = { id: 'x', productId: 'p1', name: 'Sunga Listrada', price: 120, promotionalPrice: 99, quantity: 3, selectedSize: 'M', selectedColor: 'Verde', selectedModel: 'Lisa', image: '', maxStock: 10 } as any;
    const t = txt(buildWhatsAppOrderUrl([item], settings, { orderNumber: 'X' }));
    expect(t).toContain('Tamanho: M | Cor: Verde | Modelo: Lisa');
    expect(t).toContain('3 un. x R$ 99,00 = R$ 297,00');
  });
});

describe('buildBackInStockUrl', () => {
  const p = { name: 'Sunga Listrada' } as any;
  it('com cor e tamanho', () => {
    const u = buildBackInStockUrl(p, settings, { size: 'M', color: 'Verde' });
    expect(u.startsWith('https://wa.me/5581920019982?text=')).toBe(true);
    expect(txt(u)).toBe('Olá! Quero ser avisado quando a Sunga Listrada (Verde, M) voltar ao estoque.');
  });
  it('só tamanho', () => {
    expect(txt(buildBackInStockUrl(p, settings, { size: 'M' }))).toBe('Olá! Quero ser avisado quando a Sunga Listrada (M) voltar ao estoque.');
  });
  it('só o nome', () => {
    expect(txt(buildBackInStockUrl(p, settings, {}))).toBe('Olá! Quero ser avisado quando a Sunga Listrada voltar ao estoque.');
  });
});

describe('buildProductDoubtUrl', () => {
  it('pergunta sobre a peça', () => {
    expect(txt(buildProductDoubtUrl({ name: 'Sunga Listrada' } as any, settings))).toBe('Olá! Tenho uma dúvida sobre a Sunga Listrada.');
  });
});
