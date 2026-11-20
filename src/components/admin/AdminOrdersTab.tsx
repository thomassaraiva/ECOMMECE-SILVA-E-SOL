import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  CheckCircle,
  Truck,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Calendar,
  Mail,
  Copy,
  Send,
  RefreshCw,
  Info,
  ShieldCheck,
  Code
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types/ecommerce';
import { processMelhorEnvioWebhook } from '../../lib/melhorEnvioWebhook';
import { formatBRL } from '../../lib/format';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; border: string }> = {
  pending_whatsapp: { label: 'Pendente WhatsApp', color: 'bg-amber-950/80 text-amber-400', border: 'border-amber-800' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-950/80 text-blue-400', border: 'border-blue-800' },
  paid: { label: 'Pago', color: 'bg-emerald-950/80 text-emerald-400', border: 'border-emerald-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-950/80 text-purple-400', border: 'border-purple-800' },
  delivered: { label: 'Entregue', color: 'bg-teal-950/80 text-teal-400', border: 'border-teal-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-950/80 text-red-400', border: 'border-red-800' },
};

export const AdminOrdersTab: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderTracking } = useStore();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Estados do Simulador de Webhook Melhor Envio & Resend
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [selectedOrderForSimulation, setSelectedOrderForSimulation] = useState<Order | null>(null);
  const [simTrackingCode, setSimTrackingCode] = useState('');
  const [simCarrier, setSimCarrier] = useState('Correios SEDEX');
  const [simCustomerEmail, setSimCustomerEmail] = useState('');
  const [simIsLoading, setSimIsLoading] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [showWebhookDocs, setShowWebhookDocs] = useState(false);

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    triggerSuccess(`${label} copiado!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      triggerSuccess(`Status do pedido atualizado para "${STATUS_LABELS[newStatus].label}".`);
    } catch {
      // Só evita a rejeição não tratada: a mensagem já aparece na faixa de erro do painel (runAdmin).
    }
  };

  const handleOpenClientWhatsApp = (order: Order) => {
    const rawPhone = order.customerPhone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
    const text = encodeURIComponent(
      `Olá ${order.customerName}! Aqui é da equipe Silva e Sol referente ao seu pedido #${order.id.slice(-6).toUpperCase()}. Como podemos te ajudar?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const openSimulatorForOrder = (order: Order) => {
    setSelectedOrderForSimulation(order);
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    setSimTrackingCode(`ME${randomSuffix}BR`);
    setSimCarrier(order.shippingOption?.carrier || 'Correios SEDEX');
    setSimCustomerEmail(order.customerEmail || 'cliente@exemplo.com');
    setSimResult(null);
    setSimulatorOpen(true);
  };

  const handleExecuteWebhookSimulation = async () => {
    if (!simTrackingCode.trim()) {
      alert('Por favor, informe um código de rastreio.');
      return;
    }

    setSimIsLoading(true);
    setSimResult(null);

    const payload = {
      event: 'order.tracking',
      data: {
        id: `me_shipment_${Date.now()}`,
        protocol: `ORD-${Date.now().toString().slice(-6)}`,
        reference: selectedOrderForSimulation?.orderNumber || selectedOrderForSimulation?.id || 'SOL-123456',
        tracking: simTrackingCode.trim().toUpperCase(),
        status: 'posted',
        service_name: simCarrier,
        tracking_url: `https://melhorrastreio.com.br/rastreio/${simTrackingCode.trim().toUpperCase()}`,
        to: {
          name: selectedOrderForSimulation?.customerName || 'Cliente Silva e Sol',
          email: simCustomerEmail.trim()
        }
      }
    };

    try {
      // 1. Tenta acionar a rota local do backend Express
      let responseData: any = null;
      try {
        const res = await fetch('/api/webhooks/melhor-envio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          responseData = await res.json();
        }
      } catch (networkErr) {
        console.warn('Endpoint local indisponível, processando no cliente:', networkErr);
      }

      // Se a rota local não responder (ou em dev preview puro), processa via biblioteca
      if (!responseData) {
        responseData = await processMelhorEnvioWebhook(payload);
      }

      setSimResult(responseData);

      // Atualiza o estado da loja
      if (selectedOrderForSimulation) {
        await updateOrderTracking(selectedOrderForSimulation.id, {
          trackingCode: simTrackingCode.trim().toUpperCase(),
          carrier: simCarrier,
          trackingUrl: `https://melhorrastreio.com.br/rastreio/${simTrackingCode.trim().toUpperCase()}`
        });
      }

      triggerSuccess('Webhook processado! Pedido atualizado e notificação Resend disparada.');
    } catch (err: any) {
      console.error('Erro na simulação do webhook:', err);
      setSimResult({ success: false, error: err.message || 'Falha ao executar webhook' });
    } finally {
      setSimIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchTracking = order.trackingCode?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchPhone && !matchTracking) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white flex items-center gap-2.5">
            Gestão de Pedidos ({orders.length})
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Acompanhe pedidos, dados de rastreio do Melhor Envio e envio de e-mails automatizados via Resend.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowWebhookDocs(!showWebhookDocs)}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-[#2A8882]" />
            <span>{showWebhookDocs ? 'Ocultar Webhook' : 'Dados do Webhook'}</span>
          </button>

          {orders.length > 0 && (
            <button
              onClick={() => openSimulatorForOrder(orders[0])}
              className="px-4 py-2 rounded-xl bg-[#2A8882] hover:bg-[#23706b] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#2A8882]/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simular Webhook / Rastreio</span>
            </button>
          )}
        </div>
      </div>

      {/* Card de Documentação e Configuração do Webhook */}
      {showWebhookDocs && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#2A8882]" />
              <span>Webhook Melhor Envio & Notificações Resend</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              Pronto para Produção
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 bg-stone-950 p-4 rounded-xl border border-stone-800">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">
                URL da Rota do Webhook:
              </span>
              <div className="flex items-center justify-between gap-2 bg-stone-900 px-3 py-2 rounded-lg border border-stone-800 font-mono text-stone-200">
                <span className="truncate">/api/webhooks/melhor-envio</span>
                <button
                  onClick={() => handleCopy(`${window.location.origin}/api/webhooks/melhor-envio`, 'URL do Webhook')}
                  className="p-1 hover:text-white text-stone-400 cursor-pointer"
                  title="Copiar URL completa"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Insira esta URL no painel do <strong>Melhor Envio &gt; Configurações &gt; Webhooks</strong>. Eventos suportados: <code className="text-[#2A8882]">order.tracking</code>, <code className="text-[#2A8882]">order.posted</code>, <code className="text-[#2A8882]">order.label_created</code>.
              </p>
            </div>

            <div className="space-y-2 bg-stone-950 p-4 rounded-xl border border-stone-800">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">
                Serviço de E-mail (Resend):
              </span>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                Tão logo a etiqueta é gerada, o webhook atualiza o status para <strong>"Enviado"</strong>, armazena o código de rastreio e dispara um e-mail com layout de luxo da Silva e Sol com link direto para rastrear no <strong>Melhor Rastreio</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-400">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Configure <code>RESEND_API_KEY</code> no arquivo <code>.env</code> para envios reais.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, telefone, rastreio ou ID do pedido..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-60 px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
        >
          <option value="all">Todos os Status</option>
          <option value="pending_whatsapp">Pendente WhatsApp</option>
          <option value="confirmed">Confirmado</option>
          <option value="paid">Pago</option>
          <option value="shipped">Enviado (Com Rastreio)</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl divide-y divide-stone-800">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs sm:text-sm">Nenhum pedido encontrado com os filtros atuais.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending_whatsapp;
            const orderCode = order.orderNumber || order.id.slice(-6).toUpperCase();

            return (
              <div key={order.id} className="p-4 sm:p-5 hover:bg-stone-850/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Dados Básicos */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-stone-950 px-2.5 py-1 rounded-md border border-stone-800">
                        #{orderCode}
                      </span>
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        {order.customerName}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color} ${statusInfo.border}`}>
                        {statusInfo.label}
                      </span>

                      {/* Badge de Rastreamento (se houver) */}
                      {order.trackingCode && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2A8882]/20 text-[#2A8882] border border-[#2A8882]/40">
                          <Truck className="w-3 h-3" />
                          <span>{order.trackingCode}</span>
                          <a
                            href={order.trackingUrl || `https://melhorrastreio.com.br/rastreio/${order.trackingCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline ml-0.5 inline-flex items-center"
                            title="Rastrear no Melhor Rastreio"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>&bull;</span>
                      <span>{order.items.length} item(ns)</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400 font-extrabold text-sm">
                        Total: {formatBRL(order.total)}
                      </span>
                      {order.customerEmail && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-stone-300">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {order.customerEmail}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ações e Seletor de Status */}
                  <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-auto">
                    {/* Botão de Disparo do Webhook de Rastreio */}
                    <button
                      onClick={() => openSimulatorForOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 border border-purple-700 text-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Simular notificação de etiqueta gerada do Melhor Envio"
                    >
                      <Truck className="w-3.5 h-3.5 text-purple-300" />
                      <span>{order.trackingCode ? 'Reenviar Rastreio' : 'Gerar Rastreio'}</span>
                    </button>

                    {/* Botão de WhatsApp com o Cliente */}
                    {order.customerPhone && (
                      <button
                        onClick={() => handleOpenClientWhatsApp(order)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Abrir WhatsApp direto do cliente"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    {/* Alterar Status */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs font-semibold focus:outline-none focus:border-[#2A8882]"
                      >
                        <option value="pending_whatsapp">Pendente WhatsApp</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="paid">Pago</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>

                    {/* Ver Detalhes */}
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Ver detalhes dos itens e endereço"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Bloco Detalhado de Itens e Endereço */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Itens do Pedido */}
                    <div className="space-y-2 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                      <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">
                        Itens Selecionados no Carrinho:
                      </span>
                      <div className="space-y-2 divide-y divide-stone-900">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-white">{item.productName}</p>
                              <p className="text-[11px] text-stone-400">
                                {[
                                  item.size ? `Tam: ${item.size}` : null,
                                  item.color ? `Cor: ${item.color}` : null,
                                  item.model ? `Corte: ${item.model}` : null
                                ].filter(Boolean).join(' | ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-stone-300 font-semibold">{item.quantity}x {formatBRL(item.unitPrice)}</p>
                              <p className="text-emerald-400 font-bold">{formatBRL(item.quantity * item.unitPrice)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Endereço, Rastreamento e Dados de Envio */}
                    <div className="space-y-2.5 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                      <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">
                        Dados de Envio & Logística:
                      </span>
                      <div className="space-y-1.5 text-stone-300">
                        <p><strong className="text-stone-400">Cliente:</strong> {order.customerName}</p>
                        <p><strong className="text-stone-400">E-mail:</strong> {order.customerEmail || 'Não informado'}</p>
                        <p><strong className="text-stone-400">WhatsApp:</strong> {order.customerPhone}</p>
                        {order.customerAddress && (
                          <p><strong className="text-stone-400">Endereço:</strong> {order.customerAddress}</p>
                        )}
                        {order.customerCity && (
                          <p><strong className="text-stone-400">Cidade / UF:</strong> {order.customerCity}</p>
                        )}
                        {order.trackingCode && (
                          <div className="pt-2 mt-2 border-t border-stone-900 flex items-center justify-between bg-stone-900/60 p-2.5 rounded-lg">
                            <div>
                              <span className="text-[10px] text-stone-400 uppercase font-bold block">Rastreamento Melhor Envio:</span>
                              <span className="font-mono text-[#2A8882] font-bold text-xs">{order.trackingCode}</span>
                              <span className="text-stone-400 text-[11px] block">{order.trackingCarrier || 'Correios'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopy(order.trackingCode || '', 'Código de rastreio')}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 cursor-pointer"
                                title="Copiar código"
                              >
                                {copiedCode === order.trackingCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <a
                                href={order.trackingUrl || `https://melhorrastreio.com.br/rastreio/${order.trackingCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#2A8882] hover:bg-[#23706b] text-white text-xs flex items-center gap-1 cursor-pointer"
                                title="Abrir página de rastreio"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Simulador de Webhook do Melhor Envio */}
      {simulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Truck className="w-5 h-5 text-[#2A8882]" />
                <span>Simulador de Webhook Melhor Envio</span>
              </div>
              <button
                onClick={() => setSimulatorOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Simule a notificação de etiqueta gerada enviada pelo Melhor Envio para testar a atualização do status do pedido e o envio automático de e-mail via <strong>Resend</strong>.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1.5">
                  Pedido Selecionado:
                </label>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-stone-200">
                  <span className="font-bold text-white block">
                    #{selectedOrderForSimulation?.orderNumber || selectedOrderForSimulation?.id.slice(-6).toUpperCase()} - {selectedOrderForSimulation?.customerName}
                  </span>
                  <span className="text-stone-400 text-[11px]">
                    Total: {formatBRL(selectedOrderForSimulation?.total ?? 0)} • Status atual: {selectedOrderForSimulation?.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1.5">
                  Código de Rastreio (Gerado pelo Melhor Envio):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simTrackingCode}
                    onChange={(e) => setSimTrackingCode(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-xs focus:outline-none focus:border-[#2A8882]"
                    placeholder="Ex: ME123456789BR"
                  />
                  <button
                    onClick={() => setSimTrackingCode(`ME${Math.floor(100000000 + Math.random() * 900000000)}BR`)}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold transition-colors cursor-pointer"
                    title="Gerar outro código aleatório"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1.5">
                  Transportadora / Modalidade:
                </label>
                <select
                  value={simCarrier}
                  onChange={(e) => setSimCarrier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                >
                  <option value="Correios SEDEX">Correios SEDEX</option>
                  <option value="Correios PAC">Correios PAC</option>
                  <option value="Jadlog Package">Jadlog Package</option>
                  <option value="Jadlog Express">Jadlog Express</option>
                  <option value="Melhor Envio / Loggi">Melhor Envio / Loggi</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1.5">
                  E-mail do Destinatário (Para onde o Resend enviará):
                </label>
                <input
                  type="email"
                  value={simCustomerEmail}
                  onChange={(e) => setSimCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                  placeholder="cliente@exemplo.com"
                />
              </div>

              {/* Resultado do Teste */}
              {simResult && (
                <div className={`p-3.5 rounded-xl border ${simResult.success ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'}`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {simResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
                    <span>{simResult.success ? 'Sucesso no Processamento' : 'Falha no Processamento'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed mb-2">
                    {simResult.message || simResult.error}
                  </p>
                  {simResult.emailResult && (
                    <div className="text-[11px] bg-stone-950/80 p-2.5 rounded-lg border border-stone-800 text-stone-300 space-y-1">
                      <p><strong>Status do Resend:</strong> {simResult.emailResult.simulated ? 'Simulação Local (Sem chave no .env)' : 'Disparo Concluído via Resend API'}</p>
                      {simResult.emailResult.emailId && <p><strong>ID da Mensagem:</strong> {simResult.emailResult.emailId}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-stone-800 pt-4">
              <button
                onClick={() => setSimulatorOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={handleExecuteWebhookSimulation}
                disabled={simIsLoading}
                className="px-5 py-2 rounded-xl bg-[#2A8882] hover:bg-[#23706b] disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#2A8882]/20"
              >
                {simIsLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Disparando Webhook...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Webhook & E-mail</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
