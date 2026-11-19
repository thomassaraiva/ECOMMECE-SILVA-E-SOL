import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoryGrid: React.FC = () => {
  const { categories, navigateToCategory } = useStore();
  const activeCats = categories.filter(c => c.isActive);

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#2A8882] font-bold">
              Explore por Linha
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2D2823] tracking-tight mt-1">
              Coleções Feitas para o Sol
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#736A5E] max-w-sm">
            Cortes anatômicos para o homem que valoriza elegância e leveza.
          </p>
        </div>

        {/* Grade Responsiva de Categorias */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {activeCats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigateToCategory(cat.id)}
              className="group relative h-48 sm:h-60 rounded-2xl overflow-hidden bg-[#F5EFE6] text-left border border-[#E8DEC8] hover:border-[#2A8882] transition-all duration-300 shadow-2xs hover:shadow-md focus:outline-none"
            >
              {/* Imagem de Fundo */}
              <img
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1C18]/90 via-[#1F1C18]/30 to-transparent" />

              {/* Informações da Categoria */}
              <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col justify-end z-10">
                <span className="font-heading font-extrabold text-sm sm:text-base text-white group-hover:text-[#FCD5BC] transition-colors tracking-wide">
                  {cat.name}
                </span>
                <span className="text-[11px] text-[#E6DDD0] group-hover:text-white flex items-center gap-1 mt-0.5">
                  <span>Ver peças</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
