import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FeaturedRow } from '../components/home/FeaturedRow';
import { BrandStory } from '../components/home/BrandStory';
import { useStore } from '../context/StoreContext';
import { StoreStatus } from '../components/common/StoreStatus';
import { ShieldCheck, Truck, RefreshCw, MessageCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, isLoading, loadError, reload, settings } = useStore();
  const hasActiveProducts = products.some(p => p.isActive);
  const showCatalog = !isLoading && !loadError && hasActiveProducts;

  const featuredProducts = products.filter(p => p.isFeatured && p.isActive);
  const newProducts = products.filter(p => p.isNew && p.isActive);
  const saleProducts = products.filter(p => p.isOnSale && p.isActive);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2823] flex flex-col">
      {/* 1. Banner Principal */}
      <HeroBanner />

      <StoreStatus
        isLoading={isLoading}
        loadError={loadError}
        hasProducts={hasActiveProducts}
        whatsappNumber={settings.whatsappNumber}
        onRetry={reload}
      />

      {/* Faixa de Vantagens e Confiança Solar (Paleta Areia Leve) */}
      <section className="bg-[#F5EFE6] border-b border-[#E6DDD0] py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FEF2EA] flex items-center justify-center text-[#F4803E] shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2D2823]">Envio Rápido Brasil</p>
                <p className="text-[10px] text-[#736A5E]">Rastreamento seguro</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8F4F3] flex items-center justify-center text-[#2A8882] shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2D2823]">Troca Fácil 7 Dias</p>
                <p className="text-[10px] text-[#736A5E]">Sem burocracia</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FEF2EA] flex items-center justify-center text-[#F4803E] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2D2823]">Proteção UV50+</p>
                <p className="text-[10px] text-[#736A5E]">Tecidos nobres e duráveis</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8F4F3] flex items-center justify-center text-[#2A8882] shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2D2823]">Atendimento Humano</p>
                <p className="text-[10px] text-[#736A5E]">Direto no WhatsApp</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {showCatalog && (
        <>
          {/* 2. Categorias em Destaque */}
          <CategoryGrid />

          {/* 3. Lançamentos da Coleção */}
          {newProducts.length > 0 && (
            <FeaturedRow
              title="Novos Lançamentos"
              subtitle="As novidades recém-chegadas para quem valoriza frescor, conforto e estilo solar contemporâneo."
              products={newProducts}
              tag="Nova Coleção"
            />
          )}

          {/* 4. Destaques da Marca */}
          {featuredProducts.length > 0 && (
            <div className="bg-[#F5EFE6]/60 border-y border-[#E6DDD0]">
              <FeaturedRow
                title="Destaques Silva e Sol"
                subtitle="Peças icônicas com modelagem anatômica perfeita, caimento impecável e elegância praiana."
                products={featuredProducts}
                tag="Mais Desejados"
              />
            </div>
          )}

          {/* 5. Ofertas Especiais */}
          {saleProducts.length > 0 && (
            <FeaturedRow
              title="Oportunidades Solares"
              subtitle="Peças selecionadas com descontos especiais por tempo limitado."
              products={saleProducts}
              tag="Ofertas & Promoções"
            />
          )}
        </>
      )}

      {/* 6. A Alma da Marca (História e Conexão) */}
      <BrandStory />
    </div>
  );
};
