import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Truck, 
  Check, 
  X, 
  ExternalLink,
  ChevronDown,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types/ecommerce';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; border: string }> = {
  pending_whatsapp: { label: 'Pendente WhatsApp', color: 'bg-amber-950/80 text-amber-400', border: 'border-amber-800' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-950/80 text-blue-400', border: 'border-blue-800' },
  paid: { label: 'Pago', color: 'bg-emerald-950/80 text-emerald-400', border: 'border-emerald-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-950/80 text-purple-400', border: 'border-purple-800' },
  delivered: { label: 'Entregue', color: 'bg-teal-950/80 text-teal-400', border: 'border-teal-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-950/80 text-red-400', border: 'border-red-800' },
};

export const AdminOrdersTab: React.FC = () => {
  const { orders, updateOrderStatus, settings } = useStore();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 2500);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    triggerSuccess(`Status do pedido atualizado para "${STATUS_LABELS[newStatus].label}".`);
  };

  const handleOpenClientWhatsApp = (order: Order) => {
    const rawPhone = order.customerPhone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
    const text = encodeURIComponent(
      `Olá ${order.customerName}! Aqui é da equipe Silva e Sol referente ao seu pedido #${order.id.slice(-6).toUpperCase()}. Como podemos te ajudar?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      if (!matchName && !matchId && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
            Gestão de Pedidos ({orders.length})
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Acompanhe pedidos iniciados na loja e pelo WhatsApp oficial (5581920019982), atualize status de entrega e contate clientes.
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, telefone ou ID do pedido..."
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
          <option value="shipped">Enviado</option>
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

            return (
              <div key={order.id} className="p-4 sm:p-5 hover:bg-stone-850/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Dados Básicos */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-stone-950 px-2 py-0.5 rounded-md border border-stone-800">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        {order.customerName}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color} ${statusInfo.border}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>&bull;</span>
                      <span>{order.items.length} item(ns)</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400 font-extrabold text-sm">
                        Total: R$ {order.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Ações e Seletor de Status */}
                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
                    {/* Botão de WhatsApp com o Cliente */}
                    {order.customerPhone && (
                      <button
                        onClick={() => handleOpenClientWhatsApp(order)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Abrir WhatsApp direto do cliente"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Falar no WhatsApp</span>
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
                              <p className="text-stone-300 font-semibold">{item.quantity}x R$ {item.unitPrice.toFixed(2).replace('.', ',')}</p>
                              <p className="text-emerald-400 font-bold">R$ {(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Endereço e Dados de Envio */}
                    <div className="space-y-2 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                      <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">
                        Dados de Envio & Contato:
                      </span>
                      <div className="space-y-1.5 text-stone-300">
                        <p><strong className="text-stone-400">Cliente:</strong> {order.customerName}</p>
                        <p><strong className="text-stone-400">WhatsApp:</strong> {order.customerPhone}</p>
                        {order.customerAddress && (
                          <p><strong className="text-stone-400">Endereço:</strong> {order.customerAddress}</p>
                        )}
                        {order.customerCity && (
                          <p><strong className="text-stone-400">Cidade / UF:</strong> {order.customerCity}</p>
                        )}
                        {order.customerNotes && (
                          <p><strong className="text-stone-400">Observações:</strong> {order.customerNotes}</p>
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
    </div>
  );
};
