import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FeaturedRow } from '../components/home/FeaturedRow';
import { BrandStory } from '../components/home/BrandStory';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { Product } from '../types/ecommerce';
import { ShieldCheck, Truck, RefreshCw, MessageCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products: storeProducts } = useStore();
  const [supabaseProducts, setSupabaseProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca direta na tabela 'products' do Supabase para a vitrine
  useEffect(() => {
    async function fetchVitrineProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*');

        if (error) {
          console.warn('Aviso ao buscar produtos do Supabase para a vitrine:', error.message);
          return;
        }

        if (data && data.length > 0) {
          const mapped: Product[] = data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            slug: p.slug,
            sku: p.sku || undefined,
            brand: p.brand || 'Silva e Sol',
            description: p.description,
            detailedDescription: p.detailed_description || p.detailedDescription,
            price: Number(p.price),
            promotionalPrice: (p.promotional_price || p.promotionalPrice) ? Number(p.promotional_price || p.promotionalPrice) : undefined,
            isOnSale: Boolean(p.is_on_sale ?? p.isOnSale),
            isFeatured: Boolean(p.is_featured ?? p.isFeatured),
            isNew: Boolean(p.is_new ?? p.isNew),
            isActive: p.is_active !== undefined ? Boolean(p.is_active) : (p.isActive !== undefined ? Boolean(p.isActive) : true),
            categoryId: p.category_id || p.categoryId || 'cat-sungas',
            subcategoryId: p.subcategory_id || p.subcategoryId,
            stockQuantity: Number(p.stock_quantity ?? p.stockQuantity ?? 0),
            colors: Array.isArray(p.colors) ? p.colors : [],
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            models: Array.isArray(p.models) ? p.models : [],
            images: Array.isArray(p.images) ? p.images : [],
            videoUrl: p.video_url || p.videoUrl,
            variants: p.variants,
            sizeChart: p.size_chart || p.sizeChart,
            seoTitle: p.seo_title || p.seoTitle,
            seoDescription: p.seo_description || p.seoDescription,
            createdAt: p.created_at || p.createdAt,
            updatedAt: p.updated_at || p.updatedAt
          }));
          setSupabaseProducts(mapped);
        }
      } catch (err) {
        console.warn('Erro ao conectar ao Supabase para vitrine:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVitrineProducts();
  }, []);

  // Usa produtos do Supabase quando disponíveis, com fallback elegante para o store context
  const products = supabaseProducts.length > 0 ? supabaseProducts : storeProducts;

  const featuredProducts = products.filter(p => p.isFeatured && p.isActive);
  const newProducts = products.filter(p => p.isNew && p.isActive);
  const saleProducts = products.filter(p => p.isOnSale && p.isActive);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2823] flex flex-col">
      {/* 1. Banner Principal */}
      <HeroBanner />

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

      {/* 2. Categorias em Destaque */}
      <CategoryGrid />

      {/* 3. Lançamentos da Coleção */}
      <FeaturedRow
        title="Novos Lançamentos"
        subtitle="As novidades recém-chegadas para quem valoriza frescor, conforto e estilo solar contemporâneo."
        products={newProducts.length > 0 ? newProducts : products.slice(0, 4)}
        tag="Nova Coleção"
      />

      {/* 4. Destaques da Marca */}
      <div className="bg-[#F5EFE6]/60 border-y border-[#E6DDD0]">
        <FeaturedRow
          title="Destaques Silva e Sol"
          subtitle="Peças icônicas com modelagem anatômica perfeita, caimento impecável e elegância praiana."
          products={featuredProducts.length > 0 ? featuredProducts : products.slice(2, 6)}
          tag="Mais Desejados"
        />
      </div>

      {/* 5. Ofertas Especiais */}
      {saleProducts.length > 0 && (
        <FeaturedRow
          title="Oportunidades Solares"
          subtitle="Peças selecionadas com descontos especiais por tempo limitado."
          products={saleProducts}
          tag="Ofertas & Promoções"
        />
      )}

      {/* 6. A Alma da Marca (História e Conexão) */}
      <BrandStory />
    </div>
  );
};
