import React from 'react';
import { useStore } from '../context/StoreContext';
import { CatalogFilters } from '../components/catalog/CatalogFilters';
import { ProductCard } from '../components/catalog/ProductCard';
import { PackageOpen, Sparkles } from 'lucide-react';
import { StoreStatus } from '../components/common/StoreStatus';

export const CatalogPage: React.FC = () => {
  const { filteredProducts, filters, categories, products, isLoading, loadError, reload, settings } = useStore();
  
  const currentCategory = categories.find(c => c.id === filters.categoryId);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2823] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho do Catálogo */}
        <div className="mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#2A8882] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coleção Silva e Sol</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#2D2823] tracking-tight">
            {currentCategory ? currentCategory.name : 'Catálogo Completo'}
          </h1>
          <p className="text-xs sm:text-sm text-[#736A5E] max-w-xl">
            Peças desenvolvidas com tecidos nobres, modelagens confortáveis e a vibração autêntica do sol brasileiro.
          </p>
        </div>

        {/* Filtros e Ordenação Dinâmica */}
        <CatalogFilters totalResults={filteredProducts.length} />

        {/* Grade de Produtos */}
        {isLoading || loadError || products.length === 0 ? (
          <StoreStatus
            isLoading={isLoading}
            loadError={loadError}
            hasProducts={products.length > 0}
            whatsappNumber={settings.whatsappNumber}
            onRetry={reload}
          />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-[#E8DEC8] shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#F5EFE6] text-[#736A5E] flex items-center justify-center mx-auto border border-[#E6DDD0]">
              <PackageOpen className="w-8 h-8 text-[#2A8882]" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#2D2823]">
              Nenhuma peça encontrada
            </h3>
            <p className="text-xs text-[#736A5E] max-w-sm mx-auto">
              Não encontramos nenhum produto com os filtros selecionados. Tente limpar os filtros para ver todos os itens disponíveis.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
