import React from 'react';
import { Sun, Waves, Sparkles, Heart, Compass, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AboutPage: React.FC = () => {
  const { settings, setCurrentPage } = useStore();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Nossa Trajetória</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-stone-100 tracking-tight">
            A Alma da Silva e Sol
          </h1>
          <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto">
            Mais que uma marca de moda praia: um manifesto de calor, elegância natural e autenticidade masculina.
          </p>
        </div>

        {/* Imagem de Destaque */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
            alt="Praia do Nordeste ao entardecer"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-xs text-stone-300 font-medium">
            Litoral do Nordeste Brasileiro • Origem da Silva e Sol
          </div>
        </div>

        {/* Narrativa da Marca */}
        <div className="prose prose-invert max-w-none text-stone-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="text-lg sm:text-xl text-stone-200 font-light leading-relaxed">
            {settings.aboutText}
          </p>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 my-8">
            <h3 className="font-heading font-bold text-lg text-amber-400 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Nossa Missão
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              {settings.aboutMission}
            </p>
          </div>

          <h3 className="font-heading font-bold text-xl text-stone-100 mt-8 mb-3">
            O Que Torna Nossas Peças Únicas
          </h3>
          <p>
            Não acreditamos em estampas passageiras ou modelagens genéricas. Cada sunga da Silva e Sol é pensada com forro duplo que não junta areia, elástico que não perde a tensão após o contato com a água salobra e cordões reforçados que garantem estabilidade para o banho de mar ou a prática esportiva.
          </p>
          <p>
            Nossas camisetas e regatas utilizam tramas nobres de algodão pré-lavado, que mantêm a maciez e não encolhem, permitindo uma transição orgânica do calçadão à noite na cidade.
          </p>
        </div>

        {/* Cartões de Valores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-center">
            <Sun className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h4 className="font-heading font-bold text-sm text-stone-100">Energia Solar</h4>
            <p className="text-xs text-stone-400 mt-1">Cores vivas e tons terrosos inspirados na luz tropical.</p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-center">
            <Waves className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h4 className="font-heading font-bold text-sm text-stone-100">Vida ao Ar Livre</h4>
            <p className="text-xs text-stone-400 mt-1">Peças leves, secagem rápida e proteção UV50+ permanente.</p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-center">
            <Compass className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h4 className="font-heading font-bold text-sm text-stone-100">Design Masculino Real</h4>
            <p className="text-xs text-stone-400 mt-1">Cortes anatômicos que vestem com segurança e elegância.</p>
          </div>
        </div>

        {/* CTA para Compras */}
        <div className="text-center pt-8 border-t border-stone-800">
          <button
            onClick={() => setCurrentPage('catalog')}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 px-8 rounded-full shadow-lg transition-colors text-sm"
          >
            <span>Ver Peças da Coleção</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
