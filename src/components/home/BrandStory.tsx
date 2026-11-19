import React from 'react';
import { Sun, Waves, ShieldCheck, Feather, ArrowRight, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const BrandStory: React.FC = () => {
  const { setCurrentPage, settings } = useStore();

  return (
    <section className="py-16 sm:py-24 bg-[#F5EFE6] text-[#2D2823] border-t border-[#E6DDD0] relative overflow-hidden">
      {/* Detalhe estético de fundo suave */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4803E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2A8882]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Imagem Institucional Silva e Sol */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg border border-[#E0D5C3] bg-[#EAE2D5]">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
                alt="Praia e essência Silva e Sol"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E6DDD0] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF2EA] text-[#F4803E] flex items-center justify-center font-bold">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2D2823]">Feito sob a Luz do Sol</h4>
                    <p className="text-[11px] text-[#736A5E]">Modelagens leves desenvolvidas para o homem solar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Texto Institucional */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F4F3] text-[#2A8882] border border-[#B5DCD9] text-xs font-semibold">
              <Waves className="w-3.5 h-3.5" />
              <span>Autenticidade & Conforto Térmico</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#2D2823] tracking-tight leading-tight">
              A Essência Despretensiosa de Quem Vive o Sol — Do Seu Jeito
            </h2>

            <p className="text-[#524B42] text-sm sm:text-base leading-relaxed">
              {settings.aboutText}
            </p>

            {/* Três Pilares da Marca */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#FEF2EA] flex items-center justify-center text-[#F4803E] mb-2.5">
                  <Sun className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-[#2D2823] mb-1">Frescor</h5>
                <p className="text-[11px] text-[#736A5E]">Peças leves e de secagem rápida.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#E8F4F3] flex items-center justify-center text-[#2A8882] mb-2.5">
                  <Feather className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-[#2D2823] mb-1">Caimento Preciso</h5>
                <p className="text-[11px] text-[#736A5E]">Forro interno em microfibra e cordão de ajuste na cintura.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#FEF2EA] flex items-center justify-center text-[#F4803E] mb-2.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-[#2D2823] mb-1">Compra Transparente</h5>
                <p className="text-[11px] text-[#736A5E]">Atendimento direto pelo WhatsApp.</p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setCurrentPage('about')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold tracking-wide shadow-sm transition-all"
              >
                <span>Conheça Nossa História</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Estava navegando no site da Silva e Sol e gostaria de falar com a equipe.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#FAF7F2] text-[#2D2823] border border-[#E0D5C3] text-xs font-semibold shadow-2xs transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#2A8882]" />
                <span>Chamar no WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
