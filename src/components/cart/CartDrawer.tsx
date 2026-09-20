import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Lock, 
  MapPin, 
  Loader2, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { ShippingOption, CustomerAddress } from '../../types/ecommerce';
import { fetchAddressByCep, calculateMelhorEnvioQuotes } from '../../lib/shipping';
import { CheckoutModal } from '../checkout/CheckoutModal';

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
  const { settings, products, setCurrentPage } = useStore();

  // Estados de Checkout Stone & Supabase Auth
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Estados de Cálculo de Frete Livre (Melhor Envio & Correios via CEP)
  const [shippingCep, setShippingCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingAddress, setShippingAddress] = useState<CustomerAddress | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // WhatsApp rápido
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  if (!isCartOpen) return null;

  // Função para consultar frete via CEP usando a API Melhor Envio simulada com base nas dimensões reais
  const handleCalculateShipping = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCep = shippingCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setShippingError('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      const addressData = await fetchAddressByCep(cleanCep);
      const state = addressData?.state || 'PE';

      if (addressData) {
        setShippingAddress({
          cep: shippingCep,
          street: addressData.street || '',
          number: '',
          neighborhood: addressData.neighborhood || '',
          city: addressData.city || '',
          state: addressData.state || ''
        });
        if (addressData.city && !customerCity) {
          setCustomerCity(`${addressData.city}/${addressData.state}`);
        }
      }

      const quotes = calculateMelhorEnvioQuotes(
        cleanCep,
        state,
        cart,
        products,
        subtotal,
        freeShippingThreshold
      );

      setShippingOptions(quotes);
      if (quotes.length > 0) {
        // Seleciona a opção mais vantajosa (ou grátis se disponível)
        const freeOpt = quotes.find(q => q.isFree) || quotes[0];
        setSelectedShipping(freeOpt);
      }
    } catch {
      setShippingError('Não foi possível calcular o frete agora. Tente novamente.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subtotal + shippingCost;

  const handleCheckout = () => {
    checkoutWhatsApp(settings, customerNotes, customerName, customerCity);
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

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
                <>
                  {cart.map((item) => {
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
                  })}

                  {/* Consulta Livre de Frete via CEP (API Melhor Envio & Correios) */}
                  <div className="pt-4 pb-2">
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E6DDD0] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D2823]">
                          <Truck className="w-4 h-4 text-[#2A8882]" />
                          <span>Calcular Frete (Melhor Envio)</span>
                        </div>
                        <span className="text-[10px] text-[#736A5E] font-medium">
                          100% livre sem login
                        </span>
                      </div>

                      <form onSubmit={handleCalculateShipping} className="flex gap-2">
                        <div className="relative flex-1">
                          <MapPin className="w-3.5 h-3.5 text-[#9E9484] absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={shippingCep}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
                              setShippingCep(raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw);
                            }}
                            placeholder="Digite seu CEP"
                            maxLength={9}
                            className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] font-mono focus:outline-none focus:border-[#2A8882]"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isCalculatingShipping}
                          className="px-3 py-1.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isCalculatingShipping ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Calcular</span>
                          )}
                        </button>
                      </form>

                      {shippingError && (
                        <p className="text-[11px] text-red-600">{shippingError}</p>
                      )}

                      {/* Lista de Cotações Retornadas */}
                      {shippingOptions.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#736A5E] block">
                            Opções calculadas para {shippingAddress?.city || 'seu endereço'}:
                          </span>

                          <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {shippingOptions.map((opt) => {
                              const isSelected = selectedShipping?.id === opt.id;
                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => setSelectedShipping(opt)}
                                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                    isSelected 
                                      ? 'border-[#2A8882] bg-[#E8F4F3]/60 font-semibold' 
                                      : 'border-[#E6DDD0] bg-[#FAF7F2] hover:bg-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                      isSelected ? 'border-[#2A8882] bg-[#2A8882]' : 'border-[#B8ACA0]'
                                    }`}>
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                      <div className="text-xs text-[#2D2823]">
                                        {opt.carrier} - {opt.name}
                                      </div>
                                      <div className="text-[10px] text-[#736A5E]">
                                        Chega em até {opt.deliveryDays || opt.estimatedDays} dias úteis
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className={`text-xs ${opt.isFree ? 'text-emerald-700 font-bold' : 'text-[#2A8882] font-bold'}`}>
                                      {opt.isFree ? 'Grátis' : `R$ ${opt.price.toFixed(2).replace('.', ',')}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                      R$ {subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {selectedShipping && (
                    <div className="flex justify-between">
                      <span className="text-[#736A5E]">
                        Frete ({selectedShipping.carrier}):
                      </span>
                      <span className={`font-semibold ${selectedShipping.isFree ? 'text-emerald-600' : 'text-[#2D2823]'}`}>
                        {selectedShipping.isFree ? 'Grátis' : `R$ ${selectedShipping.price.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-bold text-[#2D2823] pt-1.5 border-t border-[#E6DDD0]">
                    <span>Total da Compra:</span>
                    <span className="text-lg text-[#2A8882] font-heading font-extrabold">
                      R$ {grandTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* BOTÃO PRINCIPAL: IR PARA O PAGAMENTO (STONE & SUPABASE AUTH) */}
                <button
                  id="btn-checkout-stone"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full bg-[#2A8882] hover:bg-[#22706A] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-sm cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>Ir para o Pagamento</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                {/* BOTÃO SECUNDÁRIO: FINALIZAR PELO WHATSAPP */}
                <div className="pt-1">
                  <button
                    id="btn-checkout-whatsapp"
                    onClick={handleCheckout}
                    className="w-full bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DDD0] text-[#2D2823] font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                    <span>Ou finalizar pelo WhatsApp com atendente</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9E9484] pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pagamento Seguro via Stone • PIX Instantâneo e Cartão até 12x</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal de Checkout Integrado (Supabase Auth + Dados Complementares + Stone Payment) */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        selectedShipping={selectedShipping}
        shippingAddress={shippingAddress}
        onShippingAddressChange={(addr) => setShippingAddress(addr)}
      />
    </>
  );
};

