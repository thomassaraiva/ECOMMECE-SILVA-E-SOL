import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  Category, 
  Subcategory, 
  Banner, 
  StoreSettings, 
  Order, 
  PageRoute, 
  CatalogFilters 
} from '../types/ecommerce';
import { StoreService, loadLocalStoreState, saveLocalStoreState, StoreState } from '../lib/storage';
import { initializeAnalytics, trackPageView, trackViewContent, trackSearch } from '../lib/analytics';

interface StoreContextType {
  products: Product[];
  filteredProducts: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  banners: Banner[];
  settings: StoreSettings;
  orders: Order[];
  isLoading: boolean;
  
  // Navegação
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  navigateToProduct: (product: Product) => void;
  navigateToCategory: (categoryId: string) => void;

  // Filtros de Catálogo
  filters: CatalogFilters;
  setFilters: React.Dispatch<React.SetStateAction<CatalogFilters>>;
  resetFilters: () => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Ações Administrativas
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product | null>;
  toggleProductStatus: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;

  addSubcategory: (sub: Omit<Subcategory, 'id'>) => Promise<void>;
  updateSubcategory: (id: string, updates: Partial<Subcategory>) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;

  addBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleBannerStatus: (id: string) => Promise<void>;

  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  resetToDefaultData: () => void;
  revalidateData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const defaultFilters: CatalogFilters = {
  searchQuery: '',
  categoryId: undefined,
  subcategoryId: undefined,
  selectedSize: undefined,
  selectedColor: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  onlyPromotions: false,
  sortBy: 'featured'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeState, setStoreState] = useState<StoreState>(() => loadLocalStoreState());
  const [isLoading, setIsLoading] = useState(true);

  // Navegação e Roteamento
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Função para revalidação imediata dos dados (sem cache, efeito similar a revalidate = 0)
  const revalidateData = async () => {
    try {
      const freshLocal = loadLocalStoreState();
      setStoreState(freshLocal);
      const data = await StoreService.fetchAll();
      setStoreState(data);
      saveLocalStoreState(data);
    } catch (err) {
      console.error('Erro ao revalidar dados da loja:', err);
    }
  };

  useEffect(() => {
    // Sincronizar dados iniciais (Supabase ou Local)
    async function loadData() {
      try {
        const data = await StoreService.fetchAll();
        setStoreState(data);
        if (data.settings) {
          initializeAnalytics({
            metaPixelId: data.settings.metaPixelId,
            googleAnalyticsId: data.settings.googleAnalyticsId,
            tiktokPixelId: data.settings.tiktokPixelId,
            enableTracking: data.settings.enableTracking
          });
        }
      } catch (err) {
        console.error('Erro ao sincronizar produtos:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Listener para sincronização instantânea entre abas e mutações (revalidate = 0)
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === 'silva_sol_store_state_v1' || e.key === 'silva_sol_last_revalidated_at') {
        const fresh = loadLocalStoreState();
        setStoreState(fresh);
      }
    };
    window.addEventListener('storage', handleStorageSync);

    // Rota administrativa direta via URL (/admin ou #admin)
    const checkAdminRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || path.startsWith('/admin/') || hash === '#admin') {
        setCurrentPage('admin-panel');
      }
    };
    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Rastreamento automático de PageView ao navegar entre telas
  useEffect(() => {
    trackPageView(currentPage);
  }, [currentPage]);

  // Rastreamento de buscas no catálogo
  useEffect(() => {
    if (filters.searchQuery && filters.searchQuery.trim().length >= 2) {
      const timeout = setTimeout(() => {
        trackSearch(filters.searchQuery);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [filters.searchQuery]);

  const updateStateAndPersist = (updater: (prev: StoreState) => StoreState) => {
    setStoreState(prev => {
      const next = updater(prev);
      saveLocalStoreState(next);
      try {
        localStorage.setItem('silva_sol_last_revalidated_at', Date.now().toString());
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const navigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    trackViewContent(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (categoryId: string) => {
    setFilters({
      ...defaultFilters,
      categoryId: categoryId === 'all' ? undefined : categoryId
    });
    setCurrentPage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Funções Administrativas de Produto
  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const newProd: Product = {
      ...prodData,
      id: newId,
      createdAt: now,
      updatedAt: now
    };

    updateStateAndPersist(prev => ({
      ...prev,
      products: [newProd, ...prev.products]
    }));
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    updateStateAndPersist(prev => ({
      ...prev,
      products: prev.products.map(p => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    }));
    if (selectedProduct?.id === id) {
      setSelectedProduct(prev => prev ? { ...prev, ...updates, updatedAt: now } : null);
    }
  };

  const deleteProduct = async (id: string) => {
    updateStateAndPersist(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
      setCurrentPage('catalog');
    }
  };

  const duplicateProduct = async (id: string): Promise<Product | null> => {
    const original = storeState.products.find(p => p.id === id);
    if (!original) return null;

    const newId = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const clonedName = `${original.name} (Cópia)`;
    const clonedSlug = `${original.slug}-copia-${Date.now().toString().slice(-4)}`;

    const cloned: Product = {
      ...original,
      id: newId,
      name: clonedName,
      slug: clonedSlug,
      sku: original.sku ? `${original.sku}-COP` : undefined,
      isNew: true,
      images: [...original.images],
      colors: [...original.colors],
      sizes: [...original.sizes],
      models: [...original.models],
      variants: original.variants ? original.variants.map((v, i) => ({
        ...v,
        id: `var-${newId}-${i}`,
        productId: newId,
        sku: v.sku ? `${v.sku}-C` : undefined
      })) : undefined,
      sizeChart: original.sizeChart ? {
        title: original.sizeChart.title,
        instructions: original.sizeChart.instructions,
        columns: [...original.sizeChart.columns],
        rows: original.sizeChart.rows.map(r => ({ size: r.size, values: [...r.values] }))
      } : undefined,
      createdAt: now,
      updatedAt: now
    };

    updateStateAndPersist(prev => ({
      ...prev,
      products: [cloned, ...prev.products]
    }));

    return cloned;
  };

  const toggleProductStatus = async (id: string) => {
    const now = new Date().toISOString();
    updateStateAndPersist(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, isActive: !p.isActive, updatedAt: now } : p)
    }));
  };

  // Funções Administrativas de Categoria
  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newId = `cat-${Date.now()}`;
    const newCat: Category = { ...catData, id: newId };
    updateStateAndPersist(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    updateStateAndPersist(prev => ({
      ...prev,
      categories: prev.categories.map(c => (c.id === id ? { ...c, ...updates } : c))
    }));
  };

  const deleteCategory = async (id: string) => {
    updateStateAndPersist(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      subcategories: prev.subcategories.filter(s => s.categoryId !== id)
    }));
  };

  const toggleCategoryStatus = async (id: string) => {
    updateStateAndPersist(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
    }));
  };

  // Subcategorias
  const addSubcategory = async (subData: Omit<Subcategory, 'id'>) => {
    const newId = `sub-${Date.now()}`;
    const newSub: Subcategory = { ...subData, id: newId };
    updateStateAndPersist(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSub]
    }));
  };

  const updateSubcategory = async (id: string, updates: Partial<Subcategory>) => {
    updateStateAndPersist(prev => ({
      ...prev,
      subcategories: prev.subcategories.map(s => (s.id === id ? { ...s, ...updates } : s))
    }));
  };

  const deleteSubcategory = async (id: string) => {
    updateStateAndPersist(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(s => s.id !== id)
    }));
  };

  // Banners
  const addBanner = async (bannerData: Omit<Banner, 'id'>) => {
    const newId = `banner-${Date.now()}`;
    const newBanner: Banner = { ...bannerData, id: newId };
    updateStateAndPersist(prev => ({
      ...prev,
      banners: [...prev.banners, newBanner]
    }));
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    updateStateAndPersist(prev => ({
      ...prev,
      banners: prev.banners.map(b => (b.id === id ? { ...b, ...updates } : b))
    }));
  };

  const deleteBanner = async (id: string) => {
    updateStateAndPersist(prev => ({
      ...prev,
      banners: prev.banners.filter(b => b.id !== id)
    }));
  };

  const toggleBannerStatus = async (id: string) => {
    updateStateAndPersist(prev => ({
      ...prev,
      banners: prev.banners.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b)
    }));
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const now = new Date().toISOString();
    updateStateAndPersist(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === orderId ? { ...o, status, updatedAt: now } : o)
    }));
  };

  // Configurações da Loja
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    updateStateAndPersist(prev => {
      const merged = { ...prev.settings, ...newSettings };
      initializeAnalytics({
        metaPixelId: merged.metaPixelId,
        googleAnalyticsId: merged.googleAnalyticsId,
        tiktokPixelId: merged.tiktokPixelId,
        enableTracking: merged.enableTracking
      });
      return {
        ...prev,
        settings: merged
      };
    });
  };

  const resetToDefaultData = () => {
    localStorage.removeItem('silva_e_sol_store_data_v1');
    const fresh = loadLocalStoreState();
    setStoreState(fresh);
  };

  const filteredProducts = useMemo(() => {
    let result = [...storeState.products];

    // Busca textual por nome, descrição, SKU ou tags
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    // Filtro por Categoria
    if (filters.categoryId) {
      result = result.filter(p => p.categoryId === filters.categoryId);
    }

    // Filtro por Subcategoria
    if (filters.subcategoryId) {
      result = result.filter(p => p.subcategoryId === filters.subcategoryId);
    }

    // Filtro por Tamanho
    if (filters.selectedSize) {
      result = result.filter(p => p.sizes.includes(filters.selectedSize!));
    }

    // Filtro por Cor
    if (filters.selectedColor) {
      result = result.filter(p => p.colors.some(c => c.toLowerCase().includes(filters.selectedColor!.toLowerCase())));
    }

    // Filtro por Preço Mínimo e Máximo
    if (filters.minPrice !== undefined) {
      result = result.filter(p => (p.promotionalPrice || p.price) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => (p.promotionalPrice || p.price) <= filters.maxPrice!);
    }

    // Filtro de Promoções
    if (filters.onlyPromotions) {
      result = result.filter(p => p.isOnSale && p.promotionalPrice && p.promotionalPrice < p.price);
    }

    // Ordenação
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => (a.promotionalPrice || a.price) - (b.promotionalPrice || b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.promotionalPrice || b.price) - (a.promotionalPrice || a.price));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }

    return result;
  }, [storeState.products, filters]);

  return (
    <StoreContext.Provider
      value={{
        products: storeState.products,
        filteredProducts,
        categories: storeState.categories,
        subcategories: storeState.subcategories,
        banners: storeState.banners,
        settings: storeState.settings,
        orders: storeState.orders,
        isLoading,
        currentPage,
        setCurrentPage,
        selectedProduct,
        setSelectedProduct,
        navigateToProduct,
        navigateToCategory,
        filters,
        setFilters,
        resetFilters,
        searchModalOpen,
        setSearchModalOpen,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleProductStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        updateOrderStatus,
        updateSettings,
        resetToDefaultData,
        revalidateData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
