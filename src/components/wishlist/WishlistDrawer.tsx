import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist, isWishlistOpen, setIsWishlistOpen } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const { setSelectedProduct, setCurrentPage } = useStore();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop transparente / escurecido leve */}
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] text-[#2D2823] shadow-2xl flex flex-col border-l border-[#E6DDD0]">
          
          {/* Topo da Gaveta */}
          <div className="p-4 sm:p-5 border-b border-[#E6DDD0] flex items-center justify-between bg-[#F4EFE6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8F4F3] flex items-center justify-center text-[#2A8882]">
                <Heart className="w-4 h-4 fill-[#2A8882]" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-[#2D2823] leading-none">
                  Lista de Desejos
                </h2>
                <span className="text-xs text-[#736A5E] font-medium">
                  {wishlist.length === 1 ? '1 item salvo' : `${wishlist.length} itens salvos`}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-[#736A5E] hover:text-[#2D2823] rounded-full hover:bg-[#EBE4D8] transition-colors"
              aria-label="Fechar Lista de Desejos"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo da Wishlist */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-[#F3ECE0] flex items-center justify-center text-[#9E9484] mb-3.5 border border-[#E3D8C6]">
                  <Heart className="w-8 h-8 text-[#9E9484]" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#2D2823] mb-1">
                  Sua lista está vazia
                </h3>
                <p className="text-xs text-[#736A5E] max-w-xs mb-6 leading-relaxed">
                  Clique no ícone de coração nos produtos que você mais gostou para salvá-los aqui e rever quando quiser.
                </p>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    setCurrentPage('catalog');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#2A8882] hover:bg-[#22706A] text-white font-medium text-xs tracking-wide shadow-sm transition-all"
                >
                  <span>Explorar Catálogo Solar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              wishlist.map((item) => {
                const hasDiscount = item.isOnSale && item.promotionalPrice && item.promotionalPrice < item.price;
                const effectivePrice = hasDiscount ? item.promotionalPrice! : item.price;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-[#E8DEC8] shadow-xs flex gap-3.5 items-center transition-all hover:border-[#2A8882]/40"
                  >
                    {/* Imagem do Produto */}
                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setCurrentPage('product');
                        setIsWishlistOpen(false);
                      }}
                      className="w-18 h-22 rounded-lg overflow-hidden bg-[#F4EFE6] shrink-0 relative group"
                    >
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </button>

                    {/* Informações e Ações */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setCurrentPage('product');
                          setIsWishlistOpen(false);
                        }}
                        className="text-left font-heading font-semibold text-sm text-[#2D2823] hover:text-[#2A8882] truncate block"
                      >
                        {item.name}
                      </button>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-sm text-[#2A8882]">
                          R$ {effectivePrice.toFixed(2).replace('.', ',')}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-[#9E9484] line-through">
                            R$ {item.price.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>

                      {/* Tamanhos disponíveis */}
                      {item.sizes.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#736A5E]">
                          <span>Tamanhos:</span>
                          <span className="font-semibold text-[#2D2823]">{item.sizes.join(', ')}</span>
                        </div>
                      )}

                      {/* Botões: Mover para o carrinho e Remover */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          onClick={() => {
                            addToCart(item, 1, item.sizes[0], item.colors[0]);
                            setIsWishlistOpen(false);
                            setIsCartOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4803E] hover:bg-[#E0702F] text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </button>

                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-1.5 text-[#9E9484] hover:text-red-500 rounded-md hover:bg-[#F7F2EA] transition-colors"
                          title="Remover da lista de desejos"
                          aria-label="Remover item da lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé da Gaveta */}
          {wishlist.length > 0 && (
            <div className="p-4 bg-[#F4EFE6] border-t border-[#E6DDD0] flex items-center justify-between">
              <button
                onClick={clearWishlist}
                className="text-xs text-[#736A5E] hover:text-red-600 font-medium underline underline-offset-2"
              >
                Limpar lista
              </button>

              <button
                onClick={() => {
                  setIsWishlistOpen(false);
                  setCurrentPage('catalog');
                }}
                className="px-4 py-2 rounded-lg bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-semibold transition-colors"
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
