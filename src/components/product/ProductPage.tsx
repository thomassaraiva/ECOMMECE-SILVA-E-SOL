import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  ArrowLeft, 
  Check, 
  Percent, 
  Heart, 
  Share2, 
  AlertCircle,
  Ruler,
  Play,
  Film
} from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { SizeChartModal } from './SizeChartModal';
import { trackViewContent, trackAddToWishlist, trackContactWhatsApp } from '../../lib/analytics';

interface ProductPageProps {
  product: Product;
}

export const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
  const { setCurrentPage, categories } = useStore();
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customVariantImage, setCustomVariantImage] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || '');
  const [selectedModel, setSelectedModel] = useState<string>(product.models[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const isFavorite = isInWishlist(product.id);

  // Resetar e inicializar seleções com foto correspondente da variação
  React.useEffect(() => {
    const initialSize = product.sizes[0] || '';
    const initialColor = product.colors[0] || '';
    const initialModel = product.models[0] || '';
    setShowVideo(false);
    setSelectedSize(initialSize);
    setSelectedColor(initialColor);
    setSelectedModel(initialModel);
    setQuantity(1);
    setActiveImageIndex(0);

    // Se houver foto cadastrada para a primeira variação ou cor, exibir imediatamente
    const initialMatch = product.variants?.find(v => 
      (!initialSize || v.size === initialSize) &&
      (!initialColor || v.color?.toLowerCase() === initialColor.toLowerCase()) &&
      (!initialModel || v.model?.toLowerCase() === initialModel.toLowerCase()) &&
      v.imageUrl
    ) || product.variants?.find(v => 
      initialColor && v.color?.toLowerCase() === initialColor.toLowerCase() && v.imageUrl
    );

    if (initialMatch?.imageUrl) {
      setCustomVariantImage(initialMatch.imageUrl);
    } else {
      setCustomVariantImage(null);
    }
  }, [product.id]);

  // Rastreamento automático do evento ViewContent (Meta, GA4, TikTok)
  React.useEffect(() => {
    trackViewContent(product);
  }, [product.id]);

  // Variação específica selecionada dinamicamente
  const matchedVariant = product.variants?.find(v => 
    (!selectedSize || v.size === selectedSize) &&
    (!selectedColor || v.color === selectedColor) &&
    (!selectedModel || v.model === selectedModel)
  );

  // Handlers para clique nas variações com troca dinâmica de foto e dados
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    setShowVideo(false);

    // 1. Verificar se a combinação (ou cor específica) tem foto de variação cadastrada
    const variantMatch = product.variants?.find(v => 
      v.color?.toLowerCase() === color.toLowerCase() && 
      (!selectedModel || v.model === selectedModel) && 
      v.imageUrl
    ) || product.variants?.find(v => v.color?.toLowerCase() === color.toLowerCase() && v.imageUrl);

    if (variantMatch?.imageUrl) {
      setCustomVariantImage(variantMatch.imageUrl);
      return;
    }

    // 2. Se corresponder por índice na galeria de fotos do produto
    const colorIndex = product.colors.indexOf(color);
    if (colorIndex >= 0 && product.images[colorIndex]) {
      setActiveImageIndex(colorIndex);
      setCustomVariantImage(null);
    }
  };

  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
    setShowVideo(false);

    // 1. Verificar se a característica/modelo (ex: Listrado, Liso) tem foto dedicada
    const variantMatch = product.variants?.find(v => 
      v.model?.toLowerCase() === model.toLowerCase() && 
      (!selectedColor || v.color === selectedColor) && 
      v.imageUrl
    ) || product.variants?.find(v => v.model?.toLowerCase() === model.toLowerCase() && v.imageUrl);

    if (variantMatch?.imageUrl) {
      setCustomVariantImage(variantMatch.imageUrl);
      return;
    }

    // 2. Ou índice correspondente
    const modelIndex = product.models.indexOf(model);
    if (modelIndex >= 0 && product.images[modelIndex]) {
      setActiveImageIndex(modelIndex);
      setCustomVariantImage(null);
    }
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    const variantMatch = product.variants?.find(v => 
      v.size === size && 
      (!selectedColor || v.color === selectedColor) && 
      v.imageUrl
    );
    if (variantMatch?.imageUrl) {
      setCustomVariantImage(variantMatch.imageUrl);
      setShowVideo(false);
    }
  };

  const currentDisplayImage = customVariantImage || (product.images[activeImageIndex] || product.images[0]);

  const isVariantOutOfStock = matchedVariant 
    ? (matchedVariant.stockQuantity <= 0 || matchedVariant.isAvailable === false)
    : false;

  const isGeneralOutOfStock = product.stockQuantity <= 0;
  const isOutOfStock = isGeneralOutOfStock || isVariantOutOfStock;

  const effectiveStock = matchedVariant ? matchedVariant.stockQuantity : product.stockQuantity;

  const discountPercent = product.promotionalPrice && product.price > product.promotionalPrice
    ? Math.round(((product.price - product.promotionalPrice) / product.price) * 100)
    : 0;

  const basePrice = matchedVariant?.price || product.price;
  const currentPrice = product.promotionalPrice && product.isOnSale
    ? product.promotionalPrice
    : basePrice;

  const category = categories.find(c => c.id === product.categoryId);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor, selectedModel);
    setIsCartOpen(true);
  };

  const handleBuyNowWhatsApp = () => {
    if (isOutOfStock) return;
    trackContactWhatsApp(`Compra Rápida: ${product.name}`);
    addToCart(product, quantity, selectedSize, selectedColor, selectedModel);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2823] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Botões de Ação */}
        <div className="flex items-center justify-between mb-6 text-xs text-[#736A5E]">
          <button
            onClick={() => setCurrentPage('catalog')}
            className="inline-flex items-center gap-1.5 text-[#524B42] hover:text-[#2A8882] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Catálogo</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Botão Favoritar na Página do Produto */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isFavorite
                  ? 'bg-[#FEF2EA] border-[#FCD5BC] text-[#F4803E]'
                  : 'bg-white border-[#E6DDD0] text-[#736A5E] hover:text-[#F4803E] hover:border-[#FCD5BC]'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Salvar na lista de desejos'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#F4803E]' : ''}`} />
              <span className="hidden sm:inline">
                {isFavorite ? 'Salvo na Lista' : 'Salvar na Lista'}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-[#E6DDD0] text-[#736A5E] hover:text-[#2A8882] transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Compartilhar produto"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
            </button>
          </div>
        </div>

        {/* Grid Principal: Galeria + Detalhes Comerciais */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Coluna da Galeria de Fotos e Vídeo */}
          <div className="lg:col-span-7 space-y-4">
            {/* Mídia Principal: Vídeo ou Foto */}
            <div className="relative aspect-[4/5] bg-[#F4EFE6] rounded-3xl overflow-hidden border border-[#E8DEC8] shadow-sm flex items-center justify-center">
              {showVideo && product.videoUrl ? (
                <div className="w-full h-full bg-black relative flex items-center justify-center">
                  <video
                    src={product.videoUrl}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 transition-all font-medium"
                  >
                    Ver Fotos
                  </button>
                </div>
              ) : (
                <>
                  <img
                    src={currentDisplayImage}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-all duration-300"
                  />

                  {/* Badge da Variação Ativa */}
                  {(selectedColor || selectedModel) && (
                    <div className="absolute bottom-3 left-3 bg-stone-950/85 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-[#2A8882]" />
                      <span>Variação: {[selectedColor, selectedModel].filter(Boolean).join(' • ')}</span>
                    </div>
                  )}

                  {/* Badges de Destaque / Promo */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isOnSale && discountPercent > 0 && (
                      <span className="bg-[#F4803E] text-white text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm flex items-center gap-1 uppercase tracking-wider">
                        <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
                        -{discountPercent}% OFF
                      </span>
                    )}
                    {product.isNew && (
                      <span className="bg-[#2A8882] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm uppercase tracking-wider">
                        Lançamento Exclusivo
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Miniaturas da Galeria (Fotos + Vídeo se houver) */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all flex flex-col items-center justify-center gap-1 bg-stone-900 text-amber-400 ${
                    showVideo
                      ? 'border-[#2A8882] ring-2 ring-[#2A8882]/20'
                      : 'border-[#E6DDD0] opacity-90 hover:opacity-100'
                  }`}
                  title="Assistir Vídeo do Produto"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-amber-400 text-amber-400 ml-0.5" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Vídeo</span>
                </button>
              )}

              {/* Miniatura da variação caso não esteja na lista principal de fotos */}
              {customVariantImage && !product.images.includes(customVariantImage) && (
                <button
                  type="button"
                  onClick={() => setShowVideo(false)}
                  className="relative w-20 h-24 rounded-xl overflow-hidden border-2 border-[#2A8882] ring-2 ring-[#2A8882]/20 shrink-0 transition-all cursor-pointer"
                  title="Foto da variação selecionada"
                >
                  <img
                    src={customVariantImage}
                    alt="Foto da variação"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-[#2A8882] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    Variação
                  </span>
                </button>
              )}

              {product.images.map((img, idx) => {
                const isThisActive = !showVideo && (customVariantImage === img || (!customVariantImage && activeImageIndex === idx));
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowVideo(false);
                      setCustomVariantImage(null);
                      setActiveImageIndex(idx);
                    }}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      isThisActive
                        ? 'border-[#2A8882] ring-2 ring-[#2A8882]/20'
                        : 'border-[#E6DDD0] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} foto ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coluna de Seleção de Variações e Compra */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {category && (
                <span className="text-xs uppercase tracking-widest text-[#2A8882] font-bold">
                  {category.name}
                </span>
              )}
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2D2823] mt-1 leading-snug">
                {product.name}
              </h1>
              {(matchedVariant?.sku || product.sku) && (
                <p className="text-xs text-[#8A8072] font-mono mt-1">
                  SKU: {matchedVariant?.sku || product.sku}
                </p>
              )}
            </div>

            {/* Preço e Promoção */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-xs space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-bold text-2xl sm:text-3xl text-[#2A8882]">
                  R$ {currentPrice.toFixed(2).replace('.', ',')}
                </span>
                {product.promotionalPrice && product.isOnSale && (
                  <span className="text-sm text-[#9E9484] line-through">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#736A5E]">
                Em até 3x de R$ {(currentPrice / 3).toFixed(2).replace('.', ',')} sem juros no cartão ou via Pix
              </p>
            </div>

            {/* Descrição Curta */}
            <p className="text-sm text-[#524B42] leading-relaxed">
              {product.description}
            </p>

            {/* Seleção de Tamanho */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-[#2D2823]">
                    Tamanho: <span className="text-[#2A8882]">{selectedSize}</span>
                  </label>
                  
                  {/* Botão de Tabela de Medidas */}
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#2A8882] hover:text-[#22706A] font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                    id="btn-open-size-chart"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Tabela de Medidas</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSelectSize(size)}
                      className={`min-w-[48px] h-11 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${
                        selectedSize === size
                          ? 'border-[#2A8882] bg-[#2A8882] text-white shadow-xs'
                          : 'border-[#E6DDD0] bg-white text-[#524B42] hover:border-[#2A8882]/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seleção de Cor */}
            {product.colors.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-[#2D2823] mb-2">
                  Cor: <span className="text-[#2A8882]">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const colorVariant = product.variants?.find(
                      v => v.color?.toLowerCase() === color.toLowerCase() && v.imageUrl
                    );
                    const colorThumb = colorVariant?.imageUrl;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleSelectColor(color)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                          selectedColor === color
                            ? 'border-[#2A8882] bg-[#E8F4F3] text-[#2A8882] font-semibold shadow-xs'
                            : 'border-[#E6DDD0] bg-white text-[#524B42] hover:border-[#2A8882]/40'
                        }`}
                      >
                        {colorThumb ? (
                          <img
                            src={colorThumb}
                            alt={color}
                            className="w-4 h-4 rounded-full object-cover border border-stone-300 shrink-0"
                          />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full border border-stone-300 bg-stone-200 shrink-0" />
                        )}
                        <span>{color}</span>
                        {selectedColor === color && <Check className="w-3.5 h-3.5 text-[#2A8882]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Seleção de Característica / Modelo (ex: Listrado, Liso) */}
            {product.models.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-[#2D2823] mb-2">
                  Característica / Modelo: <span className="text-[#2A8882]">{selectedModel}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.models.map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => handleSelectModel(model)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedModel === model
                          ? 'border-[#2A8882] bg-[#E8F4F3] text-[#2A8882] font-semibold shadow-xs'
                          : 'border-[#E6DDD0] bg-white text-[#524B42] hover:border-[#2A8882]/40'
                      }`}
                    >
                      <span>{model}</span>
                      {selectedModel === model && <Check className="w-3.5 h-3.5 text-[#2A8882]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Disponibilidade de Estoque */}
            <div className="flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <div className="flex items-center gap-1.5 text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  <span>{isVariantOutOfStock ? 'Esgotado nesta variação' : 'Produto esgotado no momento'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[#2A8882]">
                  <span className="w-2 h-2 rounded-full bg-[#2A8882]" />
                  <span className="font-medium">Disponível em estoque ({effectiveStock} un.)</span>
                </div>
              )}
            </div>

            {/* Seletor de Quantidade e Ações de Compra */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#E6DDD0] rounded-xl bg-white overflow-hidden h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="w-10 h-full text-[#524B42] hover:bg-[#F5EFE6] flex items-center justify-center font-bold text-base disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-[#2D2823]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={isOutOfStock || quantity >= product.stockQuantity}
                    className="w-10 h-full text-[#524B42] hover:bg-[#F5EFE6] flex items-center justify-center font-bold text-base disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Botão Adicionar à Sacola */}
                <button
                  id="btn-add-to-cart-page"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 bg-[#2A8882] hover:bg-[#22706A] text-white font-bold h-12 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Esgotado' : 'Adicionar à Sacola'}</span>
                </button>
              </div>

              {/* Botão Direto de Fechamento pelo WhatsApp */}
              <button
                id="btn-buy-whatsapp-direct"
                onClick={handleBuyNowWhatsApp}
                disabled={isOutOfStock}
                className="w-full bg-[#F4803E] hover:bg-[#DE6B22] text-white font-bold h-12 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-5 h-5 fill-white text-white" />
                <span>Comprar com Atendente no WhatsApp</span>
              </button>
            </div>

            {/* Descrição Detalhada / Ficha Técnica */}
            {product.detailedDescription && (
              <div className="pt-4 border-t border-[#E6DDD0]">
                <h4 className="text-xs uppercase font-bold tracking-wider text-[#2A8882] mb-2">
                  Especificações & Tecido
                </h4>
                <p className="text-xs text-[#736A5E] leading-relaxed">
                  {product.detailedDescription}
                </p>
              </div>
            )}

            {/* Atalho Rápido para Tabela de Medidas */}
            {product.sizeChart && (
              <div className="pt-4 border-t border-[#E6DDD0]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-[#2A8882] flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Guia de Medidas da Peça</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-xs text-[#F4803E] hover:underline font-semibold"
                  >
                    Ver Completa
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[#E6DDD0] bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-[#F5EFE6] text-[#2D2823] border-b border-[#E6DDD0]">
                        {product.sizeChart.columns.map((c, i) => (
                          <th key={i} className="py-2 px-2.5 font-bold text-center first:text-left first:text-[#2A8882]">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6DDD0]/60">
                      {product.sizeChart.rows.slice(0, 4).map((r, ri) => (
                        <tr key={ri}>
                          <td className="py-1.5 px-2.5 font-bold text-[#2D2823] whitespace-nowrap">
                            {r.size}
                          </td>
                          {r.values.map((v, vi) => (
                            <td key={vi} className="py-1.5 px-2.5 text-center text-[#736A5E] font-mono text-[10px] whitespace-nowrap">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Modal Interativo com Guia e Tabela de Medidas */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        sizeChart={product.sizeChart}
        productName={product.name}
      />
    </div>
  );
};
