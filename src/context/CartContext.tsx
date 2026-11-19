import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, StoreSettings } from '../types/ecommerce';
import { buildWhatsAppOrderUrl } from '../lib/whatsappOrder';
import { trackAddToCart, trackInitiateCheckout } from '../lib/analytics';
import { PRODUCT_IMAGE_FALLBACK } from '../lib/placeholders';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string, model?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
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
          image: product.images[0] || PRODUCT_IMAGE_FALLBACK,
          maxStock: product.stockQuantity || 99,
          weightGrams: product.weightGrams ?? 200,
          heightCm: product.heightCm ?? 4,
          widthCm: product.widthCm ?? 15,
          lengthCm: product.lengthCm ?? 20
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

  const checkoutWhatsApp = (
    settings: StoreSettings, 
    customerNotes?: string, 
    customerName?: string, 
    customerCity?: string
  ) => {
    if (cart.length === 0) return;

    // Disparar evento InitiateCheckout para Meta, TikTok e GA4
    trackInitiateCheckout(cart, subtotal);

    const url = buildWhatsAppOrderUrl(cart, settings, { customerName, customerCity, customerNotes });
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
