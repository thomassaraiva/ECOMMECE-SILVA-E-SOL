import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, StoreSettings } from '../types/ecommerce';
import { StoreService } from '../lib/storage';
import { trackAddToCart, trackInitiateCheckout } from '../lib/analytics';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string, model?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkoutWhatsApp: (settings: StoreSettings, customerNotes?: string, customerName?: string, customerCity?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'silva_e_sol_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Erro ao salvar carrinho:', e);
    }
  }, [cart]);

  const addToCart = (
    product: Product,
    size?: string,
    color?: string,
    model?: string,
    quantity = 1
  ) => {
    const s = size || (product.sizes.length > 0 ? product.sizes[0] : undefined);
    const c = color || (product.colors.length > 0 ? product.colors[0] : undefined);
    const m = model || (product.models.length > 0 ? product.models[0] : undefined);

    const cartItemId = `${product.id}-${s || 'default'}-${c || 'default'}-${m || 'default'}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, product.stockQuantity || 99);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          promotionalPrice: product.promotionalPrice,
          selectedSize: s,
          selectedColor: c,
          selectedModel: m,
          quantity: Math.min(quantity, product.stockQuantity || 99),
          image: product.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
          maxStock: product.stockQuantity || 99
        };
        return [...prev, newItem];
      }
    });

    trackAddToCart(product, quantity, s, c);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(nextQty, item.maxStock)
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => {
    const unitPrice = item.promotionalPrice && item.promotionalPrice < item.price 
      ? item.promotionalPrice 
      : item.price;
    return acc + unitPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = 299;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const checkoutWhatsApp = (
    settings: StoreSettings, 
    customerNotes?: string, 
    customerName?: string, 
    customerCity?: string
  ) => {
    if (cart.length === 0) return;

    // Disparar evento InitiateCheckout para Meta, TikTok e GA4
    trackInitiateCheckout(cart, subtotal);

    const orderNumber = `SES-${Date.now().toString().slice(-6)}`;
    const phone = settings.whatsappNumber.replace(/\D/g, '') || '5581920019982';

    // Construção profissional e organizada da mensagem conforme Seção 13
    let msg = `☀️ *PEDIDO SILVA E SOL - ${orderNumber}*\n`;
    msg += `Olá! Gostaria de fechar meu pedido na loja oficial Silva e Sol.\n\n`;

    if (customerName) {
      msg += `👤 *Cliente:* ${customerName}\n`;
    }
    if (customerCity) {
      msg += `📍 *Cidade/UF:* ${customerCity}\n`;
    }
    msg += `------------------------------------\n`;
    msg += `📦 *ITENS DO PEDIDO:*\n\n`;

    cart.forEach((item, index) => {
      const effectivePrice = item.promotionalPrice || item.price;
      const itemSubtotal = effectivePrice * item.quantity;
      msg += `${index + 1}. *${item.name}*\n`;
      
      const details: string[] = [];
      if (item.selectedSize) details.push(`Tamanho: ${item.selectedSize}`);
      if (item.selectedColor) details.push(`Cor: ${item.selectedColor}`);
      if (item.selectedModel) details.push(`Modelo: ${item.selectedModel}`);
      
      if (details.length > 0) {
        msg += `   └ ${details.join(' | ')}\n`;
      }
      msg += `   └ Qtd: ${item.quantity} un. x R$ ${effectivePrice.toFixed(2).replace('.', ',')} = *R$ ${itemSubtotal.toFixed(2).replace('.', ',')}*\n\n`;
    });

    msg += `------------------------------------\n`;
    msg += `💰 *SUBTOTAL:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    
    if (subtotal >= freeShippingThreshold) {
      msg += `🚚 *FRETE:* Benefício Frete Grátis Qualificado! (Consulte CEP)\n`;
    } else {
      msg += `🚚 *FRETE:* A calcular para meu CEP\n`;
    }
    msg += `⭐ *TOTAL ESTIMADO:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;

    if (customerNotes && customerNotes.trim()) {
      msg += `\n📝 *Observações:* ${customerNotes.trim()}\n`;
    }

    msg += `\nAguardo as instruções para pagamento via Pix/Cartão e envio. Obrigado! ☀️🌊`;

    // Gravar pedido no histórico
    StoreService.saveOrder({
      id: orderNumber,
      orderNumber,
      customerName: customerName || 'Cliente WhatsApp',
      customerPhone: '',
      customerCity: customerCity || '',
      customerNotes: customerNotes || '',
      subtotal,
      discount: 0,
      total: subtotal,
      status: 'pending_whatsapp',
      items: cart.map(i => ({
        id: i.id,
        productId: i.productId,
        productName: i.name,
        size: i.selectedSize,
        color: i.selectedColor,
        model: i.selectedModel,
        quantity: i.quantity,
        unitPrice: i.promotionalPrice || i.price,
        subtotal: (i.promotionalPrice || i.price) * i.quantity
      })),
      createdAt: new Date().toISOString()
    });

    // Abrir WhatsApp diretamente
    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        freeShippingThreshold,
        remainingForFreeShipping,
        isCartOpen,
        setIsCartOpen,
        checkoutWhatsApp
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
