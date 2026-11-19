import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ChevronRight, 
  ChevronDown, 
  Grid, 
  ShoppingBag, 
  Search, 
  Home, 
  MessageCircle, 
  Info, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useStore, defaultFilters } from '../../context/StoreContext';
import { useWishlist } from '../../context/WishlistContext';
import { Logo } from './Logo';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    categories, 
    subcategories, 
    products, 
    setCurrentPage, 
    navigateToCategory, 
    setFilters, 
    setSearchModalOpen,
    settings 
  } = useStore();
  const { totalWishlistItems, setIsWishlistOpen } = useWishlist();

  // Estado dos acordeões de categorias abertas
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'cat-sungas': true, // primeira categoria aberta por padrão
  });

  if (!isOpen) return null;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleSelectCategory = (categoryId: string) => {
    navigateToCategory(categoryId);
    onClose();
  };

  const handleSelectSubcategory = (categoryId: string, subcategoryId: string) => {
    setFilters({ ...defaultFilters, categoryId, subcategoryId });
    setCurrentPage('catalog');
    onClose();
  };

  const handleViewAllCatalog = () => {
    setFilters(defaultFilters);
    setCurrentPage('catalog');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop transparente/escurecido suave */}
      <div 
        className="fixed inset-0 bg-stone-900/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-sm sm:max-w-md bg-[#FAF7F2] text-[#2D2823] shadow-2xl flex flex-col border-r border-[#E6DDD0]">
          
          {/* Topo do Drawer com Logo Oficial e Botão Fechar */}
          <div className="p-4 sm:p-5 border-b border-[#E6DDD0] flex items-center justify-between bg-[#F4EFE6]">
            <button
              onClick={() => {
                setCurrentPage('home');
                onClose();
              }}
              className="text-left focus:outline-none"
              aria-label="Ir para a página inicial"
            >
              <Logo size="md" variant="horizontal" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#736A5E] hover:text-[#2D2823] rounded-full hover:bg-[#EBE4D8] transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Campo de Busca Rápida no Menu */}
          <div className="p-3.5 bg-[#FAF7F2] border-b border-[#E6DDD0]/70">
            <button
              onClick={() => {
                onClose();
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-[#E0D5C3] text-left text-xs text-[#82786A] hover:border-[#2A8882] shadow-2xs transition-colors"
            >
              <Search className="w-4 h-4 text-[#2A8882]" />
              <span>O que você está procurando hoje?</span>
            </button>
          </div>

          {/* Conteúdo com Rolagem */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            
            {/* 1. SEÇÃO PRINCIPAL: LISTA DE DESEJOS & INÍCIO */}
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setCurrentPage('home');
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#2D2823] hover:bg-[#F3EDE3] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F4F3] flex items-center justify-center text-[#2A8882]">
                    <Home className="w-4 h-4" />
                  </div>
                  <span>Página Inicial</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89D8D]" />
              </button>

              {/* LISTA DE DESEJOS SOLICITADA */}
              <button
                id="btn-drawer-wishlist"
                onClick={() => {
                  onClose();
                  setIsWishlistOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#2D2823] bg-white border border-[#E8DEC8] hover:border-[#F4803E] shadow-2xs transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF2EA] flex items-center justify-center text-[#F4803E] group-hover:scale-110 transition-transform">
                    <Heart className="w-4 h-4 fill-[#F4803E]" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-[#2D2823]">
                      Lista de Desejos
                    </span>
                    <span className="text-[11px] text-[#736A5E]">
                      Seus produtos favoritos salvos
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F4803E] text-white shadow-2xs">
                    {totalWishlistItems}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#A89D8D]" />
                </div>
              </button>
            </div>

            {/* 2. SEÇÃO CATÁLOGO E SUBCATEGORIAS */}
            <div className="pt-2">
              <div className="flex items-center justify-between px-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#2A8882]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2A8882]">
                    Catálogo de Produtos
                  </span>
                </div>
                <button
                  onClick={handleViewAllCatalog}
                  className="text-xs font-medium text-[#F4803E] hover:underline"
                >
                  Ver todos ({products.length})
                </button>
              </div>

              {/* Lista de Categorias com Acordeão de Subcategorias */}
              <div className="space-y-2">
                {categories.map((cat) => {
                  const catSubcategories = subcategories.filter(sub => sub.categoryId === cat.id && sub.isActive);
                  const isExpanded = !!expandedCategories[cat.id];
                  const catProductsCount = products.filter(p => p.categoryId === cat.id).length;

                  return (
                    <div 
                      key={cat.id} 
                      className="bg-white rounded-xl border border-[#E8DEC8] overflow-hidden shadow-2xs transition-all hover:border-[#2A8882]/40"
                    >
                      {/* Linha da Categoria Principal */}
                      <div className="flex items-center justify-between p-3">
                        <button
                          onClick={() => handleSelectCategory(cat.id)}
                          className="flex-1 text-left flex items-center gap-2.5 font-heading font-semibold text-sm text-[#2D2823] hover:text-[#2A8882] transition-colors"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#2A8882]" />
                          <span>{cat.name}</span>
                          <span className="text-[11px] font-normal text-[#8A8072]">
                            ({catProductsCount})
                          </span>
                        </button>

                        {/* Botão de Expandir Subcategorias */}
                        {catSubcategories.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(cat.id);
                            }}
                            className="p-1.5 text-[#736A5E] hover:text-[#2A8882] rounded-md hover:bg-[#F4EFE6] transition-colors"
                            aria-label={`Ver subcategorias de ${cat.name}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#2A8882]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#8A8072]" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Lista de Subcategorias (se existirem e estiver expandida) */}
                      {isExpanded && catSubcategories.length > 0 && (
                        <div className="bg-[#FAF7F2] border-t border-[#EDE4D6] px-3.5 py-2.5 space-y-1.5">
                          <button
                            onClick={() => handleSelectCategory(cat.id)}
                            className="w-full text-left py-1 text-xs font-medium text-[#2A8882] hover:underline flex items-center gap-1.5"
                          >
                            <span className="text-[10px]">↳</span>
                            <span>Ver todas as {cat.name}</span>
                          </button>

                          {catSubcategories.map((sub) => {
                            const subCount = products.filter(
                              p => p.categoryId === cat.id && p.subcategoryId === sub.id
                            ).length;

                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSelectSubcategory(cat.id, sub.id)}
                                className="w-full text-left py-1.5 px-2 rounded-md text-xs text-[#524B42] hover:text-[#2D2823] hover:bg-[#EFE7DA] flex items-center justify-between transition-colors"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D5C9B5]" />
                                  <span>{sub.name}</span>
                                </span>
                                <span className="text-[10px] text-[#8A8072]">
                                  {subCount}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botão de Destaque para Promoções */}
              <button
                onClick={() => {
                  setFilters({ ...defaultFilters, onlyPromotions: true });
                  setCurrentPage('catalog');
                  onClose();
                }}
                className="w-full mt-3 p-3 rounded-xl bg-gradient-to-r from-[#FEF2EA] to-[#FCE6D6] border border-[#FCD5BC] flex items-center justify-between text-left hover:border-[#F4803E] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🔥</span>
                  <div>
                    <span className="block text-xs font-bold text-[#DE6B22]">
                      Ofertas & Liquidação Solar
                    </span>
                    <span className="text-[10px] text-[#7A6B5D]">
                      Peças com descontos especiais
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#F4803E]" />
              </button>
            </div>

            {/* 3. ATENDIMENTO E INSTITUCIONAL */}
            <div className="pt-2 border-t border-[#E6DDD0] space-y-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8072] px-1 mb-1">
                Atendimento & Loja
              </span>

              <button
                onClick={() => {
                  setCurrentPage('about');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#524B42] hover:text-[#2D2823] hover:bg-[#F3EDE3] transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-[#2A8882]" />
                <span>A Marca Silva e Sol</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('contact');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#524B42] hover:text-[#2D2823] hover:bg-[#F3EDE3] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#2A8882]" />
                <span>Fale Conosco / WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('policies');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#524B42] hover:text-[#2D2823] hover:bg-[#F3EDE3] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#2A8882]" />
                <span>Políticas de Trocas & Envio</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('admin-login');
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 bg-[#E8F4F3] hover:bg-[#D9ECEB] border border-[#2A8882]/30 transition-colors"
              >
                <div className="flex items-center gap-2 text-[#2A8882]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Painel Administrativo (Lojista)</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#2A8882] text-white">
                  Acessar
                </span>
              </button>
            </div>

          </div>

          {/* Rodapé do Menu com WhatsApp de Suporte Rápido */}
          <div className="p-4 bg-[#F4EFE6] border-t border-[#E6DDD0]">
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Olá, equipe Silva e Sol! Gostaria de tirar uma dúvida sobre a loja.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white flex items-center justify-center gap-2 text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Dúvidas? Chame no WhatsApp</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
