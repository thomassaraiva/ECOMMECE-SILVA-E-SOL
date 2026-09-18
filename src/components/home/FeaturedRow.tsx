import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { ProductCard } from '../catalog/ProductCard';
import { useStore } from '../../context/StoreContext';

interface FeaturedRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  categorySlug?: string;
  tag?: string;
}

export const FeaturedRow: React.FC<FeaturedRowProps> = ({
  title,
  subtitle,
  products,
  categorySlug,
  tag
}) => {
  const { setCurrentPage, navigateToCategory } = useStore();

  if (products.length === 0) return null;

  const handleViewAll = () => {
    if (categorySlug) {
      navigateToCategory(categorySlug);
    } else {
      setCurrentPage('catalog');
    }
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="flex items-end justify-between mb-8">
          <div>
            {tag && (
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#F4803E] font-bold mb-1">
                <Sparkles className="w-3 h-3" />
                {tag}
              </span>
            )}
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2D2823] tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#736A5E] mt-1 max-w-lg">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={handleViewAll}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#2A8882] hover:text-[#22706A] transition-colors group"
          >
            <span>Ver Coleção Completa</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grade de Produtos Responsiva */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Botão Ver Todos no Mobile */}
        <div className="mt-8 text-center sm:hidden">
          <button
            onClick={handleViewAll}
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#E0D5C3] text-xs font-bold text-[#2A8882] active:bg-[#E8F4F3] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>Ver Todos os Modelos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
