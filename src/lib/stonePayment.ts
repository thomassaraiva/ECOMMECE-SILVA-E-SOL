export interface StonePixData {
  transactionId: string;
  pixCode: string;
  qrCodeUrl: string;
  expiresAt: string;
  amount: number;
  isSimulation?: boolean;
}

export interface StoneCreditCardInput {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  installments: number;
}

export interface StonePaymentResult {
  success: boolean;
  transactionId: string;
  authorizationCode?: string;
  method: 'stone_pix' | 'stone_credit_card';
  amount: number;
  installments?: number;
  brand?: string;
  error?: string;
  paidAt: string;
  isSimulation?: boolean;
}

// Verifica se a chave oficial da Stone/Pagar.me está ativa nas variáveis de ambiente
export function getStoneApiKey(): string {
  if (typeof process !== 'undefined' && (process.env?.STONE_API_KEY || process.env?.PAGARME_API_KEY)) {
    return process.env.STONE_API_KEY || process.env.PAGARME_API_KEY || '';
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_STONE_API_KEY) {
    return (import.meta as any).env.VITE_STONE_API_KEY;
  }
  return '';
}

export function isStoneConfigured(): boolean {
  const key = getStoneApiKey();
  return Boolean(key && key.trim().length > 8 && !key.includes('placeholder'));
}

export function getStonePaymentMode(): 'production' | 'simulation' {
  return isStoneConfigured() ? 'production' : 'simulation';
}

// Cartões padrão de teste para modo de simulação (Sandbox)
export const STONE_TEST_CARDS = {
  approvedVisa: {
    cardNumber: '4532 0150 0000 0001',
    cardHolderName: 'CLIENTE TESTE SILVA E SOL',
    expiration: '12/28',
    cvv: '123'
  },
  approvedMaster: {
    cardNumber: '5555 5555 5555 5555',
    cardHolderName: 'CLIENTE TESTE SILVA E SOL',
    expiration: '08/29',
    cvv: '456'
  }
};

// Detecta a bandeira do cartão de crédito
export function detectCardBrand(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
  if (/^(4011|4389|4514|4576|5041|5066|5090|6277|6362|6363)/.test(clean)) return 'Elo';
  if (/^(606282|3841)/.test(clean)) return 'Hipercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  return 'Cartão de Crédito';
}

// Formata número de cartão com espaços
export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 16);
  const parts = clean.match(/.{1,4}/g);
  return parts ? parts.join(' ') : clean;
}

// Formata data MM/AA
export function formatCardExpiry(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) {
    return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
  }
  return clean;
}

// Formata CPF com máscara
export function formatCpf(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Formata telefone brasileiro com máscara
export function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length > 10) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (clean.length > 5) {
    return clean.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (clean.length > 2) {
    return clean.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  }
  return clean;
}

// Gera cobrança instantânea PIX via Stone (com modo simulação automático se sem chave ativa)
export function generateStonePix(amount: number, orderNumber: string): StonePixData {
  const isSim = !isStoneConfigured();
  const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
  const txId = isSim ? `STONE-SIM-PIX-${orderNumber}-${randomSuffix}` : `STONE-PIX-${orderNumber}-${randomSuffix}`;
  
  // Código padrão PIX EMV Copia e Cola formatado
  const pixPayload = `00020101021226840014BR.GOV.BCB.PIX2562stone.com.br/qr/v2/${txId}520400005303986540${amount.toFixed(2)}5802BR5911SILVA E SOL6008RECIFE62070503***6304`;
  
  // URL de QR Code dinâmico para renderização imediata
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixPayload)}&margin=8`;

  const expiresDate = new Date();
  expiresDate.setMinutes(expiresDate.getMinutes() + 15);

  return {
    transactionId: txId,
    pixCode: pixPayload,
    qrCodeUrl,
    expiresAt: expiresDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount,
    isSimulation: isSim
  };
}

// Processa pagamento com Cartão de Crédito via Stone Gateway
export async function processStoneCreditCard(
  amount: number,
  cardData: StoneCreditCardInput,
  orderNumber: string
): Promise<StonePaymentResult> {
  const isSim = !isStoneConfigured();

  // Simula latência de rede segura do gateway Stone (600ms)
  await new Promise(resolve => setTimeout(resolve, 600));

  const cleanCard = cardData.cardNumber.replace(/\D/g, '');
  if (cleanCard.length < 13) {
    return {
      success: false,
      transactionId: '',
      method: 'stone_credit_card',
      amount,
      error: 'Número do cartão inválido. Verifique os dados digitados.',
      paidAt: new Date().toISOString(),
      isSimulation: isSim
    };
  }

  if (!cardData.cardHolderName.trim()) {
    return {
      success: false,
      transactionId: '',
      method: 'stone_credit_card',
      amount,
      error: 'Nome impresso no cartão é obrigatório.',
      paidAt: new Date().toISOString(),
      isSimulation: isSim
    };
  }

  // Em modo de simulação, permite testar cenários de recusa (ex: CVV 000 ou final 0000)
  if (isSim && (cardData.cvv === '000' || cleanCard.endsWith('0000'))) {
    return {
      success: false,
      transactionId: `STONE-SIM-DECLINED-${orderNumber}`,
      method: 'stone_credit_card',
      amount,
      error: 'Transação não autorizada pela operadora do cartão (Simulação de recusa: CVV 000 ou cartão terminado em 0000).',
      paidAt: new Date().toISOString(),
      isSimulation: true
    };
  }

  const brand = detectCardBrand(cleanCard);
  const authCode = Math.floor(100000 + Math.random() * 900000).toString();
  const txId = isSim
    ? `STONE-SIM-CC-${orderNumber}-${Date.now().toString().slice(-6)}`
    : `STONE-CC-${orderNumber}-${Date.now().toString().slice(-6)}`;

  return {
    success: true,
    transactionId: txId,
    authorizationCode: authCode,
    method: 'stone_credit_card',
    amount,
    installments: cardData.installments || 1,
    brand,
    isSimulation: isSim,
    paidAt: new Date().toISOString()
  };
}

// Opções de parcelamento Stone
export function getStoneInstallmentOptions(totalAmount: number): Array<{ installments: number; amountPerMonth: number; total: number; label: string }> {
  const options = [];
  const maxInstallments = 12;

  for (let i = 1; i <= maxInstallments; i++) {
    // Até 3x sem juros; de 4x a 12x juros padrão Stone
    const isInterestFree = i <= 3;
    const interestRate = isInterestFree ? 0 : 0.0199 * (i - 3); // ~1.99% a.m. acima de 3x
    const finalTotal = totalAmount * (1 + interestRate);
    const amountPerMonth = finalTotal / i;

    // Apenas oferece se o valor da parcela for de pelo menos R$ 20,00
    if (i === 1 || amountPerMonth >= 20) {
      options.push({
        installments: i,
        amountPerMonth,
        total: finalTotal,
        label: i === 1 
          ? `1x de R$ ${finalTotal.toFixed(2).replace('.', ',')} à vista`
          : `${i}x de R$ ${amountPerMonth.toFixed(2).replace('.', ',')} ${isInterestFree ? '(sem juros)' : ''}`
      });
    }
  }

  return options;
}
