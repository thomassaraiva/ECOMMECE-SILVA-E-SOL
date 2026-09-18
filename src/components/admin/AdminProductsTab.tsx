import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Copy, 
  Trash2, 
  Check, 
  X, 
  Percent, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/ecommerce';

interface AdminProductsTabProps {
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  onOpenNewProduct,
  onEditProduct
}) => {
  const { 
    products, 
    categories, 
    duplicateProduct, 
    toggleProductStatus, 
    deleteProduct,
    navigateToProduct
  } = useStore();

  // Estados de Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [promoFilter, setPromoFilter] = useState<'all' | 'promo' | 'regular'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Estado para Modal de Confirmação de Exclusão
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const triggerSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Filtragem
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku?.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesDesc) return false;
      }

      // Categoria
      if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
        return false;
      }

      // Status
      if (statusFilter === 'active' && !product.isActive) return false;
      if (statusFilter === 'inactive' && product.isActive) return false;

      // Promoção
      if (promoFilter === 'promo' && !product.isOnSale) return false;
      if (promoFilter === 'regular' && product.isOnSale) return false;

      // Estoque
      if (stockFilter === 'out_of_stock' && product.stockQuantity > 0) return false;
      if (stockFilter === 'low_stock' && (product.stockQuantity <= 0 || product.stockQuantity > 5)) return false;
      if (stockFilter === 'in_stock' && product.stockQuantity <= 0) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, statusFilter, promoFilter, stockFilter]);

  const handleDuplicate = async (prod: Product) => {
    const duplicated = await duplicateProduct(prod.id);
    if (duplicated) {
      triggerSuccess(`Produto "${prod.name}" duplicado com sucesso!`);
    }
  };

  const handleToggleStatus = async (prod: Product) => {
    await toggleProductStatus(prod.id);
    triggerSuccess(`Status do produto alterado para ${!prod.isActive ? 'Ativo' : 'Inativo'}.`);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      triggerSuccess(`Produto "${productToDelete.name}" removido com sucesso.`);
      setProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Topo do Módulo de Produtos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
            Catálogo de Produtos ({filteredProducts.length} de {products.length})
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Crie, edite fotos, vídeos, variações de corte/tamanho e controle o estoque em tempo real.
          </p>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca Completa */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Busca Textual */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, SKU ou descrição..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs placeholder-stone-500 focus:outline-none focus:border-[#2A8882]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro de Categoria */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-[#2A8882]"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-[#2A8882]"
            >
              <option value="all">Status: Todos</option>
              <option value="active">Somente Ativos</option>
              <option value="inactive">Somente Inativos</option>
            </select>
          </div>

          {/* Filtro de Promoção & Estoque */}
          <div className="flex gap-2">
            <select
              value={promoFilter}
              onChange={(e) => setPromoFilter(e.target.value as any)}
              className="w-1/2 px-2.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-[#2A8882]"
            >
              <option value="all">Ofertas: Todas</option>
              <option value="promo">Em Oferta</option>
              <option value="regular">Preço Normal</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-1/2 px-2.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-[#2A8882]"
            >
              <option value="all">Estoque: Todos</option>
              <option value="in_stock">Em Estoque</option>
              <option value="low_stock">Baixo (1-5)</option>
              <option value="out_of_stock">Esgotado (0)</option>
            </select>
          </div>
        </div>

        {/* Limpar Filtros se algum estiver ativo */}
        {(searchQuery || selectedCategory !== 'all' || statusFilter !== 'all' || promoFilter !== 'all' || stockFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 text-xs text-stone-400">
            <span>Filtros aplicados ({filteredProducts.length} resultados)</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStatusFilter('all');
                setPromoFilter('all');
                setStockFilter('all');
              }}
              className="text-[#2A8882] hover:underline font-semibold cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-4">Produto</th>
                <th className="py-3.5 px-3">Categoria</th>
                <th className="py-3.5 px-3">Preço</th>
                <th className="py-3.5 px-3">Variações</th>
                <th className="py-3.5 px-3">Estoque</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum produto encontrado com os filtros selecionados.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const cat = categories.find(c => c.id === product.categoryId);
                  const isOutOfStock = product.stockQuantity <= 0;
                  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

                  return (
                    <tr key={product.id} className="hover:bg-stone-800/40 transition-colors">
                      {/* Foto e Nome */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shrink-0">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            {product.videoUrl && (
                              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-[8px]" title="Tem vídeo">
                                ▶
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-white truncate flex items-center gap-1.5">
                              <span>{product.name}</span>
                              {product.isFeatured && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 text-[10px] font-semibold uppercase">
                                  Destaque
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400 truncate mt-0.5">
                              {product.sku ? <span className="font-mono text-stone-400 mr-2">SKU: {product.sku}</span> : null}
                              {product.brand ? <span className="text-stone-400">{product.brand}</span> : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 font-medium">
                          {cat?.name || 'Sem categoria'}
                        </span>
                      </td>

                      {/* Preço e Promoção */}
                      <td className="py-3 px-3">
                        <div>
                          {product.isOnSale && product.promotionalPrice ? (
                            <div>
                              <span className="text-emerald-400 font-bold block">
                                R$ {product.promotionalPrice.toFixed(2).replace('.', ',')}
                              </span>
                              <span className="text-stone-500 line-through text-[11px]">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-white font-semibold">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Variações */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {product.sizes.length > 0 && (
                            <div className="text-[11px] text-stone-400">
                              <span className="font-semibold text-stone-300">Tam:</span> {product.sizes.join(', ')}
                            </div>
                          )}
                          {product.colors.length > 0 && (
                            <div className="text-[11px] text-stone-400 truncate max-w-[140px]" title={product.colors.join(', ')}>
                              <span className="font-semibold text-stone-300">Cores:</span> {product.colors.length} cores
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Estoque */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isOutOfStock
                            ? 'bg-red-950/80 text-red-400 border border-red-800'
                            : isLowStock
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          {isOutOfStock ? 'Esgotado (0)' : `${product.stockQuantity} un.`}
                        </span>
                      </td>

                      {/* Status Ativo/Inativo com Toggle Rápido */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            product.isActive
                              ? 'bg-[#2A8882]/20 text-[#2A8882] hover:bg-[#2A8882]/30 border border-[#2A8882]/40'
                              : 'bg-stone-800 text-stone-500 hover:bg-stone-700 border border-stone-700'
                          }`}
                          title="Clique para alternar status ativo/inativo"
                        >
                          {product.isActive ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Ativo</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Inativo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Botões de Ação */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Visualizar no Catálogo */}
                          <button
                            onClick={() => navigateToProduct(product)}
                            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                            title="Ver produto na loja"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* Duplicar */}
                          <button
                            onClick={() => handleDuplicate(product)}
                            className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                            title="Duplicar produto"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 text-stone-400 hover:text-[#2A8882] hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar produto completo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-heading font-extrabold text-lg text-white">
                Excluir este produto?
              </h3>
              <p className="text-xs text-stone-400">
                Você tem certeza que deseja excluir permanentemente o produto:
              </p>
              <p className="text-sm font-bold text-white bg-stone-950 p-2 rounded-xl border border-stone-800 mt-2">
                {productToDelete.name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="w-1/2 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
