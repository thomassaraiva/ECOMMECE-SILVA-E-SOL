import React, { useState } from 'react';
import { MessageCircle, Instagram, Mail, Send, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Gerar link direto para WhatsApp com a mensagem do cliente
    const rawNumber = settings.whatsappNumber.replace(/\D/g, '') || '5585988776655';
    const text = `☀️ *MENSAGEM VIA SITE - SILVA E SOL*\n` +
      `*Nome:* ${name || 'Cliente'}\n` +
      `*Assunto:* ${subject || 'Dúvida Geral'}\n\n` +
      `*Mensagem:* ${message}`;

    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 text-xs font-semibold border border-emerald-700/40">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Atendimento Humanizado</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-stone-100 tracking-tight">
            Fale com a Silva e Sol
          </h1>
          <p className="text-stone-400 text-sm sm:text-base max-w-lg mx-auto">
            Estamos sempre disponíveis para tirar dúvidas sobre modelagem, tecidos, prazos de envio ou encomendas personalizadas.
          </p>
        </div>

        {/* Grid de Contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Informações Diretas */}
          <div className="space-y-4">
            
            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/50 transition-all flex items-start gap-4 group block"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-stone-100 group-hover:text-emerald-300">
                  WhatsApp Oficial
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Atendimento direto para os seus pedidos.
                </p>
                <span className="inline-block mt-2 text-xs font-mono font-bold text-amber-400">
                  {settings.whatsappNumber}
                </span>
              </div>
            </a>

            {/* Instagram Card */}
            <a
              href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-400/50 transition-all flex items-start gap-4 group block"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-900/30 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-stone-100 group-hover:text-amber-300">
                  Instagram
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Acompanhe lançamentos, bastidores de produção e fotos de clientes.
                </p>
                <span className="inline-block mt-2 text-xs font-bold text-stone-200">
                  {settings.instagramHandle}
                </span>
              </div>
            </a>

            {/* Email Card */}
            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-stone-100">
                  E-mail Comercial
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Para propostas comerciais, atacado e parcerias.
                </p>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="inline-block mt-2 text-xs font-medium text-amber-400 hover:underline"
                >
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            {/* Horário */}
            <div className="p-4 rounded-xl bg-stone-900/50 border border-stone-800 flex items-center gap-3 text-xs text-stone-400">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Atendimento via WhatsApp: Segunda a Sábado, das 08h às 20h.</span>
            </div>

          </div>

          {/* Formulário Rápido de Mensagem */}
          <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-stone-100 mb-1">
              Envie sua Mensagem
            </h3>
            <p className="text-xs text-stone-400 mb-6">
              Preencha os campos abaixo para conversar diretamente pelo WhatsApp com nossa equipe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como prefere ser chamado?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">Assunto</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Dúvida sobre tamanho/modelagem">Dúvida sobre tamanho/modelagem</option>
                  <option value="Cálculo de frete / Prazo">Cálculo de frete / Prazo</option>
                  <option value="Informações sobre atacado">Informações sobre atacado</option>
                  <option value="Outro assunto">Outro assunto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">Mensagem</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conte-nos o que você precisa..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Iniciar Conversa no WhatsApp</span>
              </button>

              {sent && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 justify-center pt-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Mensagem gerada! O WhatsApp foi aberto em uma nova aba.</span>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
