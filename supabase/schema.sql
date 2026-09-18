-- ==============================================================================
-- SILVA E SOL - ESQUEMA DE BANCO DE DADOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase para criar todas as
-- tabelas, relacionamentos, políticas de segurança (RLS) e dados iniciais.
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Configurações da Loja (Store Settings)
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name VARCHAR(100) NOT NULL DEFAULT 'Silva e Sol',
  tagline VARCHAR(255) DEFAULT 'Moda Praia & Casual Masculina',
  whatsapp_number VARCHAR(20) NOT NULL DEFAULT '5585999999999',
  instagram_handle VARCHAR(100) DEFAULT '@silvaesol',
  contact_email VARCHAR(150) DEFAULT 'contato@silvaesol.com.br',
  about_text TEXT DEFAULT 'Nascida sob a luminosidade e a vibração acolhedora do litoral nordestino...',
  about_mission TEXT DEFAULT 'Vestir homens autênticos com roupas leves, confortáveis e duráveis...',
  shipping_policy TEXT,
  return_policy TEXT,
  privacy_policy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Subcategorias
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 5. Tabela de Produtos (Products)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  sku VARCHAR(100),
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  promotional_price DECIMAL(10,2) CHECK (promotional_price IS NULL OR promotional_price < price),
  is_on_sale BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  stock_quantity INT DEFAULT 10 CHECK (stock_quantity >= 0),
  colors JSONB DEFAULT '[]'::jsonb, -- Ex: ["Preto", "Verde Musgo", "Amarelo Mostarda"]
  sizes JSONB DEFAULT '[]'::jsonb,  -- Ex: ["P", "M", "G", "GG"]
  models JSONB DEFAULT '[]'::jsonb, -- Ex: ["Slim", "Tradicional"]
  images JSONB DEFAULT '[]'::jsonb, -- Array de URLs de imagens
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Variações de Produto (Product Variants com estoque granular)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(50),
  model VARCHAR(50),
  sku VARCHAR(100),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  additional_price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size, color, model)
);

-- 7. Tabela de Banners Promocionais
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  subtitle TEXT,
  cta_text VARCHAR(100) DEFAULT 'Ver Coleção',
  cta_link VARCHAR(255) DEFAULT '/catalogo',
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Pedidos (Orders - Registrados via WhatsApp / Checkout)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(50),
  customer_city VARCHAR(100),
  customer_notes TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_whatsapp', -- pending_whatsapp, confirmed, paid, shipped, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Itens do Pedido (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  size VARCHAR(50),
  color VARCHAR(50),
  model VARCHAR(50),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Leitura Pública para catálogo ativo, categorias, banners e configurações
CREATE POLICY "Public can view store settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active subcategories" ON subcategories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public can view active banners" ON banners FOR SELECT USING (is_active = true);

-- Clientes podem criar pedidos (inserção livre)
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Apenas Usuários Autenticados (Admins) possuem permissão total de escrita e leitura administrativa
CREATE POLICY "Admins full access on store_settings" ON store_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on subcategories" ON subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on product_variants" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on banners" ON banners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
