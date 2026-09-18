/**
 * @license
 * SILVA E SOL - Tipos Oficiais de Domínio e E-commerce
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  order?: number;
  isActive: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  displayOrder?: number;
  order?: number;
  isActive?: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  model?: string;
  sku?: string;
  stockQuantity: number;
  additionalPrice?: number;
  price?: number;
  isAvailable?: boolean;
  imageUrl?: string;
}

export interface SizeChartRow {
  size: string;
  values: string[];
}

export interface SizeChart {
  title?: string;
  columns: string[];
  rows: SizeChartRow[];
  instructions?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  brand?: string;
  description: string;
  detailedDescription?: string;
  price: number;
  promotionalPrice?: number;
  isOnSale: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  categoryId: string;
  subcategoryId?: string;
  stockQuantity: number;
  colors: string[];
  sizes: string[];
  models: string[];
  images: string[];
  videoUrl?: string;
  sizeChart?: SizeChart;
  seoTitle?: string;
  seoDescription?: string;
  promotionStartDate?: string;
  promotionEndDate?: string;
  discountPercent?: number;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  buttonText?: string;
  linkUrl?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  displayOrder?: number;
  order?: number;
  isActive: boolean;
  relatedCategoryId?: string;
  relatedProductId?: string;
  objectPosition?: string; // Controle de alinhamento vertical/horizontal (ex: 'center center', 'center top', 'center bottom')
  mobileObjectPosition?: string;
}

export interface StoreSettings {
  id?: string;
  storeName?: string;
  tagline?: string;
  storeTagline?: string;
  whatsappNumber: string; // Ex: '5581920019982'
  instagramHandle?: string;
  contactEmail?: string;
  aboutTitle?: string;
  aboutText?: string;
  aboutMission?: string;
  missionText?: string;
  aboutManifesto?: string;
  manifestoText?: string;
  aboutHeroImage?: string;
  aboutImageUrl?: string;
  shippingPolicy?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  exchangePolicy?: string;
  privacyPolicy?: string;
  freeShippingThreshold?: number;

  // Pixels de Conversão & Tráfego Pago
  metaPixelId?: string;       // ID do Meta Pixel (Facebook/Instagram), ex: '123456789012345'
  googleAnalyticsId?: string; // ID do GA4, ex: 'G-XXXXXXXXXX'
  tiktokPixelId?: string;     // ID do TikTok Pixel, ex: 'CXXXXXXXXXXXXXXX'
  enableTracking?: boolean;   // Ativação geral de rastreamento
  googleTagManagerId?: string;// ID do GTM, ex: 'GTM-XXXXXXX' (opcional)
}

export interface CartItem {
  id: string; // unique item cart key (productId-size-color-model)
  productId: string;
  name: string;
  price: number;
  promotionalPrice?: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedModel?: string;
  quantity: number;
  image: string;
  imageUrl?: string;
  maxStock: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  size?: string;
  color?: string;
  model?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export type OrderStatus = 'pending_whatsapp' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerNotes?: string;
  subtotal?: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface CatalogFilters {
  searchQuery: string;
  categoryId?: string;
  subcategoryId?: string;
  selectedSize?: string;
  selectedColor?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyPromotions: boolean;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';
}

export type PageRoute = 
  | 'home'
  | 'catalog'
  | 'categories'
  | 'product'
  | 'cart'
  | 'about'
  | 'contact'
  | 'policies'
  | 'admin-login'
  | 'admin-panel';
