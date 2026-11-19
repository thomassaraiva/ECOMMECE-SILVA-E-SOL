import { Product, Category, Subcategory, Banner, StoreSettings, Order } from '../types/ecommerce';
import { getDefaultSizeChartForCategory } from '../data/sizeChartPresets';
import { getSupabase } from './supabase';

export interface StoreState {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  banners: Banner[];
  settings: StoreSettings;
  orders: Order[];
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Silva e Sol',
  tagline: 'Moda praia & casual masculina',
  whatsappNumber: '5581920019982',
  instagramHandle: '@silvaesol',
  contactEmail: '',
};

export const EMPTY_STORE_STATE: StoreState = {
  products: [],
  categories: [],
  subcategories: [],
  banners: [],
  settings: DEFAULT_SETTINGS,
  orders: [],
};

function requireSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('A loja não está configurada: faltam as variáveis do Supabase.');
  return supabase;
}

function describeDbError(error: { message?: string; code?: string }): string {
  if (error.code === '42501' || /row-level security|permission denied/i.test(error.message || '')) {
    return 'sem permissão. Entre de novo no painel com o código de duas etapas.';
  }
  if (error.code === '23514' && /promotional_price/.test(error.message || '')) {
    return 'o preço promocional precisa ser menor que o preço normal.';
  }
  if (error.code === '23505') return 'já existe um item com esse nome de endereço (slug).';
  return error.message || 'erro desconhecido.';
}

function assertSaved(error: any) {
  if (error) throw new Error(`Não foi possível salvar: ${describeDbError(error)}`);
}

export function mapProductRow(p: any): Product {
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    sku: p.sku || undefined,
    brand: p.brand || 'Silva e Sol',
    description: p.description,
    detailedDescription: p.detailed_description || undefined,
    price: Number(p.price),
    promotionalPrice: p.promotional_price != null ? Number(p.promotional_price) : undefined,
    isOnSale: Boolean(p.is_on_sale),
    isFeatured: Boolean(p.is_featured),
    isNew: Boolean(p.is_new),
    isActive: p.is_active !== false,
    categoryId: p.category_id || '',
    subcategoryId: p.subcategory_id || undefined,
    stockQuantity: Number(p.stock_quantity ?? 0),
    colors: Array.isArray(p.colors) ? p.colors : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    models: Array.isArray(p.models) ? p.models : [],
    images: Array.isArray(p.images) ? p.images : [],
    videoUrl: p.video_url || undefined,
    variants: p.variants,
    sizeChart: p.size_chart || getDefaultSizeChartForCategory(p.category_id),
    seoTitle: p.seo_title || undefined,
    seoDescription: p.seo_description || undefined,
    weightGrams: Number(p.weight_grams ?? 200),
    heightCm: Number(p.height_cm ?? 4),
    widthCm: Number(p.width_cm ?? 15),
    lengthCm: Number(p.length_cm ?? 20),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export const StoreService = {
  async fetchAll(): Promise<StoreState> {
    const supabase = requireSupabase();
    const [products, categories, subcategories, banners, settings] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('display_order', { ascending: true }),
      supabase.from('subcategories').select('*').order('display_order', { ascending: true }),
      supabase.from('banners').select('*').order('display_order', { ascending: true }),
      supabase.from('store_settings').select('*').limit(1).maybeSingle(),
    ]);
    const failed = [products, categories, subcategories, banners, settings].find(r => r.error);
    if (failed) throw new Error(`Não foi possível carregar a loja: ${describeDbError(failed.error!)}`);

    const s: any = settings.data;
    return {
      products: (products.data || []).map(mapProductRow),
      categories: (categories.data || []).map((c: any) => ({
        id: String(c.id), name: c.name, slug: c.slug, description: c.description || undefined,
        imageUrl: c.image_url || undefined, displayOrder: c.display_order, isActive: c.is_active !== false,
      })),
      subcategories: (subcategories.data || []).map((x: any) => ({
        id: String(x.id), categoryId: x.category_id, name: x.name, slug: x.slug,
        displayOrder: x.display_order, isActive: x.is_active !== false,
      })),
      banners: (banners.data || []).map((b: any) => ({
        id: String(b.id), title: b.title, subtitle: b.subtitle || undefined,
        ctaText: b.button_text, ctaLink: b.link_url, imageUrl: b.image_url,
        mobileImageUrl: b.mobile_image_url || undefined, displayOrder: b.display_order,
        isActive: b.is_active !== false, objectPosition: b.object_position,
        mobileObjectPosition: b.mobile_object_position,
      })),
      settings: s ? {
        id: String(s.id),
        storeName: s.store_name,
        tagline: s.tagline || undefined,
        whatsappNumber: s.whatsapp_number,
        instagramHandle: s.instagram_handle || undefined,
        contactEmail: s.contact_email || undefined,
        legalName: s.legal_name || undefined,
        cnpj: s.cnpj || undefined,
        address: s.address || undefined,
        aboutText: s.about_text || undefined,
        aboutMission: s.about_mission || undefined,
        shippingPolicy: s.shipping_policy || undefined,
        returnPolicy: s.return_policy || undefined,
        privacyPolicy: s.privacy_policy || undefined,
      } : DEFAULT_SETTINGS,
      orders: [],
    };
  },

  async fetchOrders(): Promise<Order[]> {
    const supabase = requireSupabase();
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Não foi possível carregar os pedidos: ${describeDbError(error)}`);
    return (data || []) as Order[];
  },

  async insertProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Product> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock_quantity: product.stockQuantity,
      category_id: product.categoryId,
      is_active: product.isActive ?? true,
      is_featured: product.isFeatured ?? false,
      is_new: product.isNew ?? false,
      is_on_sale: product.isOnSale ?? false,
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      models: product.models || []
    };

    if (product.sku) payload.sku = product.sku;
    if (product.detailedDescription) payload.detailed_description = product.detailedDescription;
    if (product.promotionalPrice) payload.promotional_price = product.promotionalPrice;
    if (product.subcategoryId) payload.subcategory_id = product.subcategoryId;
    if (product.videoUrl) payload.video_url = product.videoUrl;
    if (product.sizeChart) payload.size_chart = product.sizeChart;
    if (product.variants) payload.variants = product.variants;
    if (product.seoTitle) payload.seo_title = product.seoTitle;
    if (product.seoDescription) payload.seo_description = product.seoDescription;
    if (product.weightGrams !== undefined) payload.weight_grams = product.weightGrams;
    if (product.heightCm !== undefined) payload.height_cm = product.heightCm;
    if (product.widthCm !== undefined) payload.width_cm = product.widthCm;
    if (product.lengthCm !== undefined) payload.length_cm = product.lengthCm;

    const { data, error } = await supabase.from('products').insert([payload]).select();
    assertSaved(error);
    const row = data?.[0];
    return { ...product, id: String(row.id), createdAt: row.created_at, updatedAt: row.created_at ?? row.updated_at };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.promotionalPrice !== undefined) payload.promotional_price = updates.promotionalPrice;
    if (updates.stockQuantity !== undefined) payload.stock_quantity = updates.stockQuantity;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.subcategoryId !== undefined) payload.subcategory_id = updates.subcategoryId;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
    if (updates.isNew !== undefined) payload.is_new = updates.isNew;
    if (updates.isOnSale !== undefined) payload.is_on_sale = updates.isOnSale;
    if (updates.images !== undefined) payload.images = updates.images;
    if (updates.sizes !== undefined) payload.sizes = updates.sizes;
    if (updates.colors !== undefined) payload.colors = updates.colors;
    if (updates.models !== undefined) payload.models = updates.models;
    if (updates.variants !== undefined) payload.variants = updates.variants;
    if (updates.sizeChart !== undefined) payload.size_chart = updates.sizeChart;
    if (updates.weightGrams !== undefined) payload.weight_grams = updates.weightGrams;
    if (updates.heightCm !== undefined) payload.height_cm = updates.heightCm;
    if (updates.widthCm !== undefined) payload.width_cm = updates.widthCm;
    if (updates.lengthCm !== undefined) payload.length_cm = updates.lengthCm;

    const { error } = await supabase.from('products').update(payload).eq('id', id);
    assertSaved(error);
  },

  async deleteProduct(id: string): Promise<void> {
    const supabase = requireSupabase();
    const { error } = await supabase.from('products').delete().eq('id', id);
    assertSaved(error);
  },

  async insertBanner(banner: Omit<Banner, 'id'> & { id?: string }): Promise<Banner> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {
      title: banner.title,
      subtitle: banner.subtitle || null,
      image_url: banner.imageUrl,
      mobile_image_url: banner.mobileImageUrl || null,
      link_url: banner.ctaLink || banner.linkUrl || 'sungas',
      button_text: banner.ctaText || banner.buttonText || 'Ver Coleção',
      display_order: banner.displayOrder ?? banner.order ?? 1,
      is_active: banner.isActive !== false,
      object_position: banner.objectPosition || 'center center',
      mobile_object_position: banner.mobileObjectPosition || 'center center'
    };

    const { data, error } = await supabase.from('banners').insert([payload]).select();
    assertSaved(error);
    return { ...banner, id: String(data?.[0].id) };
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<void> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.mobileImageUrl !== undefined) payload.mobile_image_url = updates.mobileImageUrl;
    if (updates.ctaLink !== undefined || updates.linkUrl !== undefined) {
      payload.link_url = updates.ctaLink || updates.linkUrl;
    }
    if (updates.ctaText !== undefined || updates.buttonText !== undefined) {
      payload.button_text = updates.ctaText || updates.buttonText;
    }
    if (updates.displayOrder !== undefined || updates.order !== undefined) {
      payload.display_order = updates.displayOrder ?? updates.order;
    }
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.objectPosition !== undefined) payload.object_position = updates.objectPosition;
    if (updates.mobileObjectPosition !== undefined) payload.mobile_object_position = updates.mobileObjectPosition;

    const { error } = await supabase.from('banners').update(payload).eq('id', id);
    assertSaved(error);
  },

  async deleteBanner(id: string): Promise<void> {
    const supabase = requireSupabase();
    const { error } = await supabase.from('banners').delete().eq('id', id);
    assertSaved(error);
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
    if (updates.trackingCode !== undefined) payload.tracking_code = updates.trackingCode;
    if (updates.trackingCarrier !== undefined) payload.tracking_carrier = updates.trackingCarrier;
    if (updates.trackingUrl !== undefined) payload.tracking_url = updates.trackingUrl;
    if (updates.shippedAt !== undefined) payload.shipped_at = updates.shippedAt;
    if (updates.stoneTransactionId !== undefined) payload.stone_transaction_id = updates.stoneTransactionId;

    const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
    assertSaved(error);
  },

  async insertCategory(cat: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {
      name: cat.name,
      slug: cat.slug,
      description: cat.description || null,
      image_url: cat.imageUrl || null,
      display_order: cat.displayOrder ?? 1,
      is_active: cat.isActive !== false
    };

    const { data, error } = await supabase.from('categories').insert([payload]).select();
    assertSaved(error);
    return { ...cat, id: String(data?.[0].id) };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { error } = await supabase.from('categories').update(payload).eq('id', id);
    assertSaved(error);
  },

  async deleteCategory(id: string): Promise<void> {
    const supabase = requireSupabase();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    assertSaved(error);
  },

  async insertSubcategory(sub: Omit<Subcategory, 'id'> & { id?: string }): Promise<Subcategory> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {
      category_id: sub.categoryId,
      name: sub.name,
      slug: sub.slug,
      display_order: sub.displayOrder ?? 1,
      is_active: sub.isActive !== false
    };

    const { data, error } = await supabase.from('subcategories').insert([payload]).select();
    assertSaved(error);
    return { ...sub, id: String(data?.[0].id) };
  },

  async updateSubcategory(id: string, updates: Partial<Subcategory>): Promise<void> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { error } = await supabase.from('subcategories').update(payload).eq('id', id);
    assertSaved(error);
  },

  async deleteSubcategory(id: string): Promise<void> {
    const supabase = requireSupabase();
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    assertSaved(error);
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<void> {
    const supabase = requireSupabase();
    const payload: Record<string, any> = { id: 1, updated_at: new Date().toISOString() };
    if (settings.storeName !== undefined) payload.store_name = settings.storeName;
    if (settings.tagline !== undefined) payload.tagline = settings.tagline;
    if (settings.whatsappNumber !== undefined) payload.whatsapp_number = settings.whatsappNumber;
    if (settings.instagramHandle !== undefined) payload.instagram_handle = settings.instagramHandle;
    if (settings.contactEmail !== undefined) payload.contact_email = settings.contactEmail;
    if (settings.legalName !== undefined) payload.legal_name = settings.legalName;
    if (settings.cnpj !== undefined) payload.cnpj = settings.cnpj;
    if (settings.address !== undefined) payload.address = settings.address;
    if (settings.aboutText !== undefined) payload.about_text = settings.aboutText;
    if (settings.aboutMission !== undefined) payload.about_mission = settings.aboutMission;
    if (settings.shippingPolicy !== undefined) payload.shipping_policy = settings.shippingPolicy;
    if (settings.returnPolicy !== undefined) payload.return_policy = settings.returnPolicy;
    if (settings.privacyPolicy !== undefined) payload.privacy_policy = settings.privacyPolicy;
    const { error } = await supabase.from('store_settings').upsert(payload);
    assertSaved(error);
  }
};
