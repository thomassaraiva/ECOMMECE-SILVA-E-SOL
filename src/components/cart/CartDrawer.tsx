import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    totalItems,
    freeShippingThreshold,
    remainingForFreeShipping,
    checkoutWhatsApp 
  } = useCart();
  const { settings, setCurrentPage } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    checkoutWhatsApp(settings, customerNotes, customerName, customerCity);
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
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

          {/* Barra de Progresso do Frete Grátis */}
          <div className="bg-[#F5EFE6] px-4 py-2.5 border-b border-[#E6DDD0] text-xs">
            <div className="flex items-center justify-between mb-1.5 text-[#524B42]">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#F4803E]" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Faltam <strong className="text-[#F4803E]">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</strong> para Frete Grátis
                  </span>
                ) : (
                  <span className="text-[#2A8882] font-semibold">
                    🎉 Parabéns! Você atingiu frete especial!
                  </span>
                )}
              </span>
              <span className="font-mono text-[#736A5E]">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E6DDD0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F4803E] to-[#2A8882] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
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
              cart.map((item) => {
                const effectivePrice = item.promotionalPrice || item.price;
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
                            R$ {(effectivePrice * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-[#9E9484]">
                              (R$ {effectivePrice.toFixed(2).replace('.', ',')} un.)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé do Carrinho com Dados do Cliente e Finalização WhatsApp */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-[#E6DDD0] bg-white space-y-3 shadow-xs">
              
              {/* Campos Rápidos para Agilizar Atendimento */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6DDD0] text-[#2D2823] placeholder-[#9E9484] focus:outline-none focus:border-[#2A8882]"
                  />
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="Sua Cidade / UF"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6DDD0] text-[#2D2823] placeholder-[#9E9484] focus:outline-none focus:border-[#2A8882]"
                  />
                </div>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Observação (ex: prefiro entrega expressa)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6DDD0] text-[#2D2823] placeholder-[#9E9484] focus:outline-none focus:border-[#2A8882]"
                />
              </div>

              {/* Resumo de Valores */}
              <div className="space-y-1 text-xs text-[#524B42] pt-1">
                <div className="flex justify-between">
                  <span className="text-[#736A5E]">Subtotal dos itens:</span>
                  <span className="font-semibold text-[#2D2823]">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#2D2823] pt-1 border-t border-[#E6DDD0]">
                  <span>Total do pedido:</span>
                  <span className="text-base text-[#2A8882]">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className="text-[10px] text-[#736A5E]">
                  * Atendimento direto via WhatsApp com a equipe oficial Silva e Sol.
                </p>
              </div>

              {/* Botão de Finalizar no WhatsApp */}
              <button
                id="btn-checkout-whatsapp"
                onClick={handleCheckout}
                className="w-full bg-[#2A8882] hover:bg-[#22706A] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-white text-white group-hover:scale-105 transition-transform" />
                <span>Finalizar Pedido pelo WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCurrentPage('catalog');
                }}
                className="w-full text-center text-xs text-[#736A5E] hover:text-[#2D2823] py-1"
              >
                Continuar Comprando
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
