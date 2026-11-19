import React from 'react';
import { Instagram, MessageCircle, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const { setCurrentPage, navigateToCategory, categories, settings } = useStore();

  return (
    <footer className="bg-[#F5EFE6] text-[#524B42] pt-14 pb-24 md:pb-14 border-t border-[#E6DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Coluna 1 e 2: Marca Silva e Sol com Logo Oficial */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-left focus:outline-none"
              aria-label="Página Inicial"
            >
              <Logo variant="horizontal" size="md" />
            </button>
            
            <p className="text-sm text-[#736A5E] leading-relaxed max-w-sm">
              {settings.tagline}. Moda praia e casual masculina autêntica, fresca e contemporânea feita sob a energia do sol e a brisa do mar.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E0D5C3] flex items-center justify-center text-[#736A5E] hover:text-[#F4803E] hover:border-[#F4803E] shadow-2xs transition-colors"
                aria-label="Instagram da Silva e Sol"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E0D5C3] flex items-center justify-center text-[#736A5E] hover:text-[#2A8882] hover:border-[#2A8882] shadow-2xs transition-colors"
                aria-label="WhatsApp da Silva e Sol"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="w-10 h-10 rounded-full bg-white border border-[#E0D5C3] flex items-center justify-center text-[#736A5E] hover:text-[#2A8882] hover:border-[#2A8882] shadow-2xs transition-colors"
                aria-label="Email de Contato"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Coluna 3: Coleções */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#2A8882] font-bold mb-4">
              Coleções
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigateToCategory(cat.id)}
                    className="text-[#736A5E] hover:text-[#2A8882] transition-colors flex items-center gap-1 group"
                  >
                    <span>{cat.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setCurrentPage('catalog')}
                  className="text-[#F4803E] font-medium hover:underline text-xs"
                >
                  Ver Todo o Catálogo →
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Institucional & Ajuda */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#2A8882] font-bold mb-4">
              Institucional
            </h4>
            <ul className="space-y-2.5 text-sm text-[#736A5E]">
              <li>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="hover:text-[#2A8882] transition-colors"
                >
                  A Alma Silva e Sol
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="hover:text-[#2A8882] transition-colors"
                >
                  Atendimento & WhatsApp
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('policies')}
                  className="hover:text-[#2A8882] transition-colors"
                >
                  Trocas, Devoluções e Frete
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('policies')}
                  className="hover:text-[#2A8882] transition-colors"
                >
                  Privacidade & Segurança
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 5: Atendimento & Segurança */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#2A8882] font-bold mb-4">
              Compra Confiável
            </h4>
            <div className="space-y-3 text-xs text-[#736A5E]">
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-[#E6DDD0] shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#2A8882] shrink-0 mt-0.5" />
                <span>Atendimento humano com suporte dedicado.</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentPage('admin-panel');
                    window.location.hash = 'admin';
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#9E9484] hover:text-[#524B42] underline cursor-pointer"
                >
                  Acesso Administrativo (Lojista)
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé inferior com direitos autorais */}
        {(settings.legalName || settings.cnpj || settings.address) && (
          <p className="mt-12 text-[11px] leading-relaxed text-[#8A8072]">
            {[settings.legalName, settings.cnpj && `CNPJ ${settings.cnpj}`, settings.address].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="mt-4 pt-8 border-t border-[#E6DDD0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A8072] gap-4">
          <p>© {new Date().getFullYear()} SILVA E SOL. Todos os direitos reservados. Feito do seu jeito.</p>
          <p className="flex items-center gap-1.5 text-[#736A5E]">
            <span>Energia solar e moda masculina autêntica ☀️</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
