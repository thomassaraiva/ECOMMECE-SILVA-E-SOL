import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Check,
  X,
  FolderPlus,
  Image as ImageIcon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types/ecommerce';

export const AdminCategoriesTab: React.FC = () => {
  const { 
    categories, 
    subcategories, 
    products, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryStatus,
    addSubcategory, 
    deleteSubcategory 
  } = useStore();

  // Categoria Form
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImageUrl, setCatImageUrl] = useState('');
  const [catOrder, setCatOrder] = useState(1);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Subcategoria Form
  const [subcatName, setSubcatName] = useState('');
  const [selectedCatForSubcat, setSelectedCatForSubcat] = useState(categories[0]?.id || '');
  const [actionSuccess, setActionSuccess] = useState('');
  const [catErrorMsg, setCatErrorMsg] = useState('');
  const [subcatErrorMsg, setSubcatErrorMsg] = useState('');

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleCategoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onerror = () => {
      alert('Erro ao carregar o arquivo de imagem.');
      setIsUploadingImage(false);
    };
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setCatImageUrl(result);
        triggerSuccess(`Foto da categoria carregada.`);
      }
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
    if (catFileInputRef.current) catFileInputRef.current.value = '';
  };

  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDescription('');
    setCatImageUrl('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');
    setCatOrder(categories.length + 1);
    setCatErrorMsg('');
    setIsModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDescription(cat.description || '');
    setCatImageUrl(cat.imageUrl || '');
    setCatOrder(cat.order || 1);
    setCatErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const slug = catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    setCatErrorMsg('');
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: catName.trim(),
          slug,
          description: catDescription.trim() || undefined,
          imageUrl: catImageUrl.trim() || undefined,
          order: catOrder
        });
        triggerSuccess(`Categoria "${catName}" atualizada.`);
      } else {
        await addCategory({
          name: catName.trim(),
          slug,
          description: catDescription.trim() || undefined,
          imageUrl: catImageUrl.trim() || undefined,
          order: catOrder,
          isActive: true
        });
        triggerSuccess(`Categoria "${catName}" criada com sucesso.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      // O modal continua aberto com os dados digitados; a mensagem aparece junto ao botão.
      setCatErrorMsg(err.message || 'Não foi possível salvar a categoria.');
    }
  };

  const handleAddSubcat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcatName.trim() || !selectedCatForSubcat) return;

    const slug = subcatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSubcatErrorMsg('');
    try {
      await addSubcategory({
        categoryId: selectedCatForSubcat,
        name: subcatName.trim(),
        slug
      });
      setSubcatName('');
      triggerSuccess('Subcategoria adicionada com sucesso.');
    } catch (err: any) {
      // O nome digitado fica no campo; a mensagem aparece junto ao botão.
      setSubcatErrorMsg(err.message || 'Não foi possível salvar a subcategoria.');
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
            Categorias & Subcategorias
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Estruture o catálogo comercial, coleções da estação e subdivisões de produto.
          </p>
        </div>

        <button
          onClick={handleOpenNewCategory}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const catProducts = products.filter(p => p.categoryId === cat.id);
          const catSubcategories = subcategories.filter(s => s.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between group hover:border-stone-700 transition-all"
            >
              {/* Imagem de Capa e Header da Categoria */}
              <div className="relative h-36 bg-stone-950 overflow-hidden">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-950 text-stone-700">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

                {/* Status e Ordem */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-900/90 border border-stone-800 text-[10px] font-bold text-stone-300">
                    Ordem: #{cat.order || 1}
                  </span>

                  <button
                    onClick={() => toggleCategoryStatus(cat.id).catch(() => { /* só evita a rejeição não tratada: o erro aparece na faixa do painel (runAdmin) */ })}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                      cat.isActive
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-stone-800 text-stone-500 border border-stone-700'
                    }`}
                  >
                    {cat.isActive ? 'Ativa' : 'Oculta'}
                  </button>
                </div>

                {/* Título sobre a imagem */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-heading font-extrabold text-lg text-white truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-stone-300 font-mono">
                    /{cat.slug} &bull; {catProducts.length} produto(s)
                  </p>
                </div>
              </div>

              {/* Corpo com Descrição e Subcategorias */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {cat.description && (
                  <p className="text-xs text-stone-400 line-clamp-2">
                    {cat.description}
                  </p>
                )}

                {/* Lista de Subcategorias vinculadas */}
                <div className="space-y-1.5 pt-2 border-t border-stone-800/80">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Subcategorias ({catSubcategories.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {catSubcategories.length === 0 ? (
                      <span className="text-[11px] text-stone-600 italic">Nenhuma subcategoria</span>
                    ) : (
                      catSubcategories.map(sub => (
                        <span
                          key={sub.id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-stone-300"
                        >
                          <span>{sub.name}</span>
                          <button
                            onClick={() => deleteSubcategory(sub.id).catch(() => { /* só evita a rejeição não tratada: o erro aparece na faixa do painel (runAdmin) */ })}
                            className="text-stone-500 hover:text-red-400"
                            title="Remover subcategoria"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditCategory(cat)}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-[#2A8882] text-stone-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir categoria "${cat.name}"?`)) {
                        deleteCategory(cat.id).catch(() => { /* só evita a rejeição não tratada: o erro aparece na faixa do painel (runAdmin) */ });
                      }
                    }}
                    className="p-1.5 rounded-xl text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Caixa Rápida para Cadastrar Subcategoria */}
      <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center gap-2.5 text-teal-400">
          <FolderPlus className="w-5 h-5" />
          <h3 className="font-heading font-extrabold text-base text-white">
            Vincular Nova Subcategoria
          </h3>
        </div>

        <form onSubmit={handleAddSubcat} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-[11px] text-stone-400 mb-1 font-semibold">Categoria Pai</label>
            <select
              value={selectedCatForSubcat}
              onChange={(e) => setSelectedCatForSubcat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] text-stone-400 mb-1 font-semibold">Nome da Subcategoria</label>
            <input
              type="text"
              required
              value={subcatName}
              onChange={(e) => setSubcatName(e.target.value)}
              placeholder="Ex: Sungas Cavadas, Bermudas Água..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              + Adicionar
            </button>
          </div>
          {subcatErrorMsg && (
            <div role="alert" className="sm:col-span-12 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
              {subcatErrorMsg}
            </div>
          )}
        </form>
      </div>

      {/* Modal de Cadastro/Edição de Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-heading font-extrabold text-base text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ex: Sungas Especiais"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#2A8882]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Slug / URL</label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="sungas-especiais"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#2A8882]"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#2A8882]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-stone-300 font-semibold mb-1">Foto de Capa da Categoria (JPG, PNG, WebP)</label>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="https://... ou escolha um arquivo"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#2A8882]"
                  />
                  <button
                    type="button"
                    onClick={() => catFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Upload className="w-4 h-4 text-[#2A8882]" />
                    <span>{isUploadingImage ? 'Carregando...' : 'Foto do Aparelho'}</span>
                  </button>
                  <input
                    ref={catFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
                    onChange={handleCategoryFileUpload}
                    className="hidden"
                  />
                </div>

                {catImageUrl && (
                  <div className="relative h-28 w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800 mt-2">
                    <img
                      src={catImageUrl}
                      alt="Pré-visualização da categoria"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-white text-xs font-bold">{catName || 'Prévia da Categoria'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Coleção pensada para o sol tropical..."
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#2A8882]"
                />
              </div>

              {catErrorMsg && (
                <div role="alert" className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {catErrorMsg}
                </div>
              )}

              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
