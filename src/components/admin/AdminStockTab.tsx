import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Check, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Minus,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types/ecommerce';

export const AdminStockTab: React.FC = () => {
  const { products, updateProduct } = useStore();

  const [search, setSearch] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'ok'>('all');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 2500);
  };

  const handleAdjustProductStock = async (product: Product, delta: number) => {
    try {
      const newQty = Math.max(0, product.stockQuantity + delta);
      await updateProduct(product.id, { stockQuantity: newQty });
      triggerSuccess(`Estoque de "${product.name}" ajustado para ${newQty} un.`);
    } catch {
      // Só evita a rejeição não tratada: a mensagem já aparece na faixa de erro do painel (runAdmin).
    }
  };

  const handleSetProductStockDirect = async (product: Product, newQty: number) => {
    try {
      const safeQty = Math.max(0, newQty);
      await updateProduct(product.id, { stockQuantity: safeQty });
      triggerSuccess(`Estoque de "${product.name}" atualizado para ${safeQty} un.`);
    } catch {
      // Só evita a rejeição não tratada: a mensagem já aparece na faixa de erro do painel (runAdmin).
    }
  };

  const handleAdjustVariantStock = async (product: Product, variantIndex: number, delta: number) => {
    try {
      if (!product.variants) return;
      const updatedVariants = [...product.variants];
      const current = updatedVariants[variantIndex];
      const newQty = Math.max(0, current.stockQuantity + delta);
      updatedVariants[variantIndex] = {
        ...current,
        stockQuantity: newQty,
        isAvailable: newQty > 0
      };

      // Atualiza também o estoque global se for soma das variações
      const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.stockQuantity, 0);

      await updateProduct(product.id, {
        variants: updatedVariants,
        stockQuantity: newTotalStock
      });

      triggerSuccess(`Variação ${current.size || ''} ${current.color || ''} ajustada para ${newQty} un.`);
    } catch {
      // Só evita a rejeição não tratada: a mensagem já aparece na faixa de erro do painel (runAdmin).
    }
  };

  const filteredProducts = products.filter(p => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (stockStatusFilter === 'out' && p.stockQuantity > 0) return false;
    if (stockStatusFilter === 'low' && (p.stockQuantity <= 0 || p.stockQuantity > 5)) return false;
    if (stockStatusFilter === 'ok' && p.stockQuantity <= 5) return false;

    return true;
  });

  const outOfStockCount = products.filter(p => p.stockQuantity <= 0).length;
  const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
            Controle de Estoque & Depósito
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Ajuste quantidades com 1 clique, monitore níveis críticos e controle o estoque individual por tamanho e cor.
          </p>
        </div>
      </div>

      {/* Métricas de Depósito */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total em Depósito</span>
            <div className="text-2xl font-extrabold text-white mt-1">{totalStockUnits} peças</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2A8882]/20 text-[#2A8882] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Estoque Baixo (&le; 5 un.)</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{lowStockCount} itens</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Produtos Esgotados</span>
            <div className="text-2xl font-extrabold text-red-400 mt-1">{outOfStockCount} itens</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por produto ou código SKU..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStockStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              stockStatusFilter === 'all' ? 'bg-[#2A8882] text-white' : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStockStatusFilter('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              stockStatusFilter === 'low' ? 'bg-amber-600 text-white' : 'bg-stone-950 text-stone-400 hover:text-amber-400'
            }`}
          >
            Baixo ({lowStockCount})
          </button>
          <button
            onClick={() => setStockStatusFilter('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              stockStatusFilter === 'out' ? 'bg-red-600 text-white' : 'bg-stone-950 text-stone-400 hover:text-red-400'
            }`}
          >
            Esgotados ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Tabela de Estoque */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-stone-800">
          {filteredProducts.map((prod) => {
            const isOutOfStock = prod.stockQuantity <= 0;
            const isLowStock = prod.stockQuantity > 0 && prod.stockQuantity <= 5;
            const isExpanded = expandedProductId === prod.id;
            const hasVariants = prod.variants && prod.variants.length > 0;

            return (
              <div key={prod.id} className="p-4 hover:bg-stone-850/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Foto e Detalhes */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-12 h-14 rounded-xl object-cover border border-stone-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">{prod.name}</h4>
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                        {prod.sku ? `SKU: ${prod.sku}` : 'Sem SKU'} &bull; R$ {prod.price.toFixed(2).replace('.', ',')}
                      </p>
                      {hasVariants && (
                        <button
                          onClick={() => setExpandedProductId(isExpanded ? null : prod.id)}
                          className="text-[11px] text-teal-400 hover:underline flex items-center gap-1 mt-1 font-semibold cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          <span>{prod.variants!.length} variações registradas</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status e Controles Rápidos */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    {/* Badge de Status */}
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        isOutOfStock
                          ? 'bg-red-950/80 text-red-400 border border-red-800'
                          : isLowStock
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        {isOutOfStock ? 'ESGOTADO' : `${prod.stockQuantity} un.`}
                      </span>
                    </div>

                    {/* Botões Rápidos +- */}
                    <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-xl p-1">
                      <button
                        onClick={() => handleAdjustProductStock(prod, -1)}
                        className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                        title="Remover 1 unidade"
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={prod.stockQuantity}
                        onChange={(e) => handleSetProductStockDirect(prod, parseInt(e.target.value) || 0)}
                        className="w-14 text-center font-bold text-white text-xs bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => handleAdjustProductStock(prod, +1)}
                        className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                        title="Adicionar 1 unidade"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleAdjustProductStock(prod, +5)}
                        className="px-2 h-7 rounded-lg bg-[#2A8882]/20 hover:bg-[#2A8882] text-[#2A8882] hover:text-white flex items-center justify-center font-bold text-[11px] transition-colors cursor-pointer"
                        title="Adicionar 5 unidades"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bloco Expansível de Variações */}
                {isExpanded && hasVariants && (
                  <div className="mt-4 pt-3 border-t border-stone-800/80 pl-4 sm:pl-16 space-y-2">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                      Estoque detalhado por variação de {prod.name}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {prod.variants!.map((v, vIdx) => (
                        <div
                          key={v.id || vIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs"
                        >
                          <div>
                            <span className="text-white font-semibold">
                              {[v.size, v.color, v.model].filter(Boolean).join(' - ')}
                            </span>
                            <span className="block text-[10px] text-stone-500 font-mono">
                              SKU: {v.sku || 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAdjustVariantStock(prod, vIdx, -1)}
                              className="w-6 h-6 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center justify-center font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className={`w-8 text-center font-bold text-xs ${v.stockQuantity <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {v.stockQuantity}
                            </span>
                            <button
                              onClick={() => handleAdjustVariantStock(prod, vIdx, +1)}
                              className="w-6 h-6 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center justify-center font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
