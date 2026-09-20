import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sun, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { supabase } from '../../lib/supabase';
import { Banner } from '../../types/ecommerce';

export const HeroBanner: React.FC = () => {
  const { banners: storeBanners, navigateToCategory, setCurrentPage } = useStore();
  const [supabaseBanners, setSupabaseBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Busca direta na tabela 'banners' do Supabase
  useEffect(() => {
    async function fetchBannersFromSupabase() {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          console.warn('Aviso ao consultar tabela banners no Supabase:', error.message);
          return;
        }

        if (data && data.length > 0) {
          const mapped: Banner[] = data.map((b: any) => ({
            id: String(b.id),
            title: b.title || 'Coleção Solar',
            subtitle: b.subtitle || '',
            ctaText: b.button_text || b.cta_text || b.ctaText || 'Conhecer Coleção',
            ctaLink: b.link_url || b.cta_link || b.ctaLink || 'sungas',
            imageUrl: b.image_url || b.imageUrl || '',
            mobileImageUrl: b.mobile_image_url || b.mobileImageUrl,
            displayOrder: Number(b.display_order ?? b.displayOrder ?? 1),
            isActive: b.is_active !== undefined ? Boolean(b.is_active) : (b.isActive !== undefined ? Boolean(b.isActive) : true),
            objectPosition: b.object_position || b.objectPosition || 'center center',
            mobileObjectPosition: b.mobile_object_position || b.mobileObjectPosition || 'center center'
          }));
          setSupabaseBanners(mapped);
        }
      } catch (err) {
        console.warn('Erro ao carregar banners do Supabase:', err);
      }
    }

    fetchBannersFromSupabase();
  }, []);

  const banners = supabaseBanners.length > 0 ? supabaseBanners : storeBanners;
  const activeBanners = banners.filter(b => b.isActive);


  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex];

  const handleCtaClick = () => {
    if (current.ctaLink === 'sungas' || current.ctaLink.includes('cat-')) {
      navigateToCategory(current.ctaLink.startsWith('cat-') ? current.ctaLink : 'cat-sungas');
    } else if (current.ctaLink === 'camisetas') {
      navigateToCategory('cat-camisetas');
    } else {
      setCurrentPage('catalog');
    }
  };

  return (
    <div className="relative w-full bg-[#FAF7F2] overflow-hidden">
      {/* Container de Altura Otimizada para Mobile e Desktop */}
      <div className="relative h-[480px] sm:h-[540px] md:h-[580px] w-full">
        
        {/* Imagem de Fundo com Gradiente Suave */}
        <div className="absolute inset-0">
          <picture>
            {current.mobileImageUrl && (
              <source media="(max-width: 640px)" srcSet={current.mobileImageUrl} />
            )}
            <img
              src={current.imageUrl}
              alt={current.title}
              referrerPolicy="no-referrer"
              style={{
                objectFit: 'cover',
                objectPosition: current.objectPosition || 'center center'
              }}
              className="w-full h-full transition-all duration-700 ease-out"
            />
          </picture>
          {/* Gradiente sutil para legibilidade em tons areia/quentes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F1C18]/90 via-[#1F1C18]/40 to-[#1F1C18]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F1C18]/80 via-[#1F1C18]/20 to-transparent" />
        </div>

        {/* Conteúdo Textual e Botão de Ação */}
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-10">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4803E]/20 border border-[#F4803E]/50 text-[#FCD5BC] text-xs font-semibold backdrop-blur-xs">
              <Sun className="w-3.5 h-3.5 text-[#F4803E]" />
              <span className="uppercase tracking-widest text-[11px]">Moda Praia & Casual Masculina</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
              {current.title}
            </h1>

            <p className="text-[#F2EBE1] text-sm sm:text-base leading-relaxed max-w-lg font-light drop-shadow">
              {current.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="btn-hero-cta"
                onClick={handleCtaClick}
                className="bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-sm py-3.5 px-6 rounded-full shadow-lg transition-all flex items-center gap-2 group"
              >
                <span>{current.ctaText || 'Conhecer Coleção'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentPage('catalog')}
                className="bg-white/90 hover:bg-white text-[#2D2823] font-semibold text-sm py-3.5 px-6 rounded-full shadow-md transition-all backdrop-blur-xs"
              >
                Ver Catálogo Completo
              </button>
            </div>

          </div>
        </div>

        {/* Controles de Navegação (se houver mais de 1 banner) */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 hover:bg-white/60 text-white backdrop-blur-sm flex items-center justify-center transition-all z-20"
              aria-label="Banner anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % activeBanners.length)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 hover:bg-white/60 text-white backdrop-blur-sm flex items-center justify-center transition-all z-20"
              aria-label="Próximo banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Marcadores em Linha */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === i ? 'w-6 bg-[#F4803E]' : 'w-2 bg-white/50'
                  }`}
                  aria-label={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
