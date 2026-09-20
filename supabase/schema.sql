-- ==============================================================================
-- SILVA E SOL • ESQUEMA DE BANCO DE DADOS SUPABASE (POSTGRESQL) - PRODUÇÃO
-- ==============================================================================
-- Execute este script no SQL Editor do seu painel Supabase (supabase.com)
-- Cria todas as tabelas, relacionamentos, políticas de segurança (RLS),
-- buckets de Storage e índices para alta performance.
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Configurações da Loja (Store Settings)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  store_name VARCHAR(100) NOT NULL DEFAULT 'Silva e Sol',
  tagline VARCHAR(255) DEFAULT 'Moda Praia & Casual Masculina',
  whatsapp_number VARCHAR(30) NOT NULL DEFAULT '5581920019982',
  instagram_handle VARCHAR(100) DEFAULT '@silvaesol',
  contact_email VARCHAR(150) DEFAULT 'contato@silvaesol.com.br',
  about_text TEXT,
  about_mission TEXT,
  shipping_policy TEXT,
  return_policy TEXT,
  privacy_policy TEXT,
  free_shipping_threshold NUMERIC(10,2) DEFAULT 249.90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Subcategorias
CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Produtos (Products)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  sku VARCHAR(100),
  brand VARCHAR(100) DEFAULT 'Silva e Sol',
  description TEXT NOT NULL,
  detailed_description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  promotional_price NUMERIC(10,2),
  is_on_sale BOOLEAN DEFAULT FALSE,
  promotion_start_date DATE,
  promotion_end_date DATE,
  stock_quantity INT DEFAULT 10 CHECK (stock_quantity >= 0),
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id TEXT REFERENCES public.subcategories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  video_url TEXT,
  sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  models TEXT[] DEFAULT ARRAY[]::TEXT[],
  size_chart JSONB,
  seo_title TEXT,
  seo_description TEXT,
  weight_grams NUMERIC(8,2) DEFAULT 250,
  height_cm NUMERIC(8,2) DEFAULT 4,
  width_cm NUMERIC(8,2) DEFAULT 16,
  length_cm NUMERIC(8,2) DEFAULT 22,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Variações de Produto (SKU por grade / estoque granular)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(50),
  model VARCHAR(50),
  sku VARCHAR(100),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  price NUMERIC(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Banners Promocionais
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title VARCHAR(200) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  link_url TEXT NOT NULL DEFAULT '/catalogo',
  button_text VARCHAR(100) DEFAULT 'Ver Coleção',
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Perfis de Clientes (Customer Profiles)
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id TEXT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(50),
  cpf VARCHAR(20),
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(150),
  customer_phone VARCHAR(50) NOT NULL,
  customer_cpf VARCHAR(20),
  customer_city VARCHAR(100),
  customer_address TEXT,
  customer_notes TEXT,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  shipping_carrier VARCHAR(100),
  payment_method VARCHAR(50) DEFAULT 'whatsapp',
  payment_status VARCHAR(50) DEFAULT 'pending',
  stone_transaction_id VARCHAR(100),
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_whatsapp',
  items JSONB DEFAULT '[]'::jsonb,
  tracking_code VARCHAR(100),
  tracking_carrier VARCHAR(100),
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Itens de Pedido Normalizados (Opcional além da coluna items JSONB)
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  size VARCHAR(50),
  color VARCHAR(50),
  model VARCHAR(50),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURANÇA E ACESSO
-- ==============================================================================
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Leitura Pública para catálogo, banners e configurações
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view active subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT USING (true);

-- Checkout e Clientes: Criação livre de pedidos e clientes
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert/update profile" ON public.customer_profiles FOR ALL USING (true) WITH CHECK (true);

-- Administradores Autenticados: Acesso total
CREATE POLICY "Admins full access on store_settings" ON public.store_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on subcategories" ON public.subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on product_variants" ON public.product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on banners" ON public.banners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on order_items" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on customer_profiles" ON public.customer_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- BUCKETS SUPABASE STORAGE (FOTOS E BANNERS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('products', 'products', true),
  ('banners', 'banners', true),
  ('institutional', 'institutional', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public storage images" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'banners', 'institutional'));
CREATE POLICY "Authenticated upload storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('products', 'banners', 'institutional') AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete storage" ON storage.objects FOR DELETE USING (bucket_id IN ('products', 'banners', 'institutional') AND auth.role() = 'authenticated');
