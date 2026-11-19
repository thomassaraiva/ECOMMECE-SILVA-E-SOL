import React from 'react';

interface StoreStatusProps {
  isLoading: boolean;
  loadError: string | null;
  hasProducts: boolean;
  whatsappNumber: string;
  onRetry: () => void;
}

export const StoreStatus: React.FC<StoreStatusProps> = ({ isLoading, loadError, hasProducts, whatsappNumber, onRetry }) => {
  if (isLoading) {
    return (
      <p role="status" className="py-16 text-center text-sm text-[#524B42]">
        Carregando a loja…
      </p>
    );
  }
  if (loadError) {
    return (
      <section className="py-16 px-4 text-center">
        <h2 className="font-heading text-xl font-bold text-[#2D2823]">Não foi possível carregar a loja agora</h2>
        <p className="mt-2 text-sm text-[#524B42]">Verifique sua conexão e tente de novo em instantes.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-[#2A8882] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#22706A]"
        >
          Tentar de novo
        </button>
      </section>
    );
  }
  if (hasProducts) return null;
  return (
    <section className="py-16 px-4 text-center">
      <h2 className="font-heading text-xl font-bold text-[#2D2823]">Novidades chegando em breve</h2>
      <p className="mt-2 text-sm text-[#524B42]">Enquanto isso, fale com a gente e conheça as peças.</p>
      <a
        href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-xl bg-[#2A8882] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#22706A]"
      >
        Falar no WhatsApp
      </a>
    </section>
  );
};
