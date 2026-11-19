import React, { useState } from 'react';
import { 
  Tag, 
  Percent, 
  Calendar, 
  Check, 
  AlertCircle, 
  Search, 
  ArrowRight, 
  Sparkles,
  Zap,
  Filter
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/ecommerce';

export const AdminPromotionsTab: React.FC = () => {
  const { products, categories, updateProduct } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [discountInput, setDiscountInput] = useState<{ [productId: string]: number }>({});
  const [batchPercent, setBatchPercent] = useState(15);
  const [batchCategoryId, setBatchCategoryId] = useState('all');
  const [actionSuccess, setActionSuccess] = useState('');

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const promoProducts = products.filter(p => p.isOnSale);
  const regularProducts = products.filter(p => !p.isOnSale);

  const filteredProducts = products.filter(p => {
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleApplySinglePromo = async (product: Product, percent: number) => {
    try {
      if (percent <= 0 || percent >= 100) return;
      const promoPrice = Math.round((product.price * (1 - percent / 100)) * 100) / 100;
      await updateProduct(product.id, {
        isOnSale: true,
        promotionalPrice: promoPrice
      });
      triggerSuccess(`Desconto de ${percent}% aplicado em "${product.name}". Preço: R$ ${promoPrice.toFixed(2).replace('.', ',')}`);
    } catch {
      // Só evita a rejeição não tratada: a mensagem já aparece na faixa de erro do painel (runAdmin).
    }
  };

  const handleRemovePromo = async (product: Product) => {
    try {
      await updateProduct(product.id, {
        isOnSale: false,
        promotionalPrice: undefined,
        promotionStartDate: undefined,
        promotionEndDate: undefined
      });
      triggerSuccess(`Promoção removida de "${product.name}".`);
    } catch {
      // Só evita a rejeição não tratada: a mensagem já aparece na faixa de erro do painel (runAdmin).
    }
  };

  const handleApplyBatchDiscount = async () => {
    try {
      const targetProducts = batchCategoryId === 'all'
        ? products
        : products.filter(p => p.categoryId === batchCategoryId);

      if (!confirm(`Aplicar ${batchPercent}% de desconto em ${targetProducts.length} produtos?`)) return;

      for (const prod of targetProducts) {
        const promoPrice = Math.round((prod.price * (1 - batchPercent / 100)) * 100) / 100;
        await updateProduct(prod.id, {
          isOnSale: true,
          promotionalPrice: promoPrice
        });
      }

      triggerSuccess(`Desconto em massa de ${batchPercent}% aplicado em ${targetProducts.length} itens.`);
    } catch {
      // Só evita a rejeição não tratada: a mensagem já aparece na faixa de erro do painel (runAdmin).
    }
  };

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
            Central de Promoções & Ofertas ({promoProducts.length} ativas)
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Aplique descontos percentuais, defina valores promocionais e crie campanhas de venda com validade.
          </p>
        </div>
      </div>

      {/* Caixa de Ação Rápida em Lote (Batch Promo) */}
      <div className="bg-gradient-to-r from-[#F4803E]/10 via-amber-900/10 to-stone-900 border border-[#F4803E]/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-[#F4803E]">
          <Zap className="w-5 h-5" />
          <h3 className="font-heading font-extrabold text-base text-white">
            Aplicação Rápida de Desconto em Massa
          </h3>
        </div>
        <p className="text-xs text-stone-300">
          Aplique uma porcentagem de desconto promocional em toda uma categoria ou no catálogo completo com um clique.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-5">
            <label className="block text-[11px] text-stone-400 mb-1 font-semibold">Categoria Alvo</label>
            <select
              value={batchCategoryId}
              onChange={(e) => setBatchCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#F4803E]"
            >
              <option value="all">Todas as Categorias ({products.length} itens)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] text-stone-400 mb-1 font-semibold">Porcentagem de Desconto</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="90"
                value={batchPercent}
                onChange={(e) => setBatchPercent(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs font-bold focus:outline-none focus:border-[#F4803E]"
              />
              <span className="text-sm font-extrabold text-[#F4803E]">% OFF</span>
            </div>
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              onClick={handleApplyBatchDiscount}
              className="w-full py-2.5 rounded-xl bg-[#F4803E] hover:bg-[#D96B2B] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Percent className="w-4 h-4" />
              <span>Aplicar Desconto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros da Lista */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome ou SKU..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
        >
          <option value="all">Todas as Categorias</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Grade de Produtos e Controles de Promoção */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
            <tr>
              <th className="py-3.5 px-4">Produto</th>
              <th className="py-3.5 px-3">Preço Base</th>
              <th className="py-3.5 px-3">Preço Promo</th>
              <th className="py-3.5 px-3">Desconto %</th>
              <th className="py-3.5 px-3">Status Oferta</th>
              <th className="py-3.5 px-4 text-right">Ação Rápida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/80">
            {filteredProducts.map((prod) => {
              const currentDiscountPercent = prod.promotionalPrice && prod.price > prod.promotionalPrice
                ? Math.round(((prod.price - prod.promotionalPrice) / prod.price) * 100)
                : 0;

              const customInputVal = discountInput[prod.id] || 15;

              return (
                <tr key={prod.id} className="hover:bg-stone-800/40 transition-colors">
                  {/* Foto e Nome */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-10 h-12 rounded-xl object-cover border border-stone-800 shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-white truncate">{prod.name}</p>
                        <p className="text-[11px] text-stone-500 font-mono">{prod.sku || 'Sem SKU'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Preço Base */}
                  <td className="py-3 px-3 font-semibold text-stone-300">
                    R$ {prod.price.toFixed(2).replace('.', ',')}
                  </td>

                  {/* Preço Promo */}
                  <td className="py-3 px-3">
                    {prod.isOnSale && prod.promotionalPrice ? (
                      <span className="text-[#F4803E] font-bold">
                        R$ {prod.promotionalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    ) : (
                      <span className="text-stone-600">-</span>
                    )}
                  </td>

                  {/* Desconto % */}
                  <td className="py-3 px-3">
                    {prod.isOnSale && currentDiscountPercent > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4803E]/20 text-[#F4803E] font-extrabold text-[11px]">
                        -{currentDiscountPercent}%
                      </span>
                    ) : (
                      <span className="text-stone-600">Sem oferta</span>
                    )}
                  </td>

                  {/* Status Oferta */}
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.isOnSale
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-stone-800 text-stone-500 border border-stone-700'
                    }`}>
                      {prod.isOnSale ? 'Ativa' : 'Desativada'}
                    </span>
                  </td>

                  {/* Ação Rápida */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {prod.isOnSale ? (
                        <button
                          onClick={() => handleRemovePromo(prod)}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Encerrar Oferta
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="5"
                            max="80"
                            value={customInputVal}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setDiscountInput(prev => ({ ...prev, [prod.id]: val }));
                            }}
                            className="w-14 px-1.5 py-1 bg-stone-950 border border-stone-800 rounded text-center text-xs text-white"
                          />
                          <button
                            onClick={() => handleApplySinglePromo(prod, customInputVal)}
                            className="px-2.5 py-1 rounded-lg bg-[#F4803E] hover:bg-[#D96B2B] text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Aplicar %
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
