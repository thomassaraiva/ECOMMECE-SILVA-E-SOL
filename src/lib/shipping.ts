import { CartItem, Product, ShippingOption, CustomerAddress } from '../types/ecommerce';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// Busca endereço automático gratuito via ViaCEP
export async function fetchAddressByCep(cep: string): Promise<Partial<CustomerAddress> | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) return null;
    const data: ViaCepResponse = await response.json();
    if (data.erro) return null;

    return {
      cep: data.cep,
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || ''
    };
  } catch (err) {
    console.warn('Erro ao consultar ViaCEP:', err);
    return null;
  }
}

// Calcula dimensões e peso total dos produtos no carrinho
export function calculateCartPackage(
  items: CartItem[], 
  products: Product[]
): { totalWeightGrams: number; heightCm: number; widthCm: number; lengthCm: number } {
  let totalWeightGrams = 0;
  let totalVolumeCm3 = 0;
  let totalQuantity = 0;

  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    const weight = prod?.weightGrams || 200; // peso padrão 200g por peça
    const height = prod?.heightCm || 4;     // altura padrão 4cm
    const width = prod?.widthCm || 15;      // largura padrão 15cm
    const length = prod?.lengthCm || 20;    // comprimento padrão 20cm

    totalWeightGrams += weight * item.quantity;
    totalVolumeCm3 += (height * width * length) * item.quantity;
    totalQuantity += item.quantity;
  }

  // Embalagem calculada proporcionalmente ao volume dos itens
  const heightCm = Math.max(5, Math.min(60, Math.round(Math.cbrt(totalVolumeCm3))));
  const widthCm = Math.max(16, Math.min(80, Math.round(Math.cbrt(totalVolumeCm3) * 1.3)));
  const lengthCm = Math.max(20, Math.min(100, Math.round(Math.cbrt(totalVolumeCm3) * 1.5)));

  return {
    totalWeightGrams: Math.max(150, totalWeightGrams),
    heightCm,
    widthCm,
    lengthCm
  };
}

// Simulação realista da API Melhor Envio (com cotações integradas Correios PAC, SEDEX, Jadlog e Loggi)
export function calculateMelhorEnvioQuotes(
  cep: string,
  state: string,
  items: CartItem[],
  products: Product[],
  subtotal: number,
  freeShippingThreshold: number = 299
): ShippingOption[] {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length < 8) return [];

  const { totalWeightGrams } = calculateCartPackage(items, products);
  const weightKg = totalWeightGrams / 1000;
  const isFreeEligible = subtotal >= freeShippingThreshold;

  // Base regional de frete a partir de Pernambuco (Origem Silva e Sol)
  const uf = (state || '').toUpperCase();
  let baseMultiplier = 1.0;
  let baseDays = 4;

  if (['PE', 'PB', 'AL', 'RN'].includes(uf)) {
    baseMultiplier = 0.75;
    baseDays = 2;
  } else if (['CE', 'SE', 'BA', 'PI', 'MA'].includes(uf)) {
    baseMultiplier = 0.9;
    baseDays = 4;
  } else if (['SP', 'RJ', 'MG', 'ES'].includes(uf)) {
    baseMultiplier = 1.0;
    baseDays = 5;
  } else if (['PR', 'SC', 'RS', 'GO', 'DF'].includes(uf)) {
    baseMultiplier = 1.2;
    baseDays = 6;
  } else {
    baseMultiplier = 1.45;
    baseDays = 8;
  }

  const weightFactor = 1 + (weightKg * 0.15);

  const pacPrice = isFreeEligible ? 0 : Math.round((19.90 * baseMultiplier * weightFactor) * 10) / 10;
  const sedexPrice = Math.round((39.90 * baseMultiplier * weightFactor) * 10) / 10;
  const jadlogPrice = isFreeEligible ? 0 : Math.round((17.50 * baseMultiplier * weightFactor) * 10) / 10;
  const loggiPrice = Math.round((27.90 * baseMultiplier * weightFactor) * 10) / 10;

  const options: ShippingOption[] = [
    {
      id: 'melhor-envio-jadlog',
      name: isFreeEligible ? 'Jadlog .Package (Frete Grátis Silva e Sol)' : 'Jadlog .Package (Melhor Envio)',
      carrier: 'Melhor Envio (Jadlog)',
      serviceCode: 'jadlog_package',
      price: jadlogPrice,
      deliveryDays: Math.max(2, baseDays),
      isFree: isFreeEligible
    },
    {
      id: 'melhor-envio-pac',
      name: isFreeEligible ? 'Correios PAC (Frete Grátis Solar)' : 'Correios PAC (Melhor Envio)',
      carrier: 'Correios (PAC)',
      serviceCode: 'correios_pac',
      price: pacPrice,
      deliveryDays: Math.max(3, baseDays + 2),
      isFree: isFreeEligible
    },
    {
      id: 'melhor-envio-sedex',
      name: 'Correios SEDEX Expresso (Melhor Envio)',
      carrier: 'Correios (SEDEX)',
      serviceCode: 'correios_sedex',
      price: sedexPrice,
      deliveryDays: Math.max(1, Math.round(baseDays / 2)),
      isFree: false
    },
    {
      id: 'melhor-envio-loggi',
      name: 'Loggi Express (Melhor Envio)',
      carrier: 'Loggi Express',
      serviceCode: 'loggi_express',
      price: loggiPrice,
      deliveryDays: Math.max(2, baseDays - 1),
      isFree: false
    }
  ];

  return options;
}
