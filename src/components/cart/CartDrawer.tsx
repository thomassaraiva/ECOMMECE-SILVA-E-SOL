import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle, 
  ShoppingBag, 
  ArrowRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatBRL } from '../../lib/format';
import { effectivePrice } from '../../lib/pricing';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    totalItems,
    checkoutWhatsApp 
  } = useCart();
  const { settings, setCurrentPage } = useStore();

  if (!isCartOpen) return null;


  const handleCheckout = () => {
    checkoutWhatsApp(settings);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in">
        <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E6DDD0] text-[#2D2823] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Topo do Carrinho */}
            <div className="p-4 sm:p-5 border-b border-[#E6DDD0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E8F4F3] flex items-center justify-center text-[#2A8882]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="font-heading font-bold text-lg text-[#2D2823]">
                  Sua Sacola
                </h2>
                <span className="text-xs bg-[#FEF2EA] text-[#F4803E] font-semibold px-2 py-0.5 rounded-full border border-[#FCD5BC]">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-[#736A5E] hover:text-[#2D2823] rounded-lg hover:bg-[#F5EFE6] transition-colors"
                aria-label="Fechar carrinho"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Itens */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#E6DDD0]/70">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#736A5E]">
                  <div className="w-16 h-16 rounded-full bg-white border border-[#E6DDD0] flex items-center justify-center mb-4 text-[#2A8882]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-[#2D2823]">
                    Sua sacola está vazia
                  </h3>
                  <p className="text-xs text-[#736A5E] mt-1 max-w-xs leading-relaxed">
                    Você ainda não adicionou nenhuma peça da Silva e Sol ao seu pedido.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCurrentPage('catalog');
                    }}
                    className="mt-6 inline-flex items-center gap-2 bg-[#2A8882] hover:bg-[#22706A] text-white font-semibold text-xs py-2.5 px-5 rounded-full transition-colors shadow-sm"
                  >
                    <span>Explorar Catálogo Solar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  {cart.map((item) => {
                    const unitPrice = effectivePrice(item);
                    return (
                      <div key={item.id} className="py-3.5 flex gap-3 group">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-20 object-cover rounded-lg bg-white border border-[#E8DEC8] shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-semibold text-[#2D2823] line-clamp-1">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-[#9E9484] hover:text-red-500 p-1 transition-colors"
                                title="Remover item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            {/* Variações Selecionadas */}
                            <div className="flex flex-wrap gap-1.5 mt-1 text-[11px]">
                              {item.selectedSize && (
                                <span className="bg-[#FAF7F2] border border-[#E6DDD0] text-[#2A8882] px-1.5 py-0.5 rounded font-medium">
                                  Tam: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className="bg-[#FAF7F2] border border-[#E6DDD0] text-[#736A5E] px-1.5 py-0.5 rounded">
                                  Cor: {item.selectedColor}
                                </span>
                              )}
                              {item.selectedModel && (
                                <span className="bg-[#FAF7F2] border border-[#E6DDD0] text-[#736A5E] px-1.5 py-0.5 rounded">
                                  {item.selectedModel}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantidade e Preço */}
                          <div className="flex items-center justify-between mt-2 pt-1">
                            <div className="flex items-center border border-[#E6DDD0] rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1.5 text-[#524B42] hover:bg-[#F5EFE6]"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-medium text-[#2D2823]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1.5 text-[#524B42] hover:bg-[#F5EFE6]"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-[#2A8882]">
                                {formatBRL(unitPrice * item.quantity)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="block text-[10px] text-[#9E9484]">
                                  ({formatBRL(unitPrice)} un.)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                </>
              )}
            </div>

            {/* Rodapé do Carrinho com Checkout Stone e WhatsApp */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-[#E6DDD0] bg-white space-y-3 shadow-xs">
                
                {/* Resumo de Valores */}
                <div className="space-y-1 text-xs text-[#524B42] pt-1">
                  <div className="flex justify-between">
                    <span className="text-[#736A5E]">Subtotal:</span>
                    <span className="font-semibold text-[#2D2823]">
                      {formatBRL(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#736A5E]">Frete:</span>
                    <span className="font-semibold text-[#2D2823]">combinado no WhatsApp</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-[#2D2823] pt-1.5 border-t border-[#E6DDD0]">
                    <span>Total da Compra:</span>
                    <span className="text-lg text-[#2A8882] font-heading font-extrabold">
                      {formatBRL(subtotal)}
                    </span>
                  </div>
                </div>

                {/* BOTÃO PRINCIPAL: FINALIZAR PELO WHATSAPP */}
                <button
                  id="btn-checkout-whatsapp"
                  onClick={handleCheckout}
                  className="w-full bg-[#2A8882] hover:bg-[#22706A] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Finalizar pelo WhatsApp</span>
                </button>

              </div>
            )}

          </div>
        </div>
      </div>

    </>
  );
};

