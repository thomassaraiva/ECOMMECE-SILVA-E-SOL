import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const SearchModal: React.FC = () => {
  const { searchModalOpen, setSearchModalOpen, products, navigateToProduct } = useStore();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter(p => p.isActive)
      .filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.colors.some(c => c.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [query, products]);

  if (!searchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs p-4 flex items-start justify-center pt-16 sm:pt-24">
      <div className="bg-[#FAF7F2] border border-[#E6DDD0] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-[#2D2823] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Campo de Busca Superior */}
        <div className="relative border-b border-[#E6DDD0] p-4 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#2A8882]" />
          <input
            type="text"
            id="search-input-modal"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por sungas, camisetas, shorts, cores..."
            className="w-full bg-transparent text-[#2D2823] placeholder-[#8A8072] focus:outline-none text-base sm:text-lg"
            autoFocus
          />
          <button
            onClick={() => {
              setSearchModalOpen(false);
              setQuery('');
            }}
            className="p-1 text-[#736A5E] hover:text-[#2D2823] rounded-lg hover:bg-[#F5EFE6]"
            aria-label="Fechar busca"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sugestões Rápidas */}
        {!query.trim() && (
          <div className="p-5 text-xs text-[#736A5E]">
            <p className="font-semibold text-[#2D2823] uppercase tracking-wider mb-2.5">
              Buscas Populares
            </p>
            <div className="flex flex-wrap gap-2">
              {['Sunga Tradicional', 'Sunga Slim', 'Camiseta', 'Short Linho', 'Regata Canelada', 'Verde Costeiro'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-[#E8F4F3] text-[#524B42] hover:text-[#2A8882] border border-[#E6DDD0] hover:border-[#2A8882]/40 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Tag className="w-3 h-3 text-[#F4803E]" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados Encontrados */}
        {query.trim() && (
          <div className="max-h-96 overflow-y-auto p-3 divide-y divide-[#E6DDD0]/60">
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-[#736A5E]">
                <p className="text-sm font-medium text-[#2D2823]">Nenhuma peça encontrada para "{query}"</p>
                <p className="text-xs text-[#8A8072] mt-1">Tente buscar por outras palavras como "sunga", "short", "algodão".</p>
              </div>
            ) : (
              searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    navigateToProduct(product);
                    setSearchModalOpen(false);
                    setQuery('');
                  }}
                  className="p-3 flex items-center gap-3.5 hover:bg-white rounded-xl cursor-pointer transition-colors group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded-lg bg-white border border-[#E8DEC8]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#2D2823] group-hover:text-[#2A8882] transition-colors truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-[#736A5E] truncate mt-0.5">
                      {product.description}
                    </p>
                    <span className="text-xs font-bold text-[#2A8882] mt-0.5 inline-block">
                      R$ {(product.promotionalPrice || product.price).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8072] group-hover:text-[#2A8882] group-hover:translate-x-1 transition-all" />
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
