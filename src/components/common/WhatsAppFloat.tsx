import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { buildProductDoubtUrl } from '../../lib/whatsappOrder';
import { trackContactWhatsApp } from '../../lib/analytics';

export const WhatsAppFloat: React.FC = () => {
  const { settings, currentPage, selectedProduct } = useStore();
  const rawNumber = settings.whatsappNumber.replace(/\D/g, '') || '5581920019982';
  const defaultText = encodeURIComponent('Olá! Gostaria de informações sobre os produtos da Silva e Sol.');
  const whatsappUrl = currentPage === 'product' && selectedProduct
    ? buildProductDoubtUrl(selectedProduct, { ...settings, whatsappNumber: rawNumber })
    : `https://wa.me/${rawNumber}?text=${defaultText}`;

  return (
    <aside aria-label="Atendimento pelo WhatsApp">
      <a
        id="btn-whatsapp-floating"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContactWhatsApp('Botão Flutuante')}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-white/20"
        aria-label="Falar conosco pelo WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current text-white" />
        <span className="hidden sm:inline-block text-xs font-semibold tracking-wide pr-1">
          Dúvidas no WhatsApp
        </span>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
        </span>
      </a>
    </aside>
  );
};
