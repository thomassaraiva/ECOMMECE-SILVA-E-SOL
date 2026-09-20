import { Category, Subcategory, Product, Banner, StoreSettings } from '../types/ecommerce';
import { getDefaultSizeChartForCategory } from '../data/sizeChartPresets';

export const INITIAL_SETTINGS: StoreSettings = {
  id: 'settings-default',
  storeName: 'SILVA E SOL',
  tagline: 'Moda Praia & Casual Masculina Nordestina',
  whatsappNumber: '5581920019982', // Número oficial da loja atualizado
  instagramHandle: '@silvaesol',
  contactEmail: 'contato@silvaesol.com.br',
  aboutText: 'A Silva e Sol nasceu na brisa quente e na luminosidade dourada do litoral nordestino. Nossa missão é vestir o homem contemporâneo com peças que unem corte impecável, tecidos naturais e a descontração solar que só a nossa terra tem. Criamos sungas de modelagem anatômica, camisetas em algodão premium, shorts de secagem ultrarrápida e peças com alma brasileira autêntica, sem afetações.',
  aboutMission: 'Valorizar a beleza natural, o calor humano e a identidade solar através de roupas masculinas resistentes, leves e versáteis — da areia da praia ao fim de tarde na cidade.',
  shippingPolicy: 'Enviamos para todo o Brasil com código de rastreamento pelos Correios e transportadoras parceiras. Pedidos com finalização via WhatsApp contam com cálculo sob medida do melhor frete para o seu CEP.',
  returnPolicy: 'Garantia incondicional de 7 dias após o recebimento da peça para troca de tamanho ou devolução com estorno imediato, mantidas as etiquetas originais.',
  privacyPolicy: 'Seus dados de contato e pedidos são utilizados exclusivamente para o atendimento e processamento do seu pedido. Não compartilhamos informações com terceiros.',
  freeShippingThreshold: 299.00,
  metaPixelId: '',
  googleAnalyticsId: '',
  tiktokPixelId: '',
  enableTracking: true
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sungas',
    name: 'SUNGAS',
    slug: 'sungas',
    description: 'Corte anatômico, forro duplo anti-areia e secagem rápida com proteção UV 50+.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'cat-camisetas',
    name: 'CAMISETAS',
    slug: 'camisetas',
    description: 'Algodão nobre, toque suave e caimento solto para enfrentar os dias mais quentes.',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'cat-regatas',
    name: 'REGATAS',
    slug: 'regatas',
    description: 'Cavas bem desenhadas, frescor máximo e liberdade de movimento no treino ou lazer.',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'cat-shorts',
    name: 'SHORTS',
    slug: 'shorts',
    description: 'Shorts de praia e bermudas casuais com elástico flexível e bolsos funcionais.',
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'cat-bolsas',
    name: 'BOLSAS',
    slug: 'bolsas',
    description: 'Mochilas e sacolas tote em lona resistente para carregar toalha, protetor e acessórios.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    displayOrder: 5,
    isActive: true
  },
  {
    id: 'cat-acessorios',
    name: 'ACESSÓRIOS',
    slug: 'acessorios',
    description: 'Bonés, chapéus de palha e óculos de sol com design contemporâneo.',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
    displayOrder: 6,
    isActive: true
  }
];

export const INITIAL_SUBCATEGORIES: Subcategory[] = [
  { id: 'sub-sunga-slim', categoryId: 'cat-sungas', name: 'Sunga Slim', slug: 'sunga-slim', displayOrder: 1, isActive: true },
  { id: 'sub-sunga-tradicional', categoryId: 'cat-sungas', name: 'Sunga Tradicional', slug: 'sunga-tradicional', displayOrder: 2, isActive: true },
  { id: 'sub-sunga-boxer', categoryId: 'cat-sungas', name: 'Sunga Boxer', slug: 'sunga-boxer', displayOrder: 3, isActive: true },
  { id: 'sub-cam-gola-c', categoryId: 'cat-camisetas', name: 'Gola Redonda', slug: 'gola-redonda', displayOrder: 1, isActive: true },
  { id: 'sub-cam-linho', categoryId: 'cat-camisetas', name: 'Linho & Algodão', slug: 'linho-algodao', displayOrder: 2, isActive: true },
  { id: 'sub-shorts-praia', categoryId: 'cat-shorts', name: 'Shorts de Banho', slug: 'shorts-banho', displayOrder: 1, isActive: true },
  { id: 'sub-shorts-sarja', categoryId: 'cat-shorts', name: 'Bermuda Casual', slug: 'bermuda-casual', displayOrder: 2, isActive: true }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'COLEÇÃO ALMA SOLAR',
    subtitle: 'Sungas e peças leves desenvolvidas para viver o melhor do verão o ano inteiro.',
    ctaText: 'Ver Coleção',
    ctaLink: 'sungas',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'banner-2',
    title: 'SUNGAS SILVA E SOL',
    subtitle: 'Modelagem slim anatômica, cordão embutido e tecido com proteção UV50+.',
    ctaText: 'Escolha a Sua',
    ctaLink: 'sungas',
    imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'banner-3',
    title: 'FRESCOR & CASUALIDADE',
    subtitle: 'Camisetas em algodão penteado e bermudas de secagem instantânea.',
    ctaText: 'Explorar Linha',
    ctaLink: 'camisetas',
    imageUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1600&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-sunga-slim-sol',
    name: 'Sunga Slim Masculina Lateral 9cm Silva e Sol',
    slug: 'sunga-slim-masculina-lateral-9cm-silva-e-sol',
    sku: 'SES-SNG-001',
    description: 'A clássica do litoral brasileiro. Modelagem slim anatômica com lateral de 9cm, cordão interno ajustável com ponteira metálica e forro duplo integral anti-areia.',
    detailedDescription: 'Desenvolvida especialmente para valorizar a anatomia masculina com liberdade de movimento e secagem rápida. A lateral de 9cm proporciona o bronzeado perfeito e caimento moderno. Confeccionada em poliamida com elastano de alta densidade e proteção UV50+ permanente.',
    price: 89.90,
    promotionalPrice: 69.90,
    isOnSale: true,
    isFeatured: true,
    isNew: false,
    isActive: true,
    categoryId: 'cat-sungas',
    subcategoryId: 'sub-sunga-slim',
    stockQuantity: 42,
    colors: ['Verde Musgo', 'Amarelo Ocre', 'Preto Ébano', 'Azul Mar'],
    sizes: ['P', 'M', 'G', 'GG'],
    models: ['Slim Lateral 9cm', 'Tradicional 12cm'],
    images: [
      'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
    ],
    sizeChart: getDefaultSizeChartForCategory('cat-sungas'),
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-10T10:00:00Z'
  },
  {
    id: 'prod-sunga-boxer-dunas',
    name: 'Sunga Boxer Masculina Dunas do Nordeste',
    slug: 'sunga-boxer-masculina-dunas-nordeste',
    sku: 'SES-SNG-002',
    description: 'Para quem prefere cobertura maior e segurança ao nadar ou praticar esportes de praia. Lateral larga e corte ergonômico.',
    detailedDescription: 'Corte boxer com costuras reforçadas planas (flatlock) que evitam assaduras. Proteção solar permanente FPS 50+ bloqueia 98% dos raios UV.',
    price: 99.90,
    promotionalPrice: 84.90,
    isOnSale: true,
    isFeatured: true,
    isNew: true,
    isActive: true,
    categoryId: 'cat-sungas',
    subcategoryId: 'sub-sunga-boxer',
    stockQuantity: 28,
    colors: ['Preto Ébano', 'Verde Oliva', 'Azul Marinho'],
    sizes: ['P', 'M', 'G', 'GG'],
    models: ['Boxer Anatômica'],
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
    ],
    sizeChart: getDefaultSizeChartForCategory('cat-sungas'),
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-03-12T10:00:00Z'
  },
  {
    id: 'prod-camiseta-pima-solar',
    name: 'Camiseta Algodão Nobre Silva e Sol',
    slug: 'camiseta-algodao-nobre-silva-e-sol',
    sku: 'SES-CAM-001',
    description: 'Camiseta masculina com toque aveludado, gola canelada que não deforma e tingimento especial em tons naturais terrosos.',
    detailedDescription: 'Produzida em 100% algodão nobre de fibra longa. Respirabilidade incomparável para enfrentar o calor sem amassar facilmente.',
    price: 119.90,
    promotionalPrice: 99.90,
    isOnSale: true,
    isFeatured: true,
    isNew: true,
    isActive: true,
    categoryId: 'cat-camisetas',
    subcategoryId: 'sub-cam-gola-c',
    stockQuantity: 35,
    colors: ['Areia Crua', 'Verde Oliva', 'Amarelo Mostarda', 'Preto'],
    sizes: ['P', 'M', 'G', 'GG'],
    models: ['Regular Fit'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
    ],
    sizeChart: getDefaultSizeChartForCategory('cat-camisetas'),
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-08T10:00:00Z'
  },
  {
    id: 'prod-regata-rib-frescor',
    name: 'Regata Masculina Canelada Rib Nordeste',
    slug: 'regata-masculina-canelada-rib-nordeste',
    sku: 'SES-REG-001',
    description: 'Regata com modelagem ajustada sem apertar, cavas confortáveis e textura canelada vintage.',
    detailedDescription: 'Ideal tanto para curtir a orla quanto para composições urbanas despojadas de verão. Algodão com 4% de elastano para movimento fluido.',
    price: 79.90,
    promotionalPrice: undefined,
    isOnSale: false,
    isFeatured: false,
    isNew: true,
    isActive: true,
    categoryId: 'cat-regatas',
    subcategoryId: undefined,
    stockQuantity: 22,
    colors: ['Branco Off', 'Preto', 'Verde Musgo'],
    sizes: ['P', 'M', 'G', 'GG'],
    models: ['Slim Rib'],
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    sizeChart: getDefaultSizeChartForCategory('cat-regatas'),
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-03T10:00:00Z'
  },
  {
    id: 'prod-short-agua-secagem',
    name: 'Short de Praia Secagem Rápida Silva e Sol',
    slug: 'short-de-praia-secagem-rapida-silva-e-sol',
    sku: 'SES-SHT-001',
    description: 'Comprimento médio acima do joelho (5 polegadas), cós elástico anatômico e tecido repelente a água com secagem em 10 minutos.',
    detailedDescription: 'Possui 2 bolsos laterais e 1 bolso traseiro com fechamento em velcro e ilhós para drenagem de água e areia. Forro em tela elástica ultra macia.',
    price: 139.90,
    promotionalPrice: 119.90,
    isOnSale: true,
    isFeatured: true,
    isNew: false,
    isActive: true,
    categoryId: 'cat-shorts',
    subcategoryId: 'sub-shorts-praia',
    stockQuantity: 19,
    colors: ['Verde Mata', 'Amarelo Solar', 'Terracota', 'Azul Petróleo'],
    sizes: ['P', 'M', 'G', 'GG'],
    models: ['Comprimento 14"'],
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
    ],
    sizeChart: getDefaultSizeChartForCategory('cat-shorts'),
    createdAt: '2026-02-28T10:00:00Z',
    updatedAt: '2026-03-11T10:00:00Z'
  },
  {
    id: 'prod-tote-lona-praia',
    name: 'Bolsa Tote de Praia em Lona Encerada Silva e Sol',
    slug: 'bolsa-tote-praia-lona-encerada',
    sku: 'SES-BAG-001',
    description: 'Espaçosa, robusta e resistente à maresia. Alças duplas de algodão reforçado e bolso interno com zíper.',
    detailedDescription: 'Projetada para carregar suas sungas, toalhas, garrafa térmica e protetor solar com estilo masculino despretensioso.',
    price: 149.90,
    promotionalPrice: undefined,
    isOnSale: false,
    isFeatured: false,
    isNew: true,
    isActive: true,
    categoryId: 'cat-bolsas',
    subcategoryId: undefined,
    stockQuantity: 14,
    colors: ['Areia com Alça Musgo', 'Verde Escuro'],
    sizes: ['Único (42x38cm)'],
    models: ['Standard'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    ],
    sizeChart: getDefaultSizeChartForCategory('cat-bolsas'),
    createdAt: '2026-03-06T10:00:00Z',
    updatedAt: '2026-03-06T10:00:00Z'
  },
  {
    id: 'prod-bone-aba-curva',
    name: 'Boné Silva e Sol Dad Hat Solar',
    slug: 'bone-silva-e-sol-dad-hat-solar',
    sku: 'SES-ACS-001',
    description: 'Bordado frontal minimalista Silva e Sol, fivela traseira em latão envelhecido e sarja 100% algodão pré-lavada.',
    detailedDescription: 'Protege contra a radiação direta com ventilação otimizada nos ilhoses bordados.',
    price: 89.90,
    promotionalPrice: 69.90,
    isOnSale: true,
    isFeatured: true,
    isNew: false,
    isActive: true,
    categoryId: 'cat-acessorios',
    subcategoryId: undefined,
    stockQuantity: 25,
    colors: ['Verde Floresta', 'Mostarda Sol', 'Areia'],
    sizes: ['Tamanho Único Ajustável'],
    models: ['Dad Hat Não Estruturado'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    sizeChart: getDefaultSizeChartForCategory('cat-acessorios'),
    createdAt: '2026-03-04T10:00:00Z',
    updatedAt: '2026-03-09T10:00:00Z'
  },
  {
    id: 'prod-sunga-slim-terracota',
    name: 'Sunga Slim Linha Terra Bruta',
    slug: 'sunga-slim-linha-terra-bruta',
    sku: 'SES-SNG-003',
    description: 'Edição limitada inspirada nas falésias e no sol da tarde cearense. Tecido acetinado fosco de altíssima durabilidade ao cloro.',
    detailedDescription: 'Não desbota com a água salgada ou piscina tratada com cloro. Costura invisível com elástico reforçado nas pernas que não marca a pele.',
    price: 94.90,
    promotionalPrice: 79.90,
    isOnSale: true,
    isFeatured: true,
    isNew: true,
    isActive: true,
    categoryId: 'cat-sungas',
    subcategoryId: 'sub-sunga-slim',
    stockQuantity: 15,
    colors: ['Terracota Sol', 'Verde Pinho'],
    sizes: ['P', 'M', 'G'],
    models: ['Slim (10cm)'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=800&q=80'
    ],
    sizeChart: getDefaultSizeChartForCategory('cat-sungas'),
    createdAt: '2026-03-07T10:00:00Z',
    updatedAt: '2026-03-07T10:00:00Z'
  }
];
