import React, { useState } from 'react';
import { ShoppingBag, Menu, Sun, Shield } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { Logo } from './Logo';
import { NavigationDrawer } from './NavigationDrawer';

export const Header: React.FC = () => {
  const { setCurrentPage } = useStore();
  const { totalItems, setIsCartOpen } = useCart();
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2] text-[#2D2823] border-b border-[#E6DDD0] shadow-xs">
        {/* Barra de Aviso Superior / Estética Solar Leve */}
        <div className="bg-[#F5EFE6] text-[#6E6456] text-[11px] font-medium py-1 px-4 border-b border-[#EDE4D6]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center justify-center gap-2">
              <Sun className="w-3.5 h-3.5 text-[#F4803E] animate-pulse" />
              <span className="truncate">
                Atendimento humano pelo WhatsApp
              </span>
            </div>
            <button
              onClick={() => setCurrentPage('admin-login')}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#2A8882] hover:text-[#22706A] font-semibold hover:underline cursor-pointer shrink-0"
              title="Acessar Painel Administrativo do Lojista"
            >
              <Shield className="w-3 h-3" />
              <span>Painel Lojista</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação: Esquerda (Menu + Logo) e Direita (SOMENTE Carrinho) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* LADO ESQUERDO: Botão de Menu (Click) ANTES da Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Botão de Menu que abre Catálogo, Subcategorias e Lista de Desejos */}
              <button
                type="button"
                id="btn-menu-drawer-toggle"
                onClick={() => setNavDrawerOpen(true)}
                className="flex items-center gap-1.5 p-2 -ml-1.5 text-[#2A8882] hover:text-[#22706A] hover:bg-[#EFE7DC] rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#2A8882]/30 group"
                aria-label="Abrir Menu com Catálogo, Subcategorias e Lista de Desejos"
                title="Abrir Catálogo e Lista de Desejos"
              >
                <div className="w-9 h-9 rounded-lg bg-[#E8F4F3] group-hover:bg-[#D9ECEB] flex items-center justify-center transition-colors">
                  <Menu className="w-5 h-5 text-[#2A8882]" />
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-[#2A8882]">
                  Menu
                </span>
              </button>

              {/* Logo Oficial Silva e Sol com Símbolo, Sol Laranja e Ondas */}
              <button
                onClick={() => setCurrentPage('home')}
                className="group flex items-center py-1 focus:outline-none transition-transform active:scale-98"
                aria-label="Página Inicial Silva e Sol"
              >
                <Logo variant="horizontal" size="md" />
              </button>
            </div>

            {/* LADO DIREITO: SOMENTE O CARRINHO */}
            <div className="flex items-center">
              <button
                id="btn-open-cart"
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-[#2D2823] hover:text-[#2A8882] rounded-xl hover:bg-[#EFE7DC] transition-all focus:outline-none group"
                aria-label={`Carrinho com ${totalItems} itens`}
                title="Abrir Carrinho de Compras"
              >
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#E0D5C3] group-hover:border-[#2A8882] flex items-center justify-center shadow-2xs transition-colors">
                    <ShoppingBag className="w-5 h-5 text-[#2A8882] group-hover:scale-105 transition-transform" />
                  </div>
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#F4803E] text-white font-bold text-[10.5px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                      {totalItems}
                    </span>
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#7A7163]">
                    Sacola
                  </span>
                  <span className="text-xs font-bold text-[#2D2823]">
                    {totalItems === 1 ? '1 item' : `${totalItems} itens`}
                  </span>
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Gaveta de Navegação Lateral (Catálogo, Subcategorias, Lista de Desejos) */}
      <NavigationDrawer
        isOpen={navDrawerOpen}
        onClose={() => setNavDrawerOpen(false)}
      />
    </>
  );
};
