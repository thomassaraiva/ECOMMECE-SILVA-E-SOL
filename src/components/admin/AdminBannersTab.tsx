import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Check, 
  X, 
  Smartphone, 
  Monitor,
  Database,
  Upload,
  Zap,
  Sparkles,
  RefreshCw,
  Sliders,
  ArrowRight,
  Info,
  Layers,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Loader2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Banner } from '../../types/ecommerce';
import { formatBytes, optimizeBannerImage } from '../../lib/imageOptimizer';
import { uploadImageToSupabaseStorage, isSupabaseConfigured } from '../../lib/supabase';

export const AdminBannersTab: React.FC = () => {
  const { banners, categories, products, addBanner, updateBanner, deleteBanner, toggleBannerStatus } = useStore();

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [listPreviewMode, setListPreviewMode] = useState<Record<string, 'desktop' | 'mobile'>>({});

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [buttonText, setButtonText] = useState('Ver Coleção');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [objectPosition, setObjectPosition] = useState('center center');
  const [mobileObjectPosition, setMobileObjectPosition] = useState('center center');

  // Estados de upload de arquivos (direto sem conversão para canvas)
  const [isReadingDesktop, setIsReadingDesktop] = useState(false);
  const [isReadingMobile, setIsReadingMobile] = useState(false);
  const [desktopFileInfo, setDesktopFileInfo] = useState<{ name: string; sizeFormatted: string; type: string } | null>(null);
  const [mobileFileInfo, setMobileFileInfo] = useState<{ name: string; sizeFormatted: string; type: string } | null>(null);
  const [showManualUrlDesktop, setShowManualUrlDesktop] = useState(false);
  const [showManualUrlMobile, setShowManualUrlMobile] = useState(false);
  const [modalPreviewDevice, setModalPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const [actionSuccess, setActionSuccess] = useState('');

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleOpenNew = () => {
    setEditingBanner(null);
    setTitle('Coleção Solar Nordeste');
    setSubtitle('Modelagens exclusivas para celebrar o sol e o mar');
    setImageUrl('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80');
    setMobileImageUrl('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');
    setLinkUrl('#produtos');
    setButtonText('Explorar Catálogo');
    setOrder(banners.length + 1);
    setIsActive(true);
    setObjectPosition('center center');
    setMobileObjectPosition('center center');
    setDesktopFileInfo(null);
    setMobileFileInfo(null);
    setShowManualUrlDesktop(false);
    setShowManualUrlMobile(false);
    setModalPreviewDevice('desktop');
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImageUrl(banner.imageUrl);
    setMobileImageUrl(banner.mobileImageUrl || '');
    setLinkUrl(banner.linkUrl || banner.ctaLink || '');
    setButtonText(banner.buttonText || banner.ctaText || 'Ver Coleção');
    setOrder(banner.order || 1);
    setIsActive(banner.isActive);
    setObjectPosition(banner.objectPosition || 'center center');
    setMobileObjectPosition(banner.mobileObjectPosition || 'center center');
    setDesktopFileInfo(null);
    setMobileFileInfo(null);
    setShowManualUrlDesktop(Boolean(banner.imageUrl && !banner.imageUrl.startsWith('data:')));
    setShowManualUrlMobile(Boolean(banner.mobileImageUrl && !banner.mobileImageUrl.startsWith('data:')));
    setModalPreviewDevice('desktop');
    setIsModalOpen(true);
  };

  // Upload direto e otimizado de arquivo Desktop (JPG, PNG, WebP)
  const handleDesktopFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsReadingDesktop(true);

      // 1. Otimiza a imagem localmente (cria WebP leve e nítido de ~100-150KB)
      const optimized = await optimizeBannerImage(file, 'desktop');

      // 2. Se o Supabase Storage estiver configurado, envia para o bucket 'banners'
      let finalUrl = optimized.dataUrl;
      if (isSupabaseConfigured) {
        const storageUrl = await uploadImageToSupabaseStorage(file, 'banners', 'banner-desktop');
        if (storageUrl) {
          finalUrl = storageUrl;
        }
      }

      setImageUrl(finalUrl);
      setDesktopFileInfo({
        name: file.name,
        sizeFormatted: formatBytes(optimized.compressedSize),
        type: 'image/webp'
      });
      triggerSuccess(`Banner Desktop otimizado e anexado (${formatBytes(optimized.compressedSize)})!`);
    } catch (err: any) {
      alert('Falha ao processar arquivo: ' + err.message);
    } finally {
      setIsReadingDesktop(false);
      if (desktopFileInputRef.current) desktopFileInputRef.current.value = '';
    }
  };

  // Upload direto e otimizado de arquivo Mobile (JPG, PNG, WebP)
  const handleMobileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsReadingMobile(true);

      // 1. Otimiza a imagem localmente (cria WebP leve e nítido para mobile de ~60-90KB)
      const optimized = await optimizeBannerImage(file, 'mobile');

      // 2. Se o Supabase Storage estiver configurado, envia para o bucket 'banners'
      let finalUrl = optimized.dataUrl;
      if (isSupabaseConfigured) {
        const storageUrl = await uploadImageToSupabaseStorage(file, 'banners', 'banner-mobile');
        if (storageUrl) {
          finalUrl = storageUrl;
        }
      }

      setMobileImageUrl(finalUrl);
      setMobileFileInfo({
        name: file.name,
        sizeFormatted: formatBytes(optimized.compressedSize),
        type: 'image/webp'
      });
      triggerSuccess(`Banner Mobile otimizado e anexado (${formatBytes(optimized.compressedSize)})!`);
    } catch (err: any) {
      alert('Falha ao processar imagem mobile: ' + err.message);
    } finally {
      setIsReadingMobile(false);
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert('Por favor, informe o título e envie a imagem principal do banner.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Omit<Banner, 'id'> = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        imageUrl: imageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim() || undefined,
        linkUrl: linkUrl.trim() || 'sungas',
        buttonText: buttonText.trim() || 'Ver Coleção',
        ctaText: buttonText.trim() || 'Ver Coleção',
        ctaLink: linkUrl.trim() || 'sungas',
        order: Number(order) || 1,
        displayOrder: Number(order) || 1,
        isActive,
        objectPosition,
        mobileObjectPosition
      };

      if (editingBanner) {
        await updateBanner(editingBanner.id, payload);
        triggerSuccess('Banner atualizado com sucesso no sistema e no banco!');
      } else {
        await addBanner(payload);
        triggerSuccess('Banner cadastrado e publicado com sucesso!');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar banner:', err);
      alert('Erro ao salvar banner: ' + (err.message || 'Verifique sua conexão ou tente novamente.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white flex items-center gap-2">
            <span>Banners da Página Inicial</span>
            <span className="text-xs bg-stone-800 text-stone-300 font-normal px-2.5 py-0.5 rounded-full border border-stone-700">
              {banners.length} {banners.length === 1 ? 'campanha' : 'campanhas'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Upload direto do celular ou notebook com compressão WebP leve no navegador para carregamento instantâneo.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Banner</span>
        </button>
      </div>

      {/* Card Informativo de Otimização */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-stone-900 to-amber-950/30 border border-teal-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2A8882]/20 border border-[#2A8882]/40 flex items-center justify-center text-[#2A8882] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="text-white font-semibold flex items-center gap-1.5">
              <span>Compressão Inteligente no Navegador</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Ativa
              </span>
            </p>
            <p className="text-stone-400 mt-0.5">
              Fotos pesadas tiradas com celular (5MB a 15MB) são redimensionadas e comprimidas automaticamente para ~150KB sem perda visível de qualidade.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Banners */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-3xl space-y-3">
            <ImageIcon className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-stone-300 font-semibold text-sm">Nenhum banner cadastrado ainda</h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              Crie seu primeiro banner promocional com imagem para desktop e celular.
            </p>
            <button
              onClick={handleOpenNew}
              className="mt-2 px-4 py-2 rounded-xl bg-[#2A8882] text-white text-xs font-bold"
            >
              Criar Primeiro Banner
            </button>
          </div>
        ) : (
          banners.map((banner) => {
            const previewMode = listPreviewMode[banner.id] || 'desktop';
            const displayImg = previewMode === 'mobile' && banner.mobileImageUrl 
              ? banner.mobileImageUrl 
              : banner.imageUrl;

            return (
              <div
                key={banner.id}
                className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden p-5 flex flex-col md:flex-row items-center gap-5 shadow-lg hover:border-stone-700 transition-all"
              >
                {/* Visualização da Imagem com Seletor Desktop/Mobile */}
                <div className="relative w-full md:w-72 h-44 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shrink-0 group">
                  <img
                    src={displayImg}
                    alt={banner.title}
                    referrerPolicy="no-referrer"
                    style={{
                      objectFit: 'cover',
                      objectPosition: (previewMode === 'mobile' && banner.mobileObjectPosition) || banner.objectPosition || 'center center'
                    }}
                    className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Badges superiores */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                    <span className="bg-stone-900/90 text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-stone-700">
                      #{banner.order || 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      banner.isActive
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                        : 'bg-stone-950/90 text-stone-400 border border-stone-800'
                    }`}>
                      {banner.isActive ? 'Ativo' : 'Oculto'}
                    </span>
                  </div>

                  {/* Alternador de visualização rápida na lista */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-stone-950/80 backdrop-blur-xs p-1 rounded-lg border border-stone-800 z-10">
                    <button
                      onClick={() => setListPreviewMode(prev => ({ ...prev, [banner.id]: 'desktop' }))}
                      className={`p-1 rounded text-[10px] font-semibold flex items-center gap-1 ${
                        previewMode === 'desktop'
                          ? 'bg-[#2A8882] text-white'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                      title="Ver versão Desktop"
                    >
                      <Monitor className="w-3 h-3" />
                      <span className="hidden sm:inline">Desktop</span>
                    </button>
                    {banner.mobileImageUrl && (
                      <button
                        onClick={() => setListPreviewMode(prev => ({ ...prev, [banner.id]: 'mobile' }))}
                        className={`p-1 rounded text-[10px] font-semibold flex items-center gap-1 ${
                          previewMode === 'mobile'
                            ? 'bg-[#F4803E] text-white'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                        title="Ver versão Mobile"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span className="hidden sm:inline">Celular</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Informações Comerciais */}
                <div className="flex-1 min-w-0 space-y-2 text-center md:text-left w-full">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h3 className="font-heading font-extrabold text-lg text-white">
                      {banner.title}
                    </h3>
                  </div>

                  {banner.subtitle && (
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-stone-400">
                    <span>Botão: <strong className="text-stone-200">{banner.buttonText || banner.ctaText || 'Ver Coleção'}</strong></span>
                    <span>&bull;</span>
                    <span>Destino: <code className="text-amber-400 bg-stone-950 px-2 py-0.5 rounded font-mono text-[11px]">{banner.linkUrl || banner.ctaLink || '#produtos'}</code></span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      {banner.mobileImageUrl ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5" /> Mobile Dedicado
                        </span>
                      ) : (
                        <span className="text-stone-500 flex items-center gap-1">
                          <Monitor className="w-3.5 h-3.5" /> Responsivo Geral
                        </span>
                      )}
                    </span>
                    <span>&bull;</span>
                    <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                      Alinhamento: {banner.objectPosition === 'center top' ? 'Topo' : banner.objectPosition === 'center bottom' ? 'Base' : 'Centro'}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleBannerStatus(banner.id).catch(() => { /* só evita a rejeição não tratada: o erro aparece na faixa do painel (runAdmin) */ })}
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Ativar ou desativar exibição"
                  >
                    {banner.isActive ? <EyeOff className="w-4 h-4 text-stone-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                    <span className="hidden sm:inline">{banner.isActive ? 'Ocultar' : 'Publicar'}</span>
                  </button>

                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-[#2A8882] text-stone-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o banner "${banner.title}"?`)) {
                        deleteBanner(banner.id)
                          .then(() => triggerSuccess('Banner removido.'))
                          .catch(() => { /* só evita a rejeição não tratada: o erro aparece na faixa do painel (runAdmin) */ });
                      }
                    }}
                    className="p-2.5 rounded-xl text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Excluir banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro / Edição com Upload e Compressão em Tempo Real */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl my-auto">
            
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#2A8882]" />
                  <span>{editingBanner ? 'Editar Banner da Home' : 'Novo Banner da Home'}</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Faça o upload da foto do celular ou computador com compressão leve automática.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              
              {/* Campos Textuais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1.5">
                    Título Principal do Banner *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Coleção Solar Alto Verão"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1.5">
                    Subtítulo / Chamada Curta
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex.: Sunga em poliéster com elastano, forro em microfibra."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
                  />
                </div>
              </div>

              {/* Seção 1: Upload Imagem Desktop */}
              <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-[#2A8882]" />
                    <span>Imagem Desktop (Computador / Notebook / 1920x800) *</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowManualUrlDesktop(!showManualUrlDesktop)}
                    className="text-[11px] text-[#2A8882] hover:underline cursor-pointer"
                  >
                    {showManualUrlDesktop ? 'Usar Upload de Arquivo' : 'Colar link direto (URL)'}
                  </button>
                </div>

                {showManualUrlDesktop ? (
                  <div>
                    <input
                      type="url"
                      required={!imageUrl}
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/banner-desktop.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Botão de Upload com Drag & Drop (Aceita JPG, PNG, WebP diretamente) */}
                    <div 
                      onClick={() => desktopFileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-700 hover:border-[#2A8882] rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-colors bg-stone-900/50 hover:bg-stone-900 flex flex-col items-center justify-center gap-2 group"
                    >
                      <input
                        ref={desktopFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
                        onChange={handleDesktopFileChange}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-[#2A8882]/20 text-[#2A8882] flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isReadingDesktop ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-xs">
                          {isReadingDesktop ? 'Carregando foto...' : 'Escolher foto do celular, computador ou Google Fotos'}
                        </p>
                        <p className="text-stone-400 text-[11px] mt-0.5">
                          Aceita arquivos de imagem padrão (JPG, PNG, WebP) diretamente sem travar.
                        </p>
                      </div>
                    </div>

                    {/* Informações do Arquivo Carregado */}
                    {desktopFileInfo && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium truncate">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{desktopFileInfo.name}</span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400 shrink-0 ml-2">
                          {desktopFileInfo.sizeFormatted}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Seção 2: Upload Imagem Mobile (Opcional dedicada) */}
              <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#F4803E]" />
                    <span>Imagem Mobile Específica (Vertical / Celular)</span>
                    <span className="text-[10px] text-stone-400 font-normal">(Opcional)</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowManualUrlMobile(!showManualUrlMobile)}
                    className="text-[11px] text-[#F4803E] hover:underline cursor-pointer"
                  >
                    {showManualUrlMobile ? 'Usar Upload de Arquivo' : 'Colar link direto (URL)'}
                  </button>
                </div>

                {showManualUrlMobile ? (
                  <div>
                    <input
                      type="url"
                      value={mobileImageUrl}
                      onChange={(e) => setMobileImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/banner-mobile.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#F4803E]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div 
                      onClick={() => mobileFileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-700 hover:border-[#F4803E] rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-colors bg-stone-900/50 hover:bg-stone-900 flex flex-col items-center justify-center gap-2 group"
                    >
                      <input
                        ref={mobileFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
                        onChange={handleMobileFileChange}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-[#F4803E]/20 text-[#F4803E] flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isReadingMobile ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-xs">
                          {isReadingMobile ? 'Carregando foto mobile...' : 'Escolher foto vertical (JPG, PNG, WebP) do celular ou PC'}
                        </p>
                        <p className="text-stone-400 text-[11px] mt-0.5">
                          Se não enviar, a foto principal será usada responsivamente.
                        </p>
                      </div>
                    </div>

                    {/* Informações do Arquivo Mobile */}
                    {mobileFileInfo && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium truncate">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{mobileFileInfo.name}</span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400 shrink-0 ml-2">
                          {mobileFileInfo.sizeFormatted}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Seção 3: Posicionamento do Banner (CSS object-fit: cover e object-position) */}
              <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 text-xs">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Posicionamento e Alinhamento Vertical da Foto (object-position)</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 w-fit">
                    object-fit: cover • {objectPosition}
                  </span>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed">
                  O banner é renderizado com <code className="text-amber-300 font-mono">object-fit: cover</code> para preencher a tela de ponta a ponta sem distorções. Escolha onde centralizar o foco visual da foto:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'center top', label: 'Topo', icon: ArrowUp, desc: 'Foco superior (rostos e detalhes do topo)' },
                    { id: 'center center', label: 'Centro', icon: Maximize2, desc: 'Foco central equilibrado' },
                    { id: 'center bottom', label: 'Base', icon: ArrowDown, desc: 'Foco inferior (sungas, shorts e detalhes inferiores)' }
                  ].map((pos) => {
                    const IconComponent = pos.icon;
                    const isSelected = objectPosition === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setObjectPosition(pos.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 bg-amber-950/40 text-white shadow-xs ring-1 ring-amber-400/30'
                            : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700 hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                            <span>{pos.label}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1 leading-tight">{pos.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pré-visualização Instantânea do Banner */}
              {imageUrl && (
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300 font-semibold flex items-center gap-1.5 text-xs">
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                      <span>Pré-visualização Instantânea do Banner (object-fit: cover)</span>
                    </span>

                    {/* Alternador de dispositivo no preview */}
                    <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
                      <button
                        type="button"
                        onClick={() => setModalPreviewDevice('desktop')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                          modalPreviewDevice === 'desktop'
                            ? 'bg-[#2A8882] text-white'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalPreviewDevice('mobile')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                          modalPreviewDevice === 'mobile'
                            ? 'bg-[#F4803E] text-white'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Moldura de Pré-visualização com object-fit: cover e object-position dinâmico */}
                  <div className={`relative mx-auto rounded-xl overflow-hidden bg-black transition-all ${
                    modalPreviewDevice === 'desktop'
                      ? 'w-full h-44 sm:h-52'
                      : 'w-64 h-72 border-4 border-stone-800 rounded-3xl shadow-xl'
                  }`}>
                    <img
                      src={modalPreviewDevice === 'mobile' && mobileImageUrl ? mobileImageUrl : imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      style={{
                        objectFit: 'cover',
                        objectPosition: objectPosition
                      }}
                      className="w-full h-full transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
                    <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#F4803E]/80 text-white inline-block">
                        Moda Solar
                      </span>
                      <h4 className="font-heading font-extrabold text-sm sm:text-base leading-tight">
                        {title || 'Título do Banner'}
                      </h4>
                      {subtitle && (
                        <p className="text-[11px] text-stone-200 line-clamp-1">
                          {subtitle}
                        </p>
                      )}
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2A8882] text-white text-[10px] font-bold">
                          {buttonText || 'Ver Coleção'}
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações de Ação e Destino */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Texto do Botão (CTA)</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Ex: Ver Coleção"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#2A8882]"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Destino do Clique (Link ou #seção)</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="#produtos ou /categoria/sungas"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#2A8882]"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Ordem no Carrossel</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-[#2A8882]"
                  />
                </div>
              </div>

              {/* Status Ativo */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#2A8882] rounded"
                  />
                  <span className="text-white font-semibold">Banner Ativo (exibir imediatamente na página inicial)</span>
                </label>
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isReadingDesktop || isReadingMobile || isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no Banco...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvar Banner</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
