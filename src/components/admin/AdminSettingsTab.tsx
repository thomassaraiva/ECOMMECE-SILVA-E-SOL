import React, { useState } from 'react';
import { 
  Settings, 
  Check, 
  MessageCircle, 
  Instagram, 
  Mail, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  DollarSign,
  KeyRound,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export const AdminSettingsTab: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const { currentCredentials, resetCredentials } = useAuth();

  const [storeName, setStoreName] = useState(settings.storeName || 'Silva e Sol');
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline || 'Moda Masculina Praia & Solar');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '5581920019982');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || 'contato@silvaesol.com.br');
  const [instagramHandle, setInstagramHandle] = useState(settings.instagramHandle || '@silvaesol');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold || 249.90);
  const [exchangePolicy, setExchangePolicy] = useState(
    settings.exchangePolicy || 
    'Primeira troca grátis em até 30 dias após o recebimento. As peças devem estar sem uso, com etiquetas originais e higiênico preservado.'
  );
  const [shippingInfo, setShippingInfo] = useState(
    settings.shippingInfo || 
    'Enviamos para todo o Brasil com rastreio expresso via Correios e transportadoras parceiras. Frete grátis para compras acima do valor estipulado.'
  );
  const [privacyPolicy, setPrivacyPolicy] = useState(
    settings.privacyPolicy || 
    'Seus dados de navegação e compras são protegidos e tratados sob estritas normas de sigilo e LGPD.'
  );

  // Gestão de Credenciais Administrativas
  const [adminUsername, setAdminUsername] = useState(currentCredentials.username);
  const [adminPassword, setAdminPassword] = useState(currentCredentials.password);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [credMessage, setCredMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);
    const res = resetCredentials(adminUsername, adminPassword);
    if (res.success) {
      setCredMessage({ type: 'success', text: res.message });
      setTimeout(() => setCredMessage(null), 4000);
    } else {
      setCredMessage({ type: 'error', text: res.message });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveErrorMsg('');
    try {
      await updateSettings({
        storeName: storeName.trim(),
        storeTagline: storeTagline.trim(),
        whatsappNumber: whatsappNumber.trim().replace(/\D/g, ''),
        contactEmail: contactEmail.trim(),
        instagramHandle: instagramHandle.trim(),
        freeShippingThreshold: Number(freeShippingThreshold),
        exchangePolicy: exchangePolicy.trim(),
        shippingInfo: shippingInfo.trim(),
        privacyPolicy: privacyPolicy.trim()
      });
      setActionSuccess('Configurações da loja salvas com sucesso!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      // Os campos continuam preenchidos; a mensagem aparece junto ao botão de salvar.
      setSaveErrorMsg(err.message || 'Não foi possível salvar as configurações.');
    } finally {
      setIsSaving(false);
    }
  };

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
            Configurações Gerais da Loja
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Canais de atendimento oficiais, número do WhatsApp para pedidos, frete grátis, termos legais e credenciais de acesso.
          </p>
        </div>
      </div>

      {/* Seção de Credenciais de Acesso Administrativo */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4803E] flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            <span>Credenciais de Acesso Administrativo (Login & Senha)</span>
          </h3>
          <span className="text-[11px] text-stone-400">
            Você pode alterar o usuário e a senha a qualquer momento
          </span>
        </div>

        {credMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            credMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
              : 'bg-red-950/80 border border-red-700 text-red-200'
          }`}>
            <Check className="w-4 h-4" />
            <span>{credMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Usuário do Painel
            </label>
            <input
              type="text"
              required
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Senha do Painel
            </label>
            <div className="relative">
              <input
                type={showAdminPass ? 'text' : 'password'}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
              />
              <button
                type="button"
                onClick={() => setShowAdminPass(!showAdminPass)}
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
              >
                {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F4803E] hover:bg-[#E06D2B] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Novo Login/Senha</span>
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identidade e Canais */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Identidade & Contato Oficial</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Nome da Loja</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Slogan / Tagline</label>
              <input
                type="text"
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* WhatsApp Oficial */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Oficial dos Pedidos *</span>
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="5581920019982"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-emerald-800/80 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Formato com DDI e DDD: 5581920019982
              </span>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram Oficial</span>
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@silvaesol"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
              />
            </div>

            {/* Email de Contato */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>E-mail Comercial</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contato@silvaesol.com.br"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
              />
            </div>
          </div>
        </div>

        {/* Políticas e Frete */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Frete Grátis & Políticas Comerciais</span>
          </h3>

          <div className="w-full sm:w-72">
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Valor Mínimo para Frete Grátis (R$)
            </label>
            <div className="flex items-center rounded-xl bg-stone-950 border border-stone-800 overflow-hidden">
              <span className="px-3 text-stone-400 font-bold bg-stone-900 py-2.5">R$</span>
              <input
                type="number"
                step="0.01"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 text-white font-bold text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Política de Trocas e Devoluções
              </label>
              <textarea
                rows={3}
                value={exchangePolicy}
                onChange={(e) => setExchangePolicy(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Prazos e Condições de Envio
              </label>
              <textarea
                rows={3}
                value={shippingInfo}
                onChange={(e) => setShippingInfo(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Política de Privacidade
              </label>
              <textarea
                rows={3}
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
              />
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          {saveErrorMsg && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
              {saveErrorMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Configurações Gerais'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
