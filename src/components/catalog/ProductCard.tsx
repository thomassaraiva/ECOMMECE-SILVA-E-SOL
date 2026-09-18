import React from 'react';
import { ShoppingBag, Eye, Percent, Heart } from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateToProduct } = useStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [hoveredImage, setHoveredImage] = React.useState<string | null>(null);

  const isFavorite = isInWishlist(product.id);

  const discountPercent = product.promotionalPrice && product.price > product.promotionalPrice
    ? Math.round(((product.price - product.promotionalPrice) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => navigateToProduct(product)}
      className="group bg-white border border-[#E8DEC8] hover:border-[#2A8882]/60 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg cursor-pointer"
    >
      {/* Container de Imagem */}
      <div className="relative aspect-[4/5] bg-[#F5EFE6] overflow-hidden">
        <img
          src={hoveredImage || product.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Flutuantes à Esquerda */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isOnSale && discountPercent > 0 && (
            <span className="bg-[#F4803E] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <Percent className="w-3 h-3 stroke-[2.5]" />
              -{discountPercent}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#2A8882] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              Lançamento
            </span>
          )}
          {product.isFeatured && !product.isNew && (
            <span className="bg-[#FAF7F2]/95 text-[#DE6B22] text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs border border-[#FCD5BC]">
              Destaque
            </span>
          )}
        </div>

        {/* BOTÃO DE FAVORITAR / LISTA DE DESEJOS (Topo Direito) */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
            isFavorite
              ? 'bg-[#FEF2EA] text-[#F4803E] border border-[#FCD5BC]'
              : 'bg-white/85 text-[#7A7163] hover:text-[#F4803E] hover:bg-white border border-black/5'
          }`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar na lista de desejos'}
          title={isFavorite ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#F4803E]' : ''}`} />
        </button>

        {/* Overlay com Botão de Adição Rápida em Desktop */}
        <div className="hidden md:flex absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity justify-between items-center gap-2">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Adicionar Rápido</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateToProduct(product);
            }}
            className="p-2.5 bg-white/90 hover:bg-white text-[#2D2823] rounded-xl transition-colors shadow-xs"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detalhes do Produto */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Variações de Tamanho e Cores */}
          <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              {product.sizes.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="text-[10px] text-[#736A5E] border border-[#E6DDD0] px-1.5 py-0.5 rounded bg-[#FAF7F2]"
                >
                  {s}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-[10px] text-[#9E9484]">+{product.sizes.length - 4}</span>
              )}
            </div>

            {/* Amostras de Cores com Troca Rápida de Foto */}
            {product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.colors.slice(0, 4).map((color) => {
                  const variantWithPhoto = product.variants?.find(
                    v => v.color?.toLowerCase() === color.toLowerCase() && v.imageUrl
                  );
                  const colorPhoto = variantWithPhoto?.imageUrl;

                  return (
                    <button
                      key={color}
                      type="button"
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        if (colorPhoto) setHoveredImage(colorPhoto);
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        setHoveredImage(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (colorPhoto) setHoveredImage(colorPhoto);
                      }}
                      className={`relative w-3.5 h-3.5 rounded-full border transition-all overflow-hidden cursor-pointer ${
                        hoveredImage === colorPhoto && colorPhoto
                          ? 'border-[#2A8882] ring-1 ring-[#2A8882] scale-110'
                          : 'border-stone-300 hover:border-[#2A8882]'
                      }`}
                      title={color}
                    >
                      {colorPhoto ? (
                        <img
                          src={colorPhoto}
                          alt={color}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full bg-stone-200 block" />
                      )}
                    </button>
                  );
                })}
                {product.colors.length > 4 && (
                  <span className="text-[9px] text-[#9E9484]">+{product.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>

          <h3 className="font-heading font-medium text-sm text-[#2D2823] group-hover:text-[#2A8882] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-[#7A7163] line-clamp-1 mt-1 font-light">
            {product.description}
          </p>
        </div>

        {/* Bloco de Preço */}
        <div className="mt-3 pt-2.5 border-t border-[#EDE4D6]">
          <div className="flex items-baseline gap-2">
            {product.promotionalPrice && product.isOnSale ? (
              <>
                <span className="font-heading font-bold text-base sm:text-lg text-[#2A8882]">
                  R$ {product.promotionalPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-[#9E9484] line-through">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </>
            ) : (
              <span className="font-heading font-bold text-base sm:text-lg text-[#2D2823]">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#8A8072] mt-0.5">
            em até 3x de R$ {((product.promotionalPrice || product.price) / 3).toFixed(2).replace('.', ',')} sem juros
          </p>

          {/* Botão Mobile de Adição Rápida */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className="md:hidden mt-3 w-full bg-[#FAF7F2] active:bg-[#2A8882] active:text-white text-[#2A8882] text-xs font-semibold py-2.5 rounded-xl border border-[#D5DDD8] flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Adicionar à Sacola</span>
          </button>
        </div>
      </div>
    </div>
  );
};
