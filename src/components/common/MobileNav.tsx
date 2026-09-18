import React from 'react';
import { Home, Compass, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const MobileNav: React.FC = () => {
  const { currentPage, setCurrentPage } = useStore();
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist, setIsWishlistOpen } = useWishlist();

  const isHome = currentPage === 'home';
  const isCatalog = currentPage === 'catalog';

  return (
    <nav 
      id="bottom-mobile-nav" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E6DDD0] px-3 py-1.5 flex items-center justify-around shadow-lg safe-area-inset-bottom"
    >
      {/* 1. Início */}
      <button
        onClick={() => {
          setCurrentPage('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${
          isHome ? 'text-[#2A8882] font-semibold' : 'text-[#736A5E] hover:text-[#2D2823]'
        }`}
        aria-label="Início"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Início</span>
      </button>

      {/* 2. Catálogo */}
      <button
        onClick={() => {
          setCurrentPage('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${
          isCatalog ? 'text-[#2A8882] font-semibold' : 'text-[#736A5E] hover:text-[#2D2823]'
        }`}
        aria-label="Catálogo"
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Catálogo</span>
      </button>

      {/* 3. Lista de Desejos */}
      <button
        onClick={() => setIsWishlistOpen(true)}
        className="relative flex flex-col items-center justify-center w-14 h-12 rounded-lg text-[#736A5E] hover:text-[#F4803E] transition-colors"
        aria-label="Lista de Desejos"
      >
        <Heart className="w-5 h-5" />
        {totalWishlist > 0 && (
          <span className="absolute top-1 right-2 bg-[#F4803E] text-white font-bold text-[9.5px] w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
            {totalWishlist}
          </span>
        )}
        <span className="text-[10px] mt-0.5">Desejos</span>
      </button>

      {/* 4. Carrinho */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center w-14 h-12 rounded-lg text-[#736A5E] hover:text-[#2A8882] transition-colors"
        aria-label="Carrinho"
      >
        <ShoppingBag className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute top-1 right-2 bg-[#2A8882] text-white font-bold text-[9.5px] w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
            {totalItems}
          </span>
        )}
        <span className="text-[10px] mt-0.5">Sacola</span>
      </button>
    </nav>
  );
};
