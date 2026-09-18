import { Product, Category, Subcategory, Banner, StoreSettings, Order } from '../types/ecommerce';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SUBCATEGORIES, INITIAL_BANNERS, INITIAL_SETTINGS } from './initialData';
import { getDefaultSizeChartForCategory } from '../data/sizeChartPresets';
import { getSupabase } from './supabase';

const STORAGE_KEY = 'silva_e_sol_store_data_v1';

export interface StoreState {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  banners: Banner[];
  settings: StoreSettings;
  orders: Order[];
}

// Carrega estado persistido ou inicializa com dados padrão da marca
export function loadLocalStoreState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.products && parsed.categories) {
        // Assegurar número oficial de WhatsApp atualizado
        if (!parsed.settings || parsed.settings.whatsappNumber === '5585988776655' || !parsed.settings.whatsappNumber) {
          parsed.settings = {
            ...(parsed.settings || INITIAL_SETTINGS),
            whatsappNumber: '5581920019982'
          };
        }

        // Assegurar tabela de medidas em todos os produtos
        let updated = false;
        parsed.products = parsed.products.map((p: Product) => {
          if (!p.sizeChart) {
            updated = true;
            return {
              ...p,
              sizeChart: getDefaultSizeChartForCategory(p.categoryId)
            };
          }
          return p;
        });

        if (updated || parsed.settings.whatsappNumber === '5581920019982') {
          saveLocalStoreState(parsed);
        }

        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar do localStorage, usando dados iniciais:', e);
  }

  const initial: StoreState = {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    subcategories: INITIAL_SUBCATEGORIES,
    banners: INITIAL_BANNERS,
    settings: INITIAL_SETTINGS,
    orders: []
  };

  saveLocalStoreState(initial);
  return initial;
}

export function saveLocalStoreState(state: StoreState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Falha ao salvar no localStorage:', e);
  }
}

// Camada de serviço preparada para Supabase com fallback inteligente
export const StoreService = {
  async fetchAll(): Promise<StoreState> {
    const supabase = getSupabase();
    if (!supabase) {
      return loadLocalStoreState();
    }

    try {
      const [
        { data: productsData },
        { data: categoriesData },
        { data: subcategoriesData },
        { data: bannersData },
        { data: settingsData },
        { data: ordersData }
      ] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('subcategories').select('*').order('display_order', { ascending: true }),
        supabase.from('banners').select('*').order('display_order', { ascending: true }),
        supabase.from('store_settings').select('*').limit(1).maybeSingle(),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ]);

      if (productsData && productsData.length > 0) {
        // Mapear snake_case do Postgres para camelCase do TypeScript
        const mappedProducts: Product[] = productsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          description: p.description,
          detailedDescription: p.detailed_description,
          price: Number(p.price),
          promotionalPrice: p.promotional_price ? Number(p.promotional_price) : undefined,
          isOnSale: Boolean(p.is_on_sale),
          isFeatured: Boolean(p.is_featured),
          isNew: Boolean(p.is_new),
          isActive: Boolean(p.is_active),
          categoryId: p.category_id,
          subcategoryId: p.subcategory_id,
          stockQuantity: Number(p.stock_quantity),
          colors: Array.isArray(p.colors) ? p.colors : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          models: Array.isArray(p.models) ? p.models : [],
          images: Array.isArray(p.images) ? p.images : [],
          sizeChart: p.size_chart || getDefaultSizeChartForCategory(p.category_id),
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));

        const mappedCategories: Category[] = (categoriesData || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.image_url,
          displayOrder: c.display_order,
          isActive: c.is_active
        }));

        const mappedSubcategories: Subcategory[] = (subcategoriesData || []).map((s: any) => ({
          id: s.id,
          categoryId: s.category_id,
          name: s.name,
          slug: s.slug,
          displayOrder: s.display_order,
          isActive: s.is_active
        }));

        const mappedBanners: Banner[] = (bannersData || []).map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          ctaText: b.cta_text,
          ctaLink: b.cta_link,
          imageUrl: b.image_url,
          mobileImageUrl: b.mobile_image_url,
          displayOrder: b.display_order,
          isActive: b.is_active
        }));

        const state: StoreState = {
          products: mappedProducts,
          categories: mappedCategories,
          subcategories: mappedSubcategories,
          banners: mappedBanners,
          settings: settingsData ? {
            id: settingsData.id,
            storeName: settingsData.store_name,
            tagline: settingsData.tagline,
            whatsappNumber: settingsData.whatsapp_number,
            instagramHandle: settingsData.instagram_handle,
            contactEmail: settingsData.contact_email,
            aboutText: settingsData.about_text,
            aboutMission: settingsData.about_mission,
            shippingPolicy: settingsData.shipping_policy,
            returnPolicy: settingsData.return_policy,
            privacyPolicy: settingsData.privacy_policy,
            freeShippingThreshold: 299
          } : INITIAL_SETTINGS,
          orders: (ordersData || []) as Order[]
        };

        saveLocalStoreState(state);
        return state;
      }
    } catch (err) {
      console.warn('Erro ao conectar ao Supabase, alternando para armazenamento local:', err);
    }

    return loadLocalStoreState();
  },

  async saveOrder(order: Order): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('orders').insert({
          id: order.id,
          order_number: order.orderNumber,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_city: order.customerCity,
          customer_notes: order.customerNotes,
          subtotal: order.subtotal,
          discount: order.discount,
          total: order.total,
          status: order.status
        });
      } catch (err) {
        console.warn('Falha ao gravar pedido no Supabase:', err);
      }
    }

    // Salvar localmente
    const current = loadLocalStoreState();
    current.orders = [order, ...current.orders];
    saveLocalStoreState(current);
  }
};
