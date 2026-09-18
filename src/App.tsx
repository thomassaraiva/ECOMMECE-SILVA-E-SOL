import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { WhatsAppFloat } from './components/common/WhatsAppFloat';
import { SearchModal } from './components/common/SearchModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './components/product/ProductPage';
import { AboutPage } from './components/institutional/AboutPage';
import { ContactPage } from './components/institutional/ContactPage';
import { PoliciesPage } from './components/institutional/PoliciesPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { currentPage, selectedProduct } = useStore();
  const { isAuthenticated } = useAuth();

  const isAdminPanel = currentPage === 'admin-panel' && isAuthenticated;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2823] flex flex-col selection:bg-[#F4803E] selection:text-white antialiased">
      {/* Header padrão apenas se não estiver no dashboard admin com tela cheia */}
      {!isAdminPanel && <Header />}

      {/* Conteúdo Principal com Troca de Telas */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'catalog' && <CatalogPage />}
        {currentPage === 'product' && (
          selectedProduct ? <ProductPage product={selectedProduct} /> : <CatalogPage />
        )}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'policies' && <PoliciesPage />}
        {currentPage === 'admin-login' && <AdminLogin />}
        {currentPage === 'admin-panel' && (
          isAuthenticated ? <AdminDashboard /> : <AdminLogin />
        )}
      </main>

      {/* Rodapé institucional */}
      {!isAdminPanel && <Footer />}

      {/* Gavetas e Modais Globais */}
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      {!isAdminPanel && <WhatsAppFloat />}
      {!isAdminPanel && <MobileNav />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
