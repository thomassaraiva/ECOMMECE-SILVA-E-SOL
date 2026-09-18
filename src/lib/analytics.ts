/**
 * @license
 * SILVA E SOL - Módulo Central de Rastreamento de Tráfego Pago e Conversões
 * Integração com:
 *  - Meta Pixel (Facebook & Instagram)
 *  - TikTok Pixel
 *  - Google Analytics 4 (GA4) / Google Tag
 */

import { Product, CartItem } from '../types/ecommerce';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    ttq?: any;
  }
}

export interface AnalyticsConfig {
  metaPixelId?: string;
  googleAnalyticsId?: string;
  tiktokPixelId?: string;
  enableTracking?: boolean;
}

let currentConfig: AnalyticsConfig = {};
let isInitialized = false;

/**
 * Inicializa os scripts de rastreamento no <head> de forma dinâmica
 */
export function initializeAnalytics(config: AnalyticsConfig): void {
  currentConfig = { ...config };

  if (typeof window === 'undefined') return;

  const { metaPixelId, googleAnalyticsId, tiktokPixelId, enableTracking = true } = config;

  if (!enableTracking) {
    console.info('📊 [Silva e Sol Analytics] Rastreamento desativado nas configurações.');
    return;
  }

  // 1. Meta Pixel (Facebook & Instagram)
  if (metaPixelId && metaPixelId.trim().length >= 8) {
    injectMetaPixel(metaPixelId.trim());
  }

  // 2. Google Analytics 4 (GA4)
  if (googleAnalyticsId && googleAnalyticsId.trim().startsWith('G-')) {
    injectGoogleAnalytics(googleAnalyticsId.trim());
  }

  // 3. TikTok Pixel
  if (tiktokPixelId && tiktokPixelId.trim().length >= 8) {
    injectTikTokPixel(tiktokPixelId.trim());
  }

  isInitialized = true;
  console.info('🚀 [Silva e Sol Analytics] Pixels inicializados com sucesso:', {
    meta: Boolean(metaPixelId),
    ga4: Boolean(googleAnalyticsId),
    tiktok: Boolean(tiktokPixelId)
  });
}

// -------------------------------------------------------------
// Injeção de Scripts no <head>
// -------------------------------------------------------------

function injectMetaPixel(pixelId: string): void {
  if (document.getElementById('meta-pixel-script')) return;

  // Injeção do SDK padrão da Meta
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.id = 'meta-pixel-script';
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  if (window.fbq) {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
}

function injectGoogleAnalytics(measurementId: string): void {
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer?.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: true
  });
}

function injectTikTokPixel(pixelId: string): void {
  if (document.getElementById('tiktok-pixel-script')) return;

  (function (w: any, d: any, t: any) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie'
    ];
    ttq.setAndDefer = function (t: any, e: any) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.instance = function (t: any) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) {
        ttq.setAndDefer(e, ttq.methods[n]);
      }
      return e;
    };
    ttq.load = function (e: any, n: any) {
      var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var o = d.createElement('script');
      o.type = 'text/javascript';
      o.async = !0;
      o.id = 'tiktok-pixel-script';
      o.src = i + '?type=desktop&lib=' + t;
      var a = d.getElementsByTagName('script')[0];
      a.parentNode.insertBefore(o, a);
    };
    ttq.load(pixelId);
    ttq.page();
  })(window, document, 'ttq');
}

// -------------------------------------------------------------
// Eventos Padrão de E-commerce para Tráfego Pago
// -------------------------------------------------------------

/**
 * Visualização de Página (PageView)
 */
export function trackPageView(pageName: string, path = window.location.pathname): void {
  try {
    // Log informativo para validação em desenvolvimento
    console.debug(`[Analytics] PageView: ${pageName} (${path})`);

    // Meta
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    // GA4
    if (window.gtag && currentConfig.googleAnalyticsId) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: path
      });
    }

    // TikTok
    if (window.ttq) {
      window.ttq.page();
    }
  } catch (err) {
    console.warn('[Analytics] Erro ao registrar PageView:', err);
  }
}

/**
 * Visualização de Produto (ViewContent)
 */
export function trackViewContent(product: Product): void {
  try {
    const value = product.promotionalPrice || product.price;
    console.debug(`[Analytics] ViewContent: ${product.name} (R$ ${value.toFixed(2)})`);

    // Meta Pixel: ViewContent
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_category: product.categoryId,
        content_ids: [product.id],
        content_type: 'product',
        value: value,
        currency: 'BRL'
      });
    }

    // GA4: view_item
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'BRL',
        value: value,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.categoryId,
            price: value
          }
        ]
      });
    }

    // TikTok: ViewContent
    if (window.ttq) {
      window.ttq.track('ViewContent', {
        content_id: product.id,
        content_type: 'product',
        content_name: product.name,
        price: value,
        currency: 'BRL'
      });
    }
  } catch (err) {
    console.warn('[Analytics] Erro ao registrar ViewContent:', err);
  }
}

/**
 * Adição ao Carrinho (AddToCart)
 */
export function trackAddToCart(product: Product, quantity = 1, size?: string, color?: string): void {
  try {
    const value = (product.promotionalPrice || product.price) * quantity;
    console.debug(`[Analytics] AddToCart: ${product.name} x${quantity} (Total: R$ ${value.toFixed(2)})`);

    // Meta Pixel: AddToCart
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_category: product.categoryId,
        content_ids: [product.id],
        content_type: 'product',
        value: value,
        currency: 'BRL',
        contents: [
          {
            id: product.id,
            quantity: quantity,
            item_price: product.promotionalPrice || product.price
          }
        ]
      });
    }

    // GA4: add_to_cart
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: value,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.categoryId,
            item_variant: [size, color].filter(Boolean).join(' - '),
            price: product.promotionalPrice || product.price,
            quantity: quantity
          }
        ]
      });
    }

    // TikTok: AddToCart
    if (window.ttq) {
      window.ttq.track('AddToCart', {
        content_id: product.id,
        content_type: 'product',
        content_name: product.name,
        quantity: quantity,
        price: product.promotionalPrice || product.price,
        value: value,
        currency: 'BRL'
      });
    }
  } catch (err) {
    console.warn('[Analytics] Erro ao registrar AddToCart:', err);
  }
}

/**
 * Iniciar Checkout / Finalização de Compra (InitiateCheckout)
 */
export function trackInitiateCheckout(items: CartItem[], total: number): void {
  try {
    console.debug(`[Analytics] InitiateCheckout: ${items.length} itens (R$ ${total.toFixed(2)})`);

    const contentIds = items.map(item => item.productId);

    // Meta Pixel: InitiateCheckout
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: contentIds,
        content_type: 'product',
        num_items: items.reduce((acc, curr) => acc + curr.quantity, 0),
        value: total,
        currency: 'BRL'
      });
    }

    // GA4: begin_checkout
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value: total,
        items: items.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.promotionalPrice || item.price,
          quantity: item.quantity
        }))
      });
    }

    // TikTok: InitiateCheckout
    if (window.ttq) {
      window.ttq.track('InitiateCheckout', {
        contents: items.map(item => ({
          content_id: item.productId,
          content_name: item.name,
          quantity: item.quantity,
          price: item.promotionalPrice || item.price
        })),
        value: total,
        currency: 'BRL'
      });
    }
  } catch (err) {
    console.warn('[Analytics] Erro ao registrar InitiateCheckout:', err);
  }
}

/**
 * Busca no Catálogo (Search)
 */
export function trackSearch(query: string): void {
  if (!query || query.trim().length < 2) return;
  try {
    console.debug(`[Analytics] Search: "${query}"`);

    // Meta: Search
    if (window.fbq) {
      window.fbq('track', 'Search', { search_string: query.trim() });
    }

    // GA4: search
    if (window.gtag) {
      window.gtag('event', 'search', { search_term: query.trim() });
    }

    // TikTok: Search
    if (window.ttq) {
      window.ttq.track('Search', { query: query.trim() });
    }
  } catch (err) {
    console.warn('[Analytics] Erro ao registrar Search:', err);
  }
}

/**
 * Adição à Lista de Desejos (AddToWishlist)
 */
export function trackAddToWishlist(product: Product): void {
  try {
    console.debug(`[Analytics] AddToWishlist: ${product.name}`);

    if (window.fbq) {
      window.fbq('track', 'AddToWishlist', {
        content_name: product.name,
        content_ids: [product.id],
        value: product.promotionalPrice || product.price,
        currency: 'BRL'
      });
    }

    if (window.gtag) {
      window.gtag('event', 'add_to_wishlist', {
        currency: 'BRL',
        value: product.promotionalPrice || product.price,
        items: [{ item_id: product.id, item_name: product.name, price: product.promotionalPrice || product.price }]
      });
    }

    if (window.ttq) {
      window.ttq.track('AddWishlist', {
        content_id: product.id,
        content_name: product.name,
        price: product.promotionalPrice || product.price,
        currency: 'BRL'
      });
    }
  } catch (err) {
    console.warn('[Analytics] Erro ao registrar AddToWishlist:', err);
  }
}

/**
 * Clique de Contato no WhatsApp (Lead / Contact)
 */
export function trackContactWhatsApp(contextInfo?: string): void {
  try {
    console.debug(`[Analytics] Contact / Lead WhatsApp: ${contextInfo || 'Suporte Geral'}`);

    if (window.fbq) {
      window.fbq('track', 'Contact', { content_name: contextInfo || 'WhatsApp Suporte' });
    }

    if (window.gtag) {
      window.gtag('event', 'generate_lead', {
        event_category: 'engagement',
        event_label: contextInfo || 'WhatsApp'
      });
    }

    if (window.ttq) {
      window.ttq.track('Contact', {
        content_name: contextInfo || 'WhatsApp'
      });
    }
  } catch (err) {
    console.warn('[Analytics] Erro ao registrar Contact:', err);
  }
}
