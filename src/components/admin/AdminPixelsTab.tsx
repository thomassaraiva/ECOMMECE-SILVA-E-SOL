import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Play, 
  Activity, 
  ShieldCheck, 
  Copy, 
  RefreshCw,
  Info,
  Layers,
  ShoppingBag,
  Eye,
  Search,
  Heart,
  MessageCircle,
  BarChart2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { 
  initializeAnalytics, 
  trackPageView, 
  trackViewContent, 
  trackAddToCart, 
  trackInitiateCheckout,
  trackSearch,
  trackAddToWishlist,
  trackContactWhatsApp
} from '../../lib/analytics';

export const AdminPixelsTab: React.FC = () => {
  const { settings, updateSettings, products } = useStore();

  const [metaPixelId, setMetaPixelId] = useState(settings.metaPixelId || '');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(settings.googleAnalyticsId || '');
  const [tiktokPixelId, setTiktokPixelId] = useState(settings.tiktokPixelId || '');
  const [enableTracking, setEnableTracking] = useState(settings.enableTracking ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [testEventLogs, setTestEventLogs] = useState<Array<{ id: string; time: string; event: string; target: string; status: string }>>([]);

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        metaPixelId: metaPixelId.trim(),
        googleAnalyticsId: googleAnalyticsId.trim(),
        tiktokPixelId: tiktokPixelId.trim(),
        enableTracking
      });

      // Reinicializa pixels em tempo real
      initializeAnalytics({
        metaPixelId: metaPixelId.trim(),
        googleAnalyticsId: googleAnalyticsId.trim(),
        tiktokPixelId: tiktokPixelId.trim(),
        enableTracking
      });

      triggerSuccess('Pixels de rastreamento salvos e ativos com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar pixels: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const logEvent = (event: string, target: string, status = 'Disparado') => {
    const time = new Date().toLocaleTimeString('pt-BR');
    const newLog = {
      id: Math.random().toString(36).substring(7),
      time,
      event,
      target,
      status
    };
    setTestEventLogs(prev => [newLog, ...prev.slice(0, 7)]);
  };

  // Disparo de eventos de teste
  const handleTestPageView = () => {
    trackPageView('Home - Teste Admin', '/teste-admin');
    logEvent('PageView', 'Meta, GA4 e TikTok');
    triggerSuccess('Evento PageView disparado para todos os pixels ativos!');
  };

  const handleTestViewContent = () => {
    const sampleProduct = products[0] || {
      id: 'prod-teste',
      name: 'Sunga Solar Nordeste Teste',
      price: 189.90,
      categoryId: 'sungas'
    };
    trackViewContent(sampleProduct as any);
    logEvent('ViewContent', `Produto: ${sampleProduct.name} (R$ ${sampleProduct.price.toFixed(2)})`);
    triggerSuccess(`Evento ViewContent disparado (${sampleProduct.name})!`);
  };

  const handleTestAddToCart = () => {
    const sampleProduct = products[0] || {
      id: 'prod-teste',
      name: 'Sunga Solar Nordeste Teste',
      price: 189.90,
      categoryId: 'sungas'
    };
    trackAddToCart(sampleProduct as any, 1, 'M', 'Azul Marinho');
    logEvent('AddToCart', `Produto: ${sampleProduct.name} x1`);
    triggerSuccess(`Evento AddToCart disparado!`);
  };

  const handleTestInitiateCheckout = () => {
    trackInitiateCheckout(
      [
        {
          id: 'cart-1',
          productId: 'p-1',
          name: 'Sunga Solar Clássica',
          price: 189.90,
          quantity: 1,
          selectedSize: 'M',
          selectedColor: 'Preto',
          image: '',
          maxStock: 10
        }
      ],
      189.90
    );
    logEvent('InitiateCheckout', 'Valor: R$ 189,90 (1 item)');
    triggerSuccess('Evento InitiateCheckout disparado!');
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

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-[#F4803E]" />
            <span>Pixels & Rastreamento (Tráfego Pago)</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Conecte o Meta Pixel (Instagram/Facebook), TikTok Ads e Google Analytics 4 para mensurar conversões e criar campanhas de anúncios com público qualificado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestPageView}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#F4803E]" />
            <span>Testar Disparo</span>
          </button>
        </div>
      </div>

      {/* Formulário de Configuração dos Pixels */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. Meta Pixel */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4 hover:border-blue-500/50 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                  f
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">Meta Pixel</h3>
                  <p className="text-[11px] text-stone-400">Instagram & Facebook Ads</p>
                </div>
              </div>
              
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                metaPixelId.trim().length >= 8
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-stone-800 text-stone-400'
              }`}>
                {metaPixelId.trim().length >= 8 ? 'Configurado' : 'Pendente'}
              </span>
            </div>

            <div>
              <label className="block text-stone-300 text-xs font-semibold mb-1.5">
                ID do Meta Pixel (Dataset ID)
              </label>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="Ex: 123456789012345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Encontrado no Gerenciador de Eventos da Meta &gt; Fontes de Dados.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
              <a
                href="https://business.facebook.com/events_manager2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Abrir Gerenciador de Eventos</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 2. Google Analytics 4 */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4 hover:border-amber-500/50 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  G
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">Google Analytics 4</h3>
                  <p className="text-[11px] text-stone-400">Google Tag & Google Ads</p>
                </div>
              </div>
              
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                googleAnalyticsId.trim().startsWith('G-')
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-stone-800 text-stone-400'
              }`}>
                {googleAnalyticsId.trim().startsWith('G-') ? 'Configurado' : 'Pendente'}
              </span>
            </div>

            <div>
              <label className="block text-stone-300 text-xs font-semibold mb-1.5">
                ID da Métrica (Measurement ID)
              </label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="Ex: G-XXXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Encontrado em Administrador do GA4 &gt; Fluxos de Dados &gt; Web.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Abrir Google Analytics</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 3. TikTok Pixel */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4 hover:border-pink-500/50 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold">
                  t
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">TikTok Pixel</h3>
                  <p className="text-[11px] text-stone-400">TikTok Ads Manager</p>
                </div>
              </div>
              
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tiktokPixelId.trim().length >= 8
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-stone-800 text-stone-400'
              }`}>
                {tiktokPixelId.trim().length >= 8 ? 'Configurado' : 'Pendente'}
              </span>
            </div>

            <div>
              <label className="block text-stone-300 text-xs font-semibold mb-1.5">
                ID do TikTok Pixel
              </label>
              <input
                type="text"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="Ex: C1234567890ABCDEF"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Encontrado em TikTok Ads &gt; Ativos &gt; Eventos da Web.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
              <a
                href="https://ads.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Abrir TikTok Ads</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Chave Geral de Ativação e Botão Salvar */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableTracking}
              onChange={(e) => setEnableTracking(e.target.checked)}
              className="w-5 h-5 accent-[#2A8882] rounded cursor-pointer"
            />
            <div>
              <p className="text-white text-xs sm:text-sm font-semibold">
                Rastreamento Ativo no Site
              </p>
              <p className="text-stone-400 text-[11px]">
                Quando ativado, os scripts e eventos são disparados automaticamente para os visitantes.
              </p>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Salvar Configurações de Pixels</span>
          </button>
        </div>
      </form>

      {/* Grid de Eventos Padrão Integrados */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-heading font-extrabold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Eventos Padrão de E-commerce Configurados</span>
          </h3>
          <p className="text-xs text-stone-400">
            Estes eventos já estão inseridos no código da aplicação e são transmitidos automaticamente conforme o cliente interage com a loja:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>PageView</span>
              </span>
              <span className="font-mono text-[10px] bg-stone-950 text-stone-300 px-1.5 py-0.5 rounded">
                Geral
              </span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Dispara na abertura de qualquer página (Home, Catálogo, Carrinho, etc).
            </p>
            <button
              onClick={handleTestPageView}
              className="mt-1 text-[11px] text-[#2A8882] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Play className="w-3 h-3" /> Testar disparo agora
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>ViewContent</span>
              </span>
              <span className="font-mono text-[10px] bg-stone-950 text-stone-300 px-1.5 py-0.5 rounded">
                Produtos
              </span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Dispara ao visualizar detalhes de qualquer produto com preço, moeda e ID.
            </p>
            <button
              onClick={handleTestViewContent}
              className="mt-1 text-[11px] text-[#2A8882] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Play className="w-3 h-3" /> Testar disparo agora
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>AddToCart</span>
              </span>
              <span className="font-mono text-[10px] bg-stone-950 text-stone-300 px-1.5 py-0.5 rounded">
                Carrinho
              </span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Dispara ao colocar qualquer peça no carrinho com tamanho e quantidade.
            </p>
            <button
              onClick={handleTestAddToCart}
              className="mt-1 text-[11px] text-[#2A8882] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Play className="w-3 h-3" /> Testar disparo agora
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                <span>InitiateCheckout</span>
              </span>
              <span className="font-mono text-[10px] bg-stone-950 text-stone-300 px-1.5 py-0.5 rounded">
                Conversão
              </span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Dispara no início do checkout ou ao solicitar finalização do pedido.
            </p>
            <button
              onClick={handleTestInitiateCheckout}
              className="mt-1 text-[11px] text-[#2A8882] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Play className="w-3 h-3" /> Testar disparo agora
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Search className="w-4 h-4 text-sky-400" />
                <span>Search</span>
              </span>
              <span className="font-mono text-[10px] bg-stone-950 text-stone-300 px-1.5 py-0.5 rounded">
                Busca
              </span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Envia os termos buscados pelo cliente no catálogo para otimizar anúncios.
            </p>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>Contact / Lead</span>
              </span>
              <span className="font-mono text-[10px] bg-stone-950 text-stone-300 px-1.5 py-0.5 rounded">
                Suporte
              </span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Registra cliques no botão de WhatsApp de atendimento ou dúvidas.
            </p>
          </div>

        </div>
      </div>

      {/* Histórico / Log de Testes em Tempo Real */}
      {testEventLogs.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Eventos Recentes Monitorados Nesta Sessão</span>
            </h4>
            <button
              onClick={() => setTestEventLogs([])}
              className="text-[11px] text-stone-400 hover:text-white"
            >
              Limpar
            </button>
          </div>

          <div className="space-y-2">
            {testEventLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-stone-950 border border-stone-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-stone-500">{log.time}</span>
                  <span className="font-bold text-emerald-400">{log.event}</span>
                  <span className="text-stone-300">&bull; {log.target}</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-800">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
