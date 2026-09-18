import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Truck, Lock, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const PoliciesPage: React.FC = () => {
  const { settings, setCurrentPage } = useStore();
  const [activeTab, setActiveTab] = useState<'returns' | 'shipping' | 'privacy'>('returns');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Voltar */}
        <button
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja</span>
        </button>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-100 tracking-tight">
            Políticas da Silva e Sol
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Transparência, respeito ao consumidor e compromisso com sua satisfação.
          </p>
        </div>

        {/* Abas */}
        <div className="flex border-b border-stone-800 gap-4 sm:gap-8 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('returns')}
            className={`pb-3 flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'returns'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Trocas e Devoluções</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Envios & Frete</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacidade & Dados</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 text-stone-300 space-y-6 text-sm leading-relaxed">
          
          {activeTab === 'returns' && (
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-lg text-stone-100 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-400" />
                Política de Trocas e Devoluções
              </h2>
              <p>{settings.returnPolicy}</p>
              <div className="space-y-2 text-xs text-stone-400 pt-2 border-t border-stone-800">
                <p><strong>1. Prazo:</strong> Conforme o Código de Defesa do Consumidor, você tem até 7 (sete) dias corridos a partir da data de entrega para solicitar a troca ou desistência.</p>
                <p><strong>2. Condições das Peças:</strong> Em conformidade com as normas sanitárias de moda íntima/praia (sungas), a peça não pode ter sido lavada, usada ou apresentar odores, mantendo o protetor higiênico e tags intactas.</p>
                <p><strong>3. Como solicitar:</strong> Basta enviar uma mensagem para nosso WhatsApp informando o número do pedido e o motivo da troca. Nossa equipe orientará o envio reverso imediatamente.</p>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-lg text-stone-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                Prazos e Métodos de Envio
              </h2>
              <p>{settings.shippingPolicy}</p>
              <div className="space-y-2 text-xs text-stone-400 pt-2 border-t border-stone-800">
                <p><strong>Postagem Rápida:</strong> Os pedidos com pagamento confirmado são separados e postados em até 1 a 2 dias úteis.</p>
                <p><strong>Código de Rastreio:</strong> Assim que a encomenda for despachada, você recebe o código de rastreamento oficial no WhatsApp para acompanhar cada etapa da entrega.</p>
                <p><strong>Frete Grátis:</strong> Compras acima do valor qualificado ganham benefício especial de frete gratuito.</p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-lg text-stone-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Segurança e Proteção de Dados (LGPD)
              </h2>
              <p>{settings.privacyPolicy}</p>
              <div className="space-y-2 text-xs text-stone-400 pt-2 border-t border-stone-800">
                <p><strong>Uso de Informações:</strong> Seu nome, telefone e endereço são solicitados exclusivamente com a finalidade de emitir seu comprovante de compra e efetuar a entrega das suas peças.</p>
                <p><strong>Não Compartilhamento:</strong> Não vendemos, alugamos ou repassamos seus dados a empresas terceirizadas de publicidade.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
