import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  Image as ImageIcon,
  Tag,
  Settings,
  ShoppingBag,
  LogOut,
  ExternalLink,
  BarChart3,
  Archive,
  Info,
  Menu,
  X,
  Sun,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/ecommerce';

import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminStockTab } from './AdminStockTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminBannersTab } from './AdminBannersTab';
import { AdminPromotionsTab } from './AdminPromotionsTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminAboutUsTab } from './AdminAboutUsTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminPixelsTab } from './AdminPixelsTab';
import { AdminProductModal } from './AdminProductModal';

export type AdminTab = 
  | 'overview' 
  | 'products' 
  | 'stock' 
  | 'categories' 
  | 'banners' 
  | 'promotions' 
  | 'orders' 
  | 'pixels'
  | 'about' 
  | 'settings';

export const AdminDashboard: React.FC = () => {
  const { adminUser, logout } = useAuth();
  const { setCurrentPage, products, orders, adminError, clearAdminError, loadOrders, clearAdminData } = useStore();

  // Carrega os pedidos ao abrir o painel para os contadores e a Visão Geral; o erro já aparece na faixa global.
  useEffect(() => { loadOrders().catch(() => {}); }, []);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados do modal de produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleOpenNewProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  // Contadores para badges no menu
  const lowStockCount = products.filter(p => p.stockQuantity <= 5).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending_whatsapp').length;
  const promoCount = products.filter(p => p.isOnSale).length;

  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'products', label: 'Produtos & Catálogo', icon: <Package className="w-4 h-4" />, badge: products.length },
    { id: 'stock', label: 'Estoque & Depósito', icon: <Archive className="w-4 h-4" />, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-900 text-amber-300' },
    { id: 'categories', label: 'Categorias & Subcat', icon: <Layers className="w-4 h-4" /> },
    { id: 'banners', label: 'Banners da Home', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'promotions', label: 'Promoções & Ofertas', icon: <Tag className="w-4 h-4" />, badge: promoCount > 0 ? promoCount : undefined, badgeColor: 'bg-[#F4803E]/20 text-[#F4803E]' },
    { id: 'orders', label: 'Pedidos WhatsApp', icon: <ShoppingBag className="w-4 h-4" />, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-emerald-900 text-emerald-300' },
    { id: 'pixels', label: 'Pixels & Tráfego', icon: <Target className="w-4 h-4 text-[#F4803E]" /> },
    { id: 'about', label: 'Sobre a Marca', icon: <Info className="w-4 h-4" /> },
    { id: 'settings', label: 'Configurações Loja', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#11100F] text-stone-100 flex flex-col font-sans">
      
      {/* Topo Superior Fixo */}
      <header className="sticky top-0 z-40 bg-[#161514] border-b border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-stone-900 text-stone-300 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2A8882] text-white flex items-center justify-center font-bold shadow-md">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
                SILVA E SOL
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-400 text-stone-950">
                  ADMIN
                </span>
              </span>
              <p className="text-[10px] text-stone-400 -mt-0.5">
                Painel Comercial &bull; WhatsApp 5581920019982
              </p>
            </div>
          </div>
        </div>

        {/* Lado Direito do Topo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Loja ao Vivo</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-stone-300 font-medium">Logado como:</span>
            <span className="font-bold text-white">{adminUser?.email}</span>
          </div>

          <button
            onClick={async () => { await logout(); clearAdminData(); setCurrentPage('home'); }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 hover:text-red-100 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Sair do painel administrativo"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Encerrar Sessão</span>
          </button>
        </div>
      </header>

      {adminError && (
        <div role="alert" className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl flex items-start justify-between gap-3 rounded-xl border border-red-700 bg-red-950 px-4 py-3 text-sm text-red-100 shadow-2xl">
          <span>{adminError}</span>
          <button type="button" onClick={clearAdminError} className="font-semibold underline">Fechar</button>
        </div>
      )}

      {/* Conteúdo Principal com Barra Lateral */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Barra Lateral / Sidebar */}
        <aside className={`
          ${mobileMenuOpen ? 'block' : 'hidden'} md:block 
          w-full md:w-64 lg:w-72 bg-[#161514] border-r border-stone-800 p-4 space-y-1 shrink-0
        `}>
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-3 py-2">
            Módulos de Gestão
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2A8882] text-white shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-stone-800 text-stone-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Atalho Loja Mobile */}
          <div className="pt-4 mt-4 border-t border-stone-800/80 sm:hidden">
            <button
              onClick={() => setCurrentPage('home')}
              className="w-full py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Ver Loja ao Vivo</span>
            </button>
          </div>
        </aside>

        {/* Área Central de Trabalho */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              onOpenNewProduct={handleOpenNewProduct}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onEditProduct={handleEditProduct}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              onOpenNewProduct={handleOpenNewProduct}
              onEditProduct={handleEditProduct}
            />
          )}

          {activeTab === 'stock' && (
            <AdminStockTab />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesTab />
          )}

          {activeTab === 'banners' && (
            <AdminBannersTab />
          )}

          {activeTab === 'promotions' && (
            <AdminPromotionsTab />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersTab />
          )}

          {activeTab === 'pixels' && (
            <AdminPixelsTab />
          )}

          {activeTab === 'about' && (
            <AdminAboutUsTab />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab />
          )}
        </main>
      </div>

      {/* Modal de Cadastro e Edição de Produto */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

    </div>
  );
};
