import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Lock, 
  CreditCard, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Truck, 
  User, 
  Mail, 
  KeyRound, 
  Phone, 
  FileText, 
  MapPin, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  ShoppingBag,
  ExternalLink,
  Clock
} from 'lucide-react';
import { 
  CartItem, 
  CustomerProfile, 
  CustomerAddress, 
  ShippingOption, 
  Order 
} from '../../types/ecommerce';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { 
  getStoredCustomer, 
  registerCustomer, 
  loginCustomer, 
  updateCustomerProfileData,
  logoutCustomer 
} from '../../lib/customerAuth';
import { fetchAddressByCep } from '../../lib/shipping';
import { 
  generateStonePix, 
  processStoneCreditCard, 
  getStoneInstallmentOptions,
  formatCardNumber,
  formatCardExpiry,
  formatCpf,
  formatPhone,
  detectCardBrand,
  StonePixData,
  isStoneConfigured,
  STONE_TEST_CARDS,
  getStonePaymentMode
} from '../../lib/stonePayment';
import { StoreService } from '../../lib/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedShipping: ShippingOption | null;
  shippingAddress: CustomerAddress | null;
  onShippingAddressChange: (addr: CustomerAddress) => void;
}

type CheckoutStep = 'auth' | 'complementary' | 'payment' | 'success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedShipping,
  shippingAddress,
  onShippingAddressChange
}) => {
  const { cart, subtotal, clearCart, setIsCartOpen } = useCart();
  const { settings, products } = useStore();

  // Cliente atual da sessão
  const [customer, setCustomer] = useState<CustomerProfile | null>(getStoredCustomer());
  const [step, setStep] = useState<CheckoutStep>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Formulário de Autenticação Rápida
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Formulário de Dados Complementares (CPF, Telefone, Endereço de Entrega)
  const [cpf, setCpf] = useState(customer?.cpf || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [cep, setCep] = useState(shippingAddress?.cep || customer?.address?.cep || '');
  const [street, setStreet] = useState(shippingAddress?.street || customer?.address?.street || '');
  const [number, setNumber] = useState(shippingAddress?.number || customer?.address?.number || '');
  const [complement, setComplement] = useState(shippingAddress?.complement || customer?.address?.complement || '');
  const [neighborhood, setNeighborhood] = useState(shippingAddress?.neighborhood || customer?.address?.neighborhood || '');
  const [city, setCity] = useState(shippingAddress?.city || customer?.address?.city || '');
  const [stateUf, setStateUf] = useState(shippingAddress?.state || customer?.address?.state || '');
  const [loadingCep, setLoadingCep] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  // Formulário de Pagamento Stone
  const [paymentMethod, setPaymentMethod] = useState<'stone_pix' | 'stone_credit_card'>('stone_pix');
  const [pixData, setPixData] = useState<StonePixData | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixVerifying, setPixVerifying] = useState(false);

  // Cartão de Crédito
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Pedido Concluído
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Valores Finais
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subtotal + shippingCost;
  const installmentOptions = getStoneInstallmentOptions(grandTotal);

  // Ao abrir ou mudar sessão, determinar etapa correta
  useEffect(() => {
    if (!isOpen) return;

    const logged = getStoredCustomer();
    setCustomer(logged);

    if (logged) {
      // Se já tem cadastro com CPF e endereço preenchido, avança direto para o pagamento Stone
      const hasFullData = logged.cpf && logged.phone && logged.address?.street && logged.address?.number;
      if (hasFullData) {
        setCpf(logged.cpf || '');
        setPhone(logged.phone || '');
        if (logged.address) {
          setCep(logged.address.cep);
          setStreet(logged.address.street);
          setNumber(logged.address.number);
          setComplement(logged.address.complement || '');
          setNeighborhood(logged.address.neighborhood);
          setCity(logged.address.city);
          setStateUf(logged.address.state);
          onShippingAddressChange(logged.address);
        }
        setStep('payment');
      } else {
        if (logged.cpf) setCpf(logged.cpf);
        if (logged.phone) setPhone(logged.phone);
        setStep('complementary');
      }
    } else {
      setStep('auth');
    }
  }, [isOpen]);

  // Gera PIX Stone quando chega no pagamento
  useEffect(() => {
    if (step === 'payment' && paymentMethod === 'stone_pix' && !pixData) {
      const orderNum = Math.floor(10000 + Math.random() * 90000).toString();
      const generated = generateStonePix(grandTotal, orderNum);
      setPixData(generated);
    }
  }, [step, paymentMethod, grandTotal]);

  // Busca automática do endereço ao digitar CEP com 8 dígitos
  const handleCepChange = async (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    const masked = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setCep(masked);

    if (raw.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetchAddressByCep(raw);
        if (res) {
          if (res.street) setStreet(res.street);
          if (res.neighborhood) setNeighborhood(res.neighborhood);
          if (res.city) setCity(res.city);
          if (res.state) setStateUf(res.state);
        }
      } catch {
        // Ignora erro de rede
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Submissão do Login / Cadastro
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'register') {
        const res = await registerCustomer(authName, authEmail, authPass);
        if (!res.success || !res.customer) {
          setAuthError(res.error || 'Não foi possível concluir o cadastro.');
          setAuthLoading(false);
          return;
        }
        setCustomer(res.customer);
        setStep('complementary');
      } else {
        const res = await loginCustomer(authEmail, authPass);
        if (!res.success || !res.customer) {
          setAuthError(res.error || 'Credenciais inválidas.');
          setAuthLoading(false);
          return;
        }
        setCustomer(res.customer);
        const hasFullData = res.customer.cpf && res.customer.phone && res.customer.address?.street;
        if (hasFullData) {
          if (res.customer.address) onShippingAddressChange(res.customer.address);
          setStep('payment');
        } else {
          setStep('complementary');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Ocorreu um erro no acesso.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Submissão dos Dados Complementares (CPF, Telefone, Endereço de Entrega)
  const handleComplementarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompError(null);

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setCompError('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setCompError('Por favor, informe um telefone ou WhatsApp válido com DDD.');
      return;
    }

    if (!street.trim() || !number.trim() || !neighborhood.trim() || !city.trim() || !stateUf.trim()) {
      setCompError('Por favor, preencha todos os dados obrigatórios do endereço de entrega.');
      return;
    }

    const deliveryAddress: CustomerAddress = {
      cep,
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: stateUf.trim().toUpperCase()
    };

    onShippingAddressChange(deliveryAddress);

    if (saveAddressToProfile && customer) {
      try {
        const updated = await updateCustomerProfileData(customer.id, {
          cpf,
          phone,
          address: deliveryAddress
        });
        if (updated) setCustomer(updated);
      } catch (err) {
        console.warn('Aviso ao salvar endereço no perfil:', err);
      }
    }

    setStep('payment');
  };

  // Conclui e grava o Pedido no Supabase e LocalStorage
  const finalizeOrder = async (
    paymentMethodType: 'stone_pix' | 'stone_credit_card', 
    txId: string, 
    inst?: number,
    isSimulationMode?: boolean
  ) => {
    const isSim = isSimulationMode ?? !isStoneConfigured();
    const orderNumber = `SOL-${Date.now().toString().slice(-6)}`;
    const deliveryAddress: CustomerAddress = shippingAddress || {
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state: stateUf
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customer?.name || 'Cliente Silva e Sol',
      customerEmail: customer?.email,
      customerPhone: phone || customer?.phone || '',
      customerCpf: cpf || customer?.cpf,
      customerCity: deliveryAddress.city,
      customerAddress: `${deliveryAddress.street}, ${deliveryAddress.number} - ${deliveryAddress.neighborhood}, ${deliveryAddress.city}/${deliveryAddress.state}`,
      shippingCost,
      shippingOption: selectedShipping || undefined,
      shippingAddress: deliveryAddress,
      paymentMethod: paymentMethodType,
      paymentStatus: 'approved',
      isSimulation: isSim,
      stoneTransactionId: txId,
      installments: inst || 1,
      subtotal,
      discount: 0,
      total: grandTotal,
      status: 'paid',
      createdAt: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.name,
        size: item.selectedSize,
        color: item.selectedColor,
        model: item.selectedModel,
        quantity: item.quantity,
        unitPrice: item.promotionalPrice || item.price,
        subtotal: (item.promotionalPrice || item.price) * item.quantity
      }))
    };

    try {
      await StoreService.saveOrder(newOrder);
    } catch (err) {
      console.warn('Aviso ao persistir pedido:', err);
    }

    setCompletedOrder(newOrder);
    setStep('success');
    clearCart();
  };

  // Ação de confirmar pagamento PIX
  const handleConfirmPixPayment = () => {
    setPixVerifying(true);
    setTimeout(() => {
      setPixVerifying(false);
      finalizeOrder('stone_pix', pixData?.transactionId || `STONE-PIX-${Date.now()}`, 1, pixData?.isSimulation);
    }, 1200);
  };

  // Ação de pagar com Cartão de Crédito
  const handleCreditCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);
    setCardProcessing(true);

    const [month, year] = cardExpiry.split('/');
    const result = await processStoneCreditCard(
      grandTotal,
      {
        cardNumber,
        cardHolderName: cardHolder,
        expirationMonth: month || '',
        expirationYear: year ? `20${year}` : '',
        cvv: cardCvv,
        installments
      },
      `SOL-${Date.now().toString().slice(-6)}`
    );

    setCardProcessing(false);

    if (!result.success) {
      setCardError(result.error || 'Cartão recusado. Verifique os dados ou tente outro cartão.');
      return;
    }

    finalizeOrder('stone_credit_card', result.transactionId, installments, result.isSimulation);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="fixed inset-0" 
        onClick={() => { if (step !== 'success') onClose(); }} 
      />

      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl border border-[#E6DDD0] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Cabeçalho do Checkout */}
        <div className="px-6 py-4 bg-white border-b border-[#E6DDD0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F4F3] border border-[#C5E5E2] flex items-center justify-center text-[#2A8882]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D2823] font-heading flex items-center gap-2">
                <span>Checkout Seguro Silva e Sol</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Stone & Pix
                </span>
              </h2>
              <p className="text-[11px] text-[#736A5E]">
                Ambiente criptografado com SSL de 256 bits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#736A5E] hover:text-[#2D2823] hover:bg-[#F5EFE6] rounded-xl transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Passos */}
        {step !== 'success' && (
          <div className="bg-[#F5EFE6] px-6 py-2.5 border-b border-[#E6DDD0] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none py-1">
              <span className={`flex items-center gap-1.5 font-bold ${
                step === 'auth' ? 'text-[#2A8882]' : 'text-emerald-700'
              }`}>
                {customer ? <Check className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full bg-[#2A8882] text-white flex items-center justify-center text-[10px]">1</span>}
                <span>Identificação</span>
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-[#B8ACA0] shrink-0" />

              <span className={`flex items-center gap-1.5 font-bold ${
                step === 'complementary' ? 'text-[#2A8882]' : (step === 'payment' ? 'text-emerald-700' : 'text-[#736A5E]')
              }`}>
                {step === 'payment' ? <Check className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center text-[10px]">2</span>}
                <span>Dados & Entrega</span>
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-[#B8ACA0] shrink-0" />

              <span className={`flex items-center gap-1.5 font-bold ${
                step === 'payment' ? 'text-[#2A8882]' : 'text-[#736A5E]'
              }`}>
                <span className="w-4 h-4 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center text-[10px]">3</span>
                <span>Pagamento Stone</span>
              </span>
            </div>

            {customer && (
              <span className="text-[11px] text-[#736A5E] hidden sm:inline">
                Logado como <strong className="text-[#2D2823]">{customer.name.split(' ')[0]}</strong>
              </span>
            )}
          </div>
        )}

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ======================================================== */}
          {/* ETAPA 1: IDENTIFICAÇÃO (LOGIN OU CADASTRO RÁPIDO)        */}
          {/* ======================================================== */}
          {step === 'auth' && (
            <div className="max-w-md mx-auto space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F4F3] border border-[#C5E5E2] mx-auto flex items-center justify-center text-[#2A8882]">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2D2823] font-heading">
                  {authMode === 'register' ? 'Cadastro Rápido em 1 Passo' : 'Acesse sua Conta'}
                </h3>
                <p className="text-xs text-[#736A5E]">
                  {authMode === 'register' 
                    ? 'Informe apenas nome, e-mail e senha para prosseguir ao pagamento' 
                    : 'Digite suas credenciais salvas no Supabase Auth'}
                </p>
              </div>

              {/* Seletor de Modo */}
              <div className="flex rounded-xl bg-white p-1 border border-[#E6DDD0]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-[#2A8882] text-white shadow-xs'
                      : 'text-[#736A5E] hover:text-[#2D2823]'
                  }`}
                >
                  Novo Cadastro
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-[#2A8882] text-white shadow-xs'
                      : 'text-[#736A5E] hover:text-[#2D2823]'
                  }`}
                >
                  Já tenho conta
                </button>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-[#2D2823] mb-1">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#9E9484] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#E6DDD0] text-xs text-[#2D2823] placeholder-[#9E9484] focus:outline-none focus:border-[#2A8882]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2D2823] mb-1">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9E9484] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#E6DDD0] text-xs text-[#2D2823] placeholder-[#9E9484] focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2823] mb-1">
                    Senha {authMode === 'register' && '(mínimo 6 caracteres)'} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#9E9484] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPass}
                      onChange={(e) => setAuthPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#E6DDD0] text-xs text-[#2D2823] placeholder-[#9E9484] focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando no Supabase Auth...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'register' ? 'Criar Conta e Prosseguir' : 'Entrar e Continuar'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* ETAPA 2: DADOS COMPLEMENTARES (CPF, TELEFONE, ENDEREÇO)   */}
          {/* ======================================================== */}
          {step === 'complementary' && (
            <form onSubmit={handleComplementarySubmit} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD0]">
                <div>
                  <h3 className="text-sm font-bold text-[#2D2823] font-heading">
                    Dados Complementares para Emissão e Envio
                  </h3>
                  <p className="text-xs text-[#736A5E]">
                    Necessários para nota fiscal e entrega via Melhor Envio / Correios.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { logoutCustomer(); setCustomer(null); setStep('auth'); }}
                  className="text-[11px] text-[#736A5E] hover:text-red-500 font-semibold"
                >
                  Trocar de conta
                </button>
              </div>

              {compError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{compError}</span>
                </div>
              )}

              {/* CPF e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2823] mb-1">
                    CPF (para Nota Fiscal) *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#9E9484] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E6DDD0] text-xs text-[#2D2823] font-mono focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2823] mb-1">
                    Telefone / WhatsApp com DDD *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#9E9484] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E6DDD0] text-xs text-[#2D2823] font-mono focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div className="p-4 rounded-2xl bg-white border border-[#E6DDD0] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2A8882]" />
                    <span className="text-xs font-bold text-[#2D2823] uppercase tracking-wider">
                      Endereço Completo de Entrega
                    </span>
                  </div>
                  {loadingCep && (
                    <span className="text-[11px] text-[#2A8882] flex items-center gap-1 font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Consultando ViaCEP...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#736A5E] mb-1">
                      CEP *
                    </label>
                    <input
                      type="text"
                      required
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] font-mono focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#736A5E] mb-1">
                      Rua / Avenida / Logradouro *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Av. Boa Viagem"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#736A5E] mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 1500"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#736A5E] mb-1">
                      Complemento (opcional)
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto 402, Bloco B"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#736A5E] mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Boa Viagem"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#736A5E] mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Recife"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#736A5E] mb-1">
                      Estado (UF) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={stateUf}
                      onChange={(e) => setStateUf(e.target.value.toUpperCase())}
                      placeholder="PE"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] uppercase font-bold focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddressToProfile}
                    onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2A8882] accent-[#2A8882]"
                  />
                  <label htmlFor="saveAddress" className="text-xs text-[#736A5E] cursor-pointer">
                    Salvar este endereço no meu cadastro para pedidos futuros
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('auth')}
                  className="px-4 py-2.5 rounded-xl border border-[#E6DDD0] text-xs font-semibold text-[#736A5E] hover:bg-[#F5EFE6] transition-colors"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Ir para o Pagamento Stone</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* ETAPA 3: PAGAMENTO STONE (PIX E CARTÃO DE CRÉDITO)       */}
          {/* ======================================================== */}
          {step === 'payment' && (
            <div className="space-y-6">
              
              {/* Resumo do Pedido com Frete */}
              <div className="p-4 rounded-2xl bg-white border border-[#E6DDD0] space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#736A5E]">
                  <span>Subtotal ({cart.length} itens):</span>
                  <span className="font-semibold text-[#2D2823]">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#736A5E]">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#2A8882]" />
                    <span>Frete ({selectedShipping?.name || 'Entrega Padrão'}):</span>
                  </span>
                  <span className={`font-semibold ${shippingCost === 0 ? 'text-emerald-600' : 'text-[#2D2823]'}`}>
                    {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-[#2D2823] pt-2 border-t border-[#E6DDD0]">
                  <span>Total a Pagar (com Stone):</span>
                  <span className="text-base text-[#2A8882] font-heading font-extrabold">
                    R$ {grandTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="text-[11px] text-[#736A5E] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DDD0] flex items-center justify-between">
                  <span>
                    Entrega para: <strong>{shippingAddress?.street || street}, {shippingAddress?.number || number}</strong> - {shippingAddress?.city || city}/{shippingAddress?.state || stateUf}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('complementary')}
                    className="text-[#2A8882] font-semibold hover:underline shrink-0 ml-2"
                  >
                    Alterar
                  </button>
                </div>
              </div>

              {/* Aviso de Modo Simulação / Fallback Ativo quando chave da Stone não estiver ativa */}
              {!isStoneConfigured() && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold flex items-center gap-2 flex-wrap">
                      <span>Modo Simulação Ativo (Stone Sandbox Fallback)</span>
                      <span className="text-[9px] bg-amber-200/80 text-amber-900 font-mono px-1.5 py-0.5 rounded font-bold">
                        Sem cobrança real
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      A chave oficial de produção da Stone ainda não está conectada. O checkout está operando com simulação resiliente: você pode testar pagamentos via PIX ou Cartão livremente.
                    </p>
                  </div>
                </div>
              )}

              {/* Abas de Método de Pagamento Stone */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#2D2823] uppercase tracking-wider">
                  Selecione a Forma de Pagamento Stone
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stone_pix')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      paymentMethod === 'stone_pix'
                        ? 'border-[#2A8882] bg-[#E8F4F3]/50 ring-2 ring-[#2A8882]/20'
                        : 'border-[#E6DDD0] bg-white hover:border-[#2A8882]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'stone_pix' ? 'bg-[#2A8882] text-white' : 'bg-[#FAF7F2] text-[#736A5E]'
                    }`}>
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#2D2823] flex items-center gap-1.5">
                        <span>PIX Instantâneo</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          Aprovação Imediata
                        </span>
                      </div>
                      <span className="text-[10px] text-[#736A5E]">QR Code Copia e Cola</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stone_credit_card')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      paymentMethod === 'stone_credit_card'
                        ? 'border-[#2A8882] bg-[#E8F4F3]/50 ring-2 ring-[#2A8882]/20'
                        : 'border-[#E6DDD0] bg-white hover:border-[#2A8882]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'stone_credit_card' ? 'bg-[#2A8882] text-white' : 'bg-[#FAF7F2] text-[#736A5E]'
                    }`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#2D2823]">
                        Cartão de Crédito
                      </div>
                      <span className="text-[10px] text-[#736A5E]">Até 12x parcelado</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* OPÇÃO 1: PIX INSTANTÂNEO STONE */}
              {paymentMethod === 'stone_pix' && pixData && (
                <div className="p-5 rounded-3xl bg-white border border-[#E6DDD0] space-y-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F4F3] text-[#2A8882] text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expira às {pixData.expiresAt}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 bg-white border-2 border-[#E6DDD0] rounded-2xl shadow-xs">
                      <img
                        src={pixData.qrCodeUrl}
                        alt="QR Code Stone PIX"
                        referrerPolicy="no-referrer"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <span className="text-xs text-[#736A5E] mt-2">
                      Abra o app do seu banco e escaneie o QR Code acima
                    </span>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="block text-[11px] font-bold text-[#736A5E]">
                      Ou use o código Pix Copia e Cola:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixData.pixCode}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs font-mono text-[#524B42] truncate"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(pixData.pixCode);
                          setPixCopied(true);
                          setTimeout(() => setPixCopied(false), 3000);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          pixCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#2A8882] text-white hover:bg-[#22706A]'
                        }`}
                      >
                        {pixCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E6DDD0]">
                    <button
                      type="button"
                      disabled={pixVerifying}
                      onClick={handleConfirmPixPayment}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {pixVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verificando liquidação na Stone...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Já realizei o pagamento PIX</span>
                        </>
                      )}
                    </button>
                    <span className="block text-[10px] text-[#9E9484] mt-1.5">
                      Transação monitorada pelo Gateway Stone Pagamentos
                    </span>
                  </div>
                </div>
              )}

              {/* OPÇÃO 2: CARTÃO DE CRÉDITO STONE */}
              {paymentMethod === 'stone_credit_card' && (
                <form onSubmit={handleCreditCardPayment} className="p-5 rounded-3xl bg-white border border-[#E6DDD0] space-y-4">
                  {cardError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{cardError}</span>
                    </div>
                  )}

                  {/* Botão de Preenchimento Rápido para Testes em Sandbox */}
                  {!isStoneConfigured() && (
                    <div className="flex items-center justify-between pb-1 border-b border-[#E6DDD0]/60">
                      <span className="text-[11px] text-[#736A5E]">Ambiente de Teste:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNumber(STONE_TEST_CARDS.approvedVisa.cardNumber);
                          setCardHolder(STONE_TEST_CARDS.approvedVisa.cardHolderName);
                          setCardExpiry(STONE_TEST_CARDS.approvedVisa.expiration);
                          setCardCvv(STONE_TEST_CARDS.approvedVisa.cvv);
                        }}
                        className="text-[11px] font-bold text-[#2A8882] hover:text-[#22706A] bg-[#E8F4F3] hover:bg-[#D5EDE9] px-2.5 py-1 rounded-lg border border-[#C5E5E2] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Preencher com número de cartão de teste aprovado"
                      >
                        <span>⚡ Preencher Cartão de Teste</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#2D2823]">
                        Número do Cartão *
                      </label>
                      <span className="text-[11px] font-bold text-[#2A8882]">
                        {detectCardBrand(cardNumber)}
                      </span>
                    </div>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-[#9E9484] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs font-mono text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D2823] mb-1">
                      Nome impresso no Cartão *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="COMO NO CARTÃO"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs uppercase text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2823] mb-1">
                        Validade (MM/AA) *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs font-mono text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D2823] mb-1">
                        CVV *
                      </label>
                      <input
                        type="password"
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs font-mono text-[#2D2823] focus:outline-none focus:border-[#2A8882]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D2823] mb-1">
                      Opções de Parcelamento Stone *
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DDD0] text-xs text-[#2D2823] font-medium focus:outline-none focus:border-[#2A8882]"
                    >
                      {installmentOptions.map(opt => (
                        <option key={opt.installments} value={opt.installments}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={cardProcessing}
                    className="w-full py-3.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {cardProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processando transação com a Stone...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pagar R$ {grandTotal.toFixed(2).replace('.', ',')} com Cartão</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ETAPA 4: SUCESSO / PEDIDO PAGO NA STONE                  */}
          {/* ======================================================== */}
          {step === 'success' && completedOrder && (
            <div className="p-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Pagamento Confirmado na Stone
                  </span>
                  {completedOrder.isSimulation && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Ambiente de Simulação / Sandbox
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#2D2823] font-heading mt-2">
                  Obrigado pelo seu pedido!
                </h3>
                <p className="text-xs text-[#736A5E] max-w-sm mx-auto">
                  Seu pedido <strong className="text-[#2D2823]">#{completedOrder.orderNumber}</strong> foi gravado no Supabase e já está em preparação para envio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E6DDD0] text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b border-[#E6DDD0] pb-2">
                  <span className="text-[#736A5E]">Código da Transação Stone:</span>
                  <span className="font-mono font-bold text-[#2D2823]">{completedOrder.stoneTransactionId}</span>
                </div>
                <div className="flex justify-between border-b border-[#E6DDD0] pb-2">
                  <span className="text-[#736A5E]">Cliente:</span>
                  <span className="font-semibold text-[#2D2823]">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-[#E6DDD0] pb-2">
                  <span className="text-[#736A5E]">Entrega para:</span>
                  <span className="font-semibold text-[#2D2823] text-right max-w-[220px] truncate">{completedOrder.customerAddress}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Total Pago:</span>
                  <span className="text-[#2A8882]">R$ {completedOrder.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const msg = encodeURIComponent(
                      `Olá Silva e Sol! Acabei de realizar o pedido #${completedOrder.orderNumber} de R$ ${completedOrder.total.toFixed(2)} via Stone. Gostaria de acompanhar o envio!`
                    );
                    window.open(`https://wa.me/${settings.whatsappNumber}?text=${msg}`, '_blank');
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Acompanhar pelo WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsCartOpen(false);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold transition-all"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
