import React from 'react';
import { 
  Package, 
  Layers, 
  Image as ImageIcon, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  TrendingUp, 
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/ecommerce';

interface AdminOverviewTabProps {
  onOpenNewProduct: () => void;
  onNavigateTab: (tab: any) => void;
  onEditProduct: (product: Product) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  onOpenNewProduct,
  onNavigateTab,
  onEditProduct
}) => {
  const { products, categories, banners, orders, setCurrentPage, updateProduct } = useStore();

  // Métricas
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const inactiveProducts = totalProducts - activeProducts;
  const promoProducts = products.filter(p => p.isOnSale).length;
  
  // Produtos com estoque baixo (<= 5) ou zerado
  const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5);
  const outOfStockProducts = products.filter(p => p.stockQuantity <= 0);
  const criticalStockCount = lowStockProducts.length + outOfStockProducts.length;

  const activeBanners = banners.filter(b => b.isActive).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending_whatsapp').length;

  const handleQuickAddStock = async (product: Product, amount: number) => {
    const newQty = Math.max(0, product.stockQuantity + amount);
    await updateProduct(product.id, { stockQuantity: newQty });
  };

  return (
    <div className="space-y-8">
      {/* Saudação e Contexto Rápido */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A8882]/20 border border-[#2A8882]/30 text-[#2A8882] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Painel de Controle Oficial &bull; Silva e Sol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Visão Geral do E-commerce
            </h2>
            <p className="text-sm text-stone-400 mt-1 max-w-xl">
              Gerencie todo o catálogo de moda masculina praia e solar, estoque em tempo real, vitrines e pedidos sem encostar em código.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewProduct}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Produto</span>
            </button>

            <button
              onClick={() => setCurrentPage('home')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Ver Loja ao Vivo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Estatísticas Principais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Produtos */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Produtos</span>
            <Package className="w-4 h-4 text-[#2A8882] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalProducts}</div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{activeProducts} ativos</span>
            <span>&bull;</span>
            <span className="text-stone-500">{inactiveProducts} off</span>
          </div>
        </div>

        {/* Promoções */}
        <div 
          onClick={() => onNavigateTab('promotions')}
          className="bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Em Oferta</span>
            <Tag className="w-4 h-4 text-[#F4803E] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#F4803E]">{promoProducts}</div>
          <div className="text-[11px] text-stone-400 mt-1">
            com preço promocional
          </div>
        </div>

        {/* Estoque Crítico */}
        <div 
          onClick={() => onNavigateTab('stock')}
          className="bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Estoque Baixo</span>
            <AlertTriangle className={`w-4 h-4 ${criticalStockCount > 0 ? 'text-red-400 animate-pulse' : 'text-stone-500'} group-hover:scale-110 transition-transform`} />
          </div>
          <div className={`text-2xl font-extrabold ${criticalStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {criticalStockCount}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            {outOfStockProducts.length} esgotado(s)
          </div>
        </div>

        {/* Categorias */}
        <div 
          onClick={() => onNavigateTab('categories')}
          className="bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Categorias</span>
            <Layers className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white">{categories.length}</div>
          <div className="text-[11px] text-stone-400 mt-1">
            coleções ativas
          </div>
        </div>

        {/* Banners */}
        <div 
          onClick={() => onNavigateTab('banners')}
          className="bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Banners</span>
            <ImageIcon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white">{activeBanners}</div>
          <div className="text-[11px] text-stone-400 mt-1">
            em rotação na home
          </div>
        </div>

        {/* Pedidos */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pedidos</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalOrders}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">
            {pendingOrders} via WhatsApp
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos de Ação */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
          Atalhos Operacionais Frequentes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-[#2A8882]/50 hover:bg-stone-900 transition-all text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2A8882]/15 text-[#2A8882] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#2A8882] transition-colors">Novo Produto</div>
              <div className="text-[11px] text-stone-500">Adicionar ao catálogo</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('banners')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-400/50 hover:bg-stone-900 transition-all text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Gerenciar Banners</div>
              <div className="text-[11px] text-stone-500">Atualizar carrossel</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('promotions')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-[#F4803E]/50 hover:bg-stone-900 transition-all text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F4803E]/15 text-[#F4803E] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F4803E] transition-colors">Ajustar Ofertas</div>
              <div className="text-[11px] text-stone-500">Descontos e datas</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-emerald-400/50 hover:bg-stone-900 transition-all text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-400/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Configurações</div>
              <div className="text-[11px] text-stone-500">WhatsApp e políticas</div>
            </div>
          </button>
        </div>
      </div>

      {/* Alerta de Estoque Crítico / Ações Imediatas */}
      {criticalStockCount > 0 && (
        <div className="bg-stone-900/90 border border-red-900/40 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                Itens com Estoque Baixo ou Esgotados ({criticalStockCount})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('stock')}
              className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              Ver controle completo &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...outOfStockProducts, ...lowStockProducts].slice(0, 6).map(prod => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-950 border border-stone-800 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-10 h-10 rounded-xl object-cover border border-stone-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{prod.name}</p>
                    <p className={`text-[11px] ${prod.stockQuantity <= 0 ? 'text-red-400 font-bold' : 'text-amber-400 font-medium'}`}>
                      {prod.stockQuantity <= 0 ? 'ESGOTADO (0 un.)' : `Apenas ${prod.stockQuantity} un.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => handleQuickAddStock(prod, 5)}
                    className="px-2 py-1 bg-stone-800 hover:bg-[#2A8882] hover:text-white text-stone-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    title="Adicionar 5 unidades"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => onEditProduct(prod)}
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
