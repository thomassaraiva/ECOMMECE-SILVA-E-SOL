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
  } catch (e: any) {
    console.warn('Aviso de armazenamento local (quota excedida). Salvando versão otimizada em cache:', e?.message || e);
    try {
      // Cria uma versão de cache enxuta para o localStorage para não bloquear a interface
      const lightweightState: StoreState = {
        ...state,
        banners: state.banners.map(b => ({
          ...b,
          imageUrl: (b.imageUrl?.startsWith('data:image') && b.imageUrl.length > 30000) ? b.imageUrl.slice(0, 100) + '...' : b.imageUrl,
          mobileImageUrl: (b.mobileImageUrl?.startsWith('data:image') && b.mobileImageUrl.length > 30000) ? b.mobileImageUrl.slice(0, 100) + '...' : b.mobileImageUrl
        })),
        products: state.products.map(p => ({
          ...p,
          // Se a imagem for um base64 longo, encurta no cache local do navegador
          images: p.images.map(img => (img.startsWith('data:image') && img.length > 30000 ? img.slice(0, 200) + '...' : img)),
          variants: p.variants?.map(v => ({
            ...v,
            imageUrl: (v.imageUrl?.startsWith('data:image') && v.imageUrl.length > 30000) ? undefined : v.imageUrl
          }))
        }))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightState));
    } catch (innerErr) {
      console.warn('Não foi possível persistir no localStorage; os dados permanecem na memória e no Supabase.');
    }
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
        { data: productsData, error: prodErr },
        { data: categoriesData },
        { data: subcategoriesData },
        { data: bannersData, error: banErr },
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

      if (prodErr) console.warn('Aviso ao buscar produtos do Supabase:', prodErr.message);
      if (banErr) console.warn('Aviso ao buscar banners do Supabase:', banErr.message);

      if (productsData && productsData.length > 0) {
        // Mapear snake_case do Postgres para camelCase do TypeScript
        const mappedProducts: Product[] = productsData.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          slug: p.slug,
          sku: p.sku || undefined,
          brand: p.brand || 'Silva e Sol',
          description: p.description,
          detailedDescription: p.detailed_description || p.detailedDescription,
          price: Number(p.price),
          promotionalPrice: (p.promotional_price || p.promotionalPrice) ? Number(p.promotional_price || p.promotionalPrice) : undefined,
          isOnSale: Boolean(p.is_on_sale ?? p.isOnSale),
          isFeatured: Boolean(p.is_featured ?? p.isFeatured),
          isNew: Boolean(p.is_new ?? p.isNew),
          isActive: p.is_active !== undefined ? Boolean(p.is_active) : (p.isActive !== undefined ? Boolean(p.isActive) : true),
          categoryId: p.category_id || p.categoryId || 'cat-sungas',
          subcategoryId: p.subcategory_id || p.subcategoryId,
          stockQuantity: Number(p.stock_quantity ?? p.stockQuantity ?? 0),
          colors: Array.isArray(p.colors) ? p.colors : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          models: Array.isArray(p.models) ? p.models : [],
          images: Array.isArray(p.images) ? p.images : [],
          videoUrl: p.video_url || p.videoUrl,
          variants: p.variants,
          sizeChart: p.size_chart || p.sizeChart || getDefaultSizeChartForCategory(p.category_id || p.categoryId),
          seoTitle: p.seo_title || p.seoTitle,
          seoDescription: p.seo_description || p.seoDescription,
          weightGrams: Number(p.weight_grams ?? p.weightGrams ?? 200),
          heightCm: Number(p.height_cm ?? p.heightCm ?? 4),
          widthCm: Number(p.width_cm ?? p.widthCm ?? 15),
          lengthCm: Number(p.length_cm ?? p.lengthCm ?? 20),
          createdAt: p.created_at || p.createdAt,
          updatedAt: p.updated_at || p.updatedAt
        }));

        const mappedCategories: Category[] = (categoriesData && categoriesData.length > 0) 
          ? categoriesData.map((c: any) => ({
              id: String(c.id),
              name: c.name,
              slug: c.slug,
              description: c.description,
              imageUrl: c.image_url || c.imageUrl,
              displayOrder: c.display_order ?? c.displayOrder,
              isActive: c.is_active !== undefined ? Boolean(c.is_active) : true
            }))
          : INITIAL_CATEGORIES;

        const mappedSubcategories: Subcategory[] = (subcategoriesData && subcategoriesData.length > 0)
          ? subcategoriesData.map((s: any) => ({
              id: String(s.id),
              categoryId: s.category_id || s.categoryId,
              name: s.name,
              slug: s.slug,
              displayOrder: s.display_order ?? s.displayOrder,
              isActive: s.is_active !== undefined ? Boolean(s.is_active) : true
            }))
          : INITIAL_SUBCATEGORIES;

        const mappedBanners: Banner[] = (bannersData && bannersData.length > 0)
          ? bannersData.map((b: any) => ({
              id: String(b.id),
              title: b.title,
              subtitle: b.subtitle,
              ctaText: b.button_text || b.cta_text || b.ctaText || 'Conhecer Coleção',
              ctaLink: b.link_url || b.cta_link || b.ctaLink || 'sungas',
              imageUrl: b.image_url || b.imageUrl,
              mobileImageUrl: b.mobile_image_url || b.mobileImageUrl,
              displayOrder: b.display_order ?? b.displayOrder ?? 1,
              isActive: b.is_active !== undefined ? Boolean(b.is_active) : (b.isActive !== undefined ? Boolean(b.isActive) : true),
              objectPosition: b.object_position || b.objectPosition || 'center center',
              mobileObjectPosition: b.mobile_object_position || b.mobileObjectPosition || 'center center'
            }))
          : INITIAL_BANNERS;

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

  async insertProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Product> {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    let finalId = product.id || `prod-${Date.now()}`;

    if (supabase) {
      try {
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
        if (error) {
          console.warn('Erro na inserção do produto no Supabase:', error.message);
        } else if (data && data[0]?.id) {
          finalId = String(data[0].id);
        }
      } catch (err) {
        console.warn('Falha na chamada supabase.from("products").insert():', err);
      }
    }

    const createdProduct: Product = {
      ...product,
      id: finalId,
      createdAt: now,
      updatedAt: now
    };

    return createdProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
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

        await supabase.from('products').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Erro ao atualizar produto no Supabase:', err);
      }
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Erro ao remover produto do Supabase:', err);
      }
    }
  },

  async insertBanner(banner: Omit<Banner, 'id'> & { id?: string }): Promise<Banner> {
    const supabase = getSupabase();
    let finalId = banner.id || `banner-${Date.now()}`;

    if (supabase) {
      try {
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

        let { data, error } = await supabase.from('banners').insert([payload]).select();
        if (error && (error.message?.includes('object_position') || error.message?.includes('column'))) {
          // Se a tabela ainda não tiver as colunas de posição, tenta sem elas
          const { object_position, mobile_object_position, ...safePayload } = payload;
          const retry = await supabase.from('banners').insert([safePayload]).select();
          data = retry.data;
          error = retry.error;
        }

        if (error) {
          console.warn('Erro ao inserir banner no Supabase:', error.message);
        } else if (data && data[0]?.id) {
          finalId = String(data[0].id);
        }
      } catch (err) {
        console.warn('Falha na chamada supabase.from("banners").insert():', err);
      }
    }

    return {
      ...banner,
      id: finalId
    };
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
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
        if (error && (error.message?.includes('object_position') || error.message?.includes('column'))) {
          const { object_position, mobile_object_position, ...safePayload } = payload;
          await supabase.from('banners').update(safePayload).eq('id', id);
        }
      } catch (err) {
        console.warn('Erro ao atualizar banner no Supabase:', err);
      }
    }
  },

  async deleteBanner(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('banners').delete().eq('id', id);
      } catch (err) {
        console.warn('Erro ao deletar banner do Supabase:', err);
      }
    }
  },

  async saveOrder(order: Order): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('orders').insert({
          id: order.id,
          order_number: order.orderNumber,
          customer_name: order.customerName,
          customer_email: order.customerEmail || null,
          customer_phone: order.customerPhone,
          customer_cpf: order.customerCpf || null,
          customer_city: order.customerCity || order.shippingAddress?.city,
          customer_address: order.customerAddress || (order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.number} - ${order.shippingAddress.neighborhood}` : null),
          shipping_cost: order.shippingCost || 0,
          shipping_carrier: order.shippingOption?.carrier || null,
          payment_method: order.paymentMethod || 'whatsapp',
          payment_status: order.paymentStatus || 'pending',
          stone_transaction_id: order.stoneTransactionId || null,
          customer_notes: order.customerNotes,
          subtotal: order.subtotal,
          discount: order.discount,
          total: order.total,
          status: order.status,
          items: order.items
        });
      } catch (err) {
        console.warn('Falha ao gravar pedido no Supabase:', err);
      }
    }

    // Salvar localmente
    const current = loadLocalStoreState();
    current.orders = [order, ...current.orders];
    saveLocalStoreState(current);
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
        if (updates.trackingCode !== undefined) payload.tracking_code = updates.trackingCode;
        if (updates.trackingCarrier !== undefined) payload.shipping_carrier = updates.trackingCarrier;
        if (updates.trackingUrl !== undefined) payload.tracking_url = updates.trackingUrl;
        if (updates.shippedAt !== undefined) payload.shipped_at = updates.shippedAt;
        if (updates.stoneTransactionId !== undefined) payload.stone_transaction_id = updates.stoneTransactionId;

        await supabase.from('orders').update(payload).eq('id', orderId);
      } catch (err) {
        console.warn('Falha ao atualizar pedido no Supabase:', err);
      }
    }
  },

  async insertCategory(cat: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
    const supabase = getSupabase();
    let finalId = cat.id || `cat-${Date.now()}`;

    if (supabase) {
      try {
        const payload: Record<string, any> = {
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
          image_url: cat.imageUrl || null,
          display_order: cat.displayOrder ?? 1,
          is_active: cat.isActive !== false
        };

        const { data, error } = await supabase.from('categories').insert([payload]).select();
        if (error) {
          console.warn('Erro ao inserir categoria no Supabase:', error.message);
        } else if (data && data[0]?.id) {
          finalId = String(data[0].id);
        }
      } catch (err) {
        console.warn('Falha na chamada supabase.from("categories").insert():', err);
      }
    }

    return {
      ...cat,
      id: finalId
    };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload: Record<string, any> = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
        if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        await supabase.from('categories').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Erro ao atualizar categoria no Supabase:', err);
      }
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Erro ao deletar categoria no Supabase:', err);
      }
    }
  },

  async insertSubcategory(sub: Omit<Subcategory, 'id'> & { id?: string }): Promise<Subcategory> {
    const supabase = getSupabase();
    let finalId = sub.id || `sub-${Date.now()}`;

    if (supabase) {
      try {
        const payload: Record<string, any> = {
          category_id: sub.categoryId,
          name: sub.name,
          slug: sub.slug,
          display_order: sub.displayOrder ?? 1,
          is_active: sub.isActive !== false
        };

        const { data, error } = await supabase.from('subcategories').insert([payload]).select();
        if (error) {
          console.warn('Erro ao inserir subcategoria no Supabase:', error.message);
        } else if (data && data[0]?.id) {
          finalId = String(data[0].id);
        }
      } catch (err) {
        console.warn('Falha na chamada supabase.from("subcategories").insert():', err);
      }
    }

    return {
      ...sub,
      id: finalId
    };
  },

  async updateSubcategory(id: string, updates: Partial<Subcategory>): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload: Record<string, any> = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
        if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        await supabase.from('subcategories').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Erro ao atualizar subcategoria no Supabase:', err);
      }
    }
  },

  async deleteSubcategory(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('subcategories').delete().eq('id', id);
      } catch (err) {
        console.warn('Erro ao deletar subcategoria no Supabase:', err);
      }
    }
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (settings.storeName !== undefined) payload.store_name = settings.storeName;
        if (settings.tagline !== undefined) payload.tagline = settings.tagline;
        if (settings.whatsappNumber !== undefined) payload.whatsapp_number = settings.whatsappNumber;
        if (settings.instagramHandle !== undefined) payload.instagram_handle = settings.instagramHandle;
        if (settings.contactEmail !== undefined) payload.contact_email = settings.contactEmail;
        if (settings.aboutText !== undefined) payload.about_text = settings.aboutText;
        if (settings.aboutMission !== undefined) payload.about_mission = settings.aboutMission;
        if (settings.shippingPolicy !== undefined) payload.shipping_policy = settings.shippingPolicy;
        if (settings.returnPolicy !== undefined) payload.return_policy = settings.returnPolicy;
        if (settings.privacyPolicy !== undefined) payload.privacy_policy = settings.privacyPolicy;

        // Atualiza a primeira linha de store_settings ou cria se não existir
        const { data: existing } = await supabase.from('store_settings').select('id').limit(1).maybeSingle();
        if (existing?.id) {
          await supabase.from('store_settings').update(payload).eq('id', existing.id);
        } else {
          await supabase.from('store_settings').insert([payload]);
        }
      } catch (err) {
        console.warn('Falha ao atualizar configurações no Supabase:', err);
      }
    }
  }
};
