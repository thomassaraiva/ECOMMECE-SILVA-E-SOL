import React, { useState } from 'react';
import { Filter, X, ArrowDownUp, Check, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CatalogFilters as FiltersType } from '../../types/ecommerce';

interface CatalogFiltersProps {
  totalResults: number;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({ totalResults }) => {
  const { categories, subcategories, filters, setFilters, resetFilters } = useStore();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const availableSizes = ['P', 'M', 'G', 'GG'];
  const availableColors = ['Verde Musgo', 'Amarelo Ocre', 'Preto Ébano', 'Azul Mar', 'Areia Crua', 'Terracota'];

  const handleCategoryChange = (catId?: string) => {
    setFilters(prev => ({
      ...prev,
      categoryId: catId,
      subcategoryId: undefined
    }));
  };

  const currentSubcategories = subcategories.filter(s => 
    !filters.categoryId || s.categoryId === filters.categoryId
  );

  return (
    <div className="space-y-4 mb-6">
      {/* Barra de Ações Rápidas (Pills de Categoria + Botão de Filtro Mobile + Ordenação) */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        
        {/* Carrossel Horizontal de Categorias (Touch Friendly) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              !filters.categoryId
                ? 'bg-[#2A8882] text-white shadow-2xs'
                : 'bg-white text-[#524B42] hover:bg-[#F5EFE6] border border-[#E6DDD0]'
            }`}
          >
            Todos os Produtos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id === filters.categoryId ? undefined : cat.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                filters.categoryId === cat.id
                  ? 'bg-[#2A8882] text-white font-bold shadow-2xs'
                  : 'bg-white text-[#524B42] hover:bg-[#F5EFE6] border border-[#E6DDD0]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Controles de Filtros Avançados e Ordenação */}
        <div className="flex items-center gap-2">
          {/* Botão de Abrir Drawer de Filtros */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F5EFE6] text-[#2D2823] text-xs font-medium rounded-xl border border-[#E6DDD0] transition-colors shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-[#2A8882]" />
            <span>Filtrar</span>
            {(filters.selectedSize || filters.selectedColor || filters.onlyPromotions || filters.subcategoryId) && (
              <span className="w-2 h-2 rounded-full bg-[#F4803E]" />
            )}
          </button>

          {/* Ordenação */}
          <div className="relative flex items-center">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FiltersType['sortBy'] }))}
              className="appearance-none bg-white hover:bg-[#F5EFE6] border border-[#E6DDD0] text-xs text-[#2D2823] font-medium rounded-xl py-2 pl-3 pr-8 focus:outline-none focus:border-[#2A8882] cursor-pointer shadow-2xs"
            >
              <option value="featured">Destaques</option>
              <option value="newest">Lançamentos</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
            </select>
            <ArrowDownUp className="w-3.5 h-3.5 text-[#736A5E] absolute right-2.5 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Subcategorias Ativas quando uma categoria está selecionada */}
      {filters.categoryId && currentSubcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#736A5E] font-medium text-[11px] uppercase tracking-wider shrink-0">
            Subcategoria:
          </span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, subcategoryId: undefined }))}
            className={`px-3 py-1 rounded-lg border text-xs transition-colors shrink-0 ${
              !filters.subcategoryId
                ? 'bg-[#E8F4F3] border-[#2A8882] text-[#2A8882] font-semibold'
                : 'bg-white border-[#E6DDD0] text-[#736A5E] hover:border-[#2A8882]/40'
            }`}
          >
            Todas
          </button>
          {currentSubcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setFilters(prev => ({
                ...prev,
                subcategoryId: prev.subcategoryId === sub.id ? undefined : sub.id
              }))}
              className={`px-3 py-1 rounded-lg border text-xs transition-colors shrink-0 ${
                filters.subcategoryId === sub.id
                  ? 'bg-[#E8F4F3] border-[#2A8882] text-[#2A8882] font-semibold'
                  : 'bg-white border-[#E6DDD0] text-[#736A5E] hover:border-[#2A8882]/40'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Drawer Lateral / Modal de Filtros Avançados */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative w-full max-w-sm bg-[#FAF7F2] border-l border-[#E6DDD0] h-full overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              {/* Topo do Drawer */}
              <div className="p-4 border-b border-[#E6DDD0] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#2A8882]" />
                  <h3 className="font-heading font-bold text-sm text-[#2D2823]">Filtrar Produtos</h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-[#736A5E] hover:text-[#2D2823] hover:bg-[#F5EFE6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo de Opções de Filtro */}
              <div className="p-4 space-y-6">
                
                {/* 1. Somente Promoções */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E8DEC8]">
                  <div>
                    <p className="text-xs font-bold text-[#2D2823]">Apenas Peças em Promoção</p>
                    <p className="text-[11px] text-[#736A5E]">Exibir apenas descontos ativos</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!filters.onlyPromotions}
                    onChange={(e) => setFilters(prev => ({ ...prev, onlyPromotions: e.target.checked }))}
                    className="w-4 h-4 accent-[#2A8882] rounded"
                  />
                </div>

                {/* 2. Filtro de Tamanho */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#2D2823] mb-2.5">
                    Tamanho
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          selectedSize: prev.selectedSize === size ? undefined : size
                        }))}
                        className={`h-10 rounded-xl text-xs font-bold border transition-all ${
                          filters.selectedSize === size
                            ? 'border-[#2A8882] bg-[#2A8882] text-white shadow-2xs'
                            : 'border-[#E6DDD0] bg-white text-[#524B42] hover:border-[#2A8882]/40'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Filtro de Cores */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#2D2823] mb-2.5">
                    Cores & Tonalidades
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          selectedColor: prev.selectedColor === color ? undefined : color
                        }))}
                        className={`px-3 py-1.5 rounded-xl text-xs border flex items-center gap-1.5 transition-all ${
                          filters.selectedColor === color
                            ? 'border-[#2A8882] bg-[#E8F4F3] text-[#2A8882] font-semibold'
                            : 'border-[#E6DDD0] bg-white text-[#524B42] hover:border-[#2A8882]/40'
                        }`}
                      >
                        <span>{color}</span>
                        {filters.selectedColor === color && <Check className="w-3.5 h-3.5 text-[#2A8882]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Categorias no Drawer */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#2D2823] mb-2.5">
                    Categorias
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleCategoryChange(undefined)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        !filters.categoryId
                          ? 'bg-[#E8F4F3] text-[#2A8882] font-bold'
                          : 'text-[#524B42] hover:bg-white'
                      }`}
                    >
                      Todas as Peças
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          filters.categoryId === cat.id
                            ? 'bg-[#E8F4F3] text-[#2A8882] font-bold'
                            : 'text-[#524B42] hover:bg-white'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Rodapé do Drawer */}
            <div className="p-4 border-t border-[#E6DDD0] bg-white flex items-center gap-3">
              <button
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="p-2.5 rounded-xl border border-[#E6DDD0] text-[#736A5E] hover:text-[#2D2823] text-xs font-medium flex items-center justify-center gap-1"
                title="Limpar todos os filtros"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Limpar</span>
              </button>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs shadow-2xs transition-colors"
              >
                Ver {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
