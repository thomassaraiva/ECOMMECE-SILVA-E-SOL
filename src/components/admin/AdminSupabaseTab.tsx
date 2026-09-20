import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  FolderArchive,
  Layers,
  Sparkles
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

const SUPABASE_SCHEMA_SQL = `-- ==========================================================
-- SILVA E SOL • SCHEMA COMPLETO SUPABASE POSTGRESQL (PRODUÇÃO)
-- Inclui tabelas, chaves compatíveis (UUID/TEXT), RLS e Storage Buckets
-- ==========================================================

-- 1. Extensões
create extension if not exists "uuid-ossp";

-- 2. Tabela de Categorias
create table if not exists public.categories (
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  display_order integer default 1,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Subcategorias
create table if not exists public.subcategories (
  id text primary key default uuid_generate_v4()::text,
  category_id text references public.categories(id) on delete cascade not null,
  name text not null,
  slug text not null,
  display_order integer default 1,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Produtos
create table if not exists public.products (
  id text primary key default uuid_generate_v4()::text,
  category_id text references public.categories(id) on delete set null,
  subcategory_id text references public.subcategories(id) on delete set null,
  name text not null,
  slug text unique not null,
  sku text,
  brand text default 'Silva e Sol',
  description text not null,
  detailed_description text,
  price numeric(10,2) not null,
  promotional_price numeric(10,2),
  is_on_sale boolean default false,
  promotion_start_date date,
  promotion_end_date date,
  stock_quantity integer default 10 not null,
  is_featured boolean default false,
  is_new boolean default false,
  is_active boolean default true,
  images text[] default array[]::text[],
  video_url text,
  sizes text[] default array[]::text[],
  colors text[] default array[]::text[],
  models text[] default array[]::text[],
  size_chart jsonb,
  seo_title text,
  seo_description text,
  weight_grams numeric(8,2) default 250,
  height_cm numeric(8,2) default 4,
  width_cm numeric(8,2) default 16,
  length_cm numeric(8,2) default 22,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Variações de Produto (SKU por grade)
create table if not exists public.product_variants (
  id text primary key default uuid_generate_v4()::text,
  product_id text references public.products(id) on delete cascade not null,
  size text,
  color text,
  model text,
  sku text,
  stock_quantity integer default 0 not null,
  price numeric(10,2),
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabela de Banners da Home
create table if not exists public.banners (
  id text primary key default uuid_generate_v4()::text,
  title text not null,
  subtitle text,
  image_url text not null,
  mobile_image_url text,
  link_url text not null default '/catalogo',
  button_text text default 'Ver Coleção',
  display_order integer default 1,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabela de Perfis de Clientes
create table if not exists public.customer_profiles (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text,
  cpf text,
  address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Tabela de Pedidos
create table if not exists public.orders (
  id text primary key default uuid_generate_v4()::text,
  order_number text unique not null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_cpf text,
  customer_city text,
  customer_address text,
  customer_notes text,
  shipping_cost numeric(10,2) default 0,
  shipping_carrier text,
  payment_method text default 'whatsapp',
  payment_status text default 'pending',
  stone_transaction_id text,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null,
  status text default 'pending_whatsapp' not null,
  items jsonb default '[]'::jsonb,
  tracking_code text,
  tracking_carrier text,
  tracking_url text,
  shipped_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Tabela de Itens de Pedido
create table if not exists public.order_items (
  id text primary key default uuid_generate_v4()::text,
  order_id text references public.orders(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  size text,
  color text,
  model text,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Tabela de Configurações da Loja
create table if not exists public.store_settings (
  id text primary key default uuid_generate_v4()::text,
  store_name text not null default 'Silva e Sol',
  store_tagline text default 'Moda Masculina Praia & Solar',
  whatsapp_number text not null default '5581920019982',
  contact_email text default 'contato@silvaesol.com.br',
  instagram_handle text default '@silvaesol',
  free_shipping_threshold numeric(10,2) default 249.90,
  shipping_policy text,
  return_policy text,
  privacy_policy text,
  about_title text,
  about_text text,
  about_mission text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) - SEGURANÇA POR PAPEL
-- ==========================================================
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.banners enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;

-- Leitura Pública para catálogo da loja
create policy "Categorias visíveis para todos" on public.categories for select using (true);
create policy "Subcategorias visíveis para todos" on public.subcategories for select using (true);
create policy "Produtos visíveis para todos" on public.products for select using (true);
create policy "Variações visíveis para todos" on public.product_variants for select using (true);
create policy "Banners visíveis para todos" on public.banners for select using (true);
create policy "Configurações visíveis para todos" on public.store_settings for select using (true);

-- Gravação e Edição Restrita a Usuários Autenticados (Admin)
create policy "Admin total em categorias" on public.categories for all using (auth.role() = 'authenticated');
create policy "Admin total em subcategorias" on public.subcategories for all using (auth.role() = 'authenticated');
create policy "Admin total em produtos" on public.products for all using (auth.role() = 'authenticated');
create policy "Admin total em variações" on public.product_variants for all using (auth.role() = 'authenticated');
create policy "Admin total em banners" on public.banners for all using (auth.role() = 'authenticated');
create policy "Admin total em pedidos" on public.orders for all using (auth.role() = 'authenticated');
create policy "Admin total em itens de pedidos" on public.order_items for all using (auth.role() = 'authenticated');
create policy "Admin total em configurações" on public.store_settings for all using (auth.role() = 'authenticated');
create policy "Admin total em clientes" on public.customer_profiles for all using (auth.role() = 'authenticated');

-- Inserção de pedidos e clientes liberada para o checkout
create policy "Checkout cria pedidos" on public.orders for insert with check (true);
create policy "Checkout cria itens" on public.order_items for insert with check (true);
create policy "Clientes criam perfil" on public.customer_profiles for all using (true) with check (true);

-- ==========================================================
-- BUCKETS SUPABASE STORAGE (FOTOS E BANNERS)
-- ==========================================================
insert into storage.buckets (id, name, public) 
values 
  ('products', 'products', true),
  ('banners', 'banners', true),
  ('institutional', 'institutional', true)
on conflict (id) do nothing;

create policy "Imagens públicas de produtos" on storage.objects for select using (bucket_id = 'products');
create policy "Upload de produtos autenticado" on storage.objects for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');
create policy "Delete de produtos autenticado" on storage.objects for delete using (bucket_id = 'products' and auth.role() = 'authenticated');

create policy "Banners públicos" on storage.objects for select using (bucket_id = 'banners');
create policy "Upload de banners autenticado" on storage.objects for insert with check (bucket_id = 'banners' and auth.role() = 'authenticated');
`;

export const AdminSupabaseTab: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const configured = isSupabaseConfigured;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Status da Conexão */}
      <div className={`p-6 rounded-3xl border ${
        configured
          ? 'bg-emerald-950/40 border-emerald-800'
          : 'bg-stone-900 border-amber-800/60'
      } shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${
            configured ? 'bg-emerald-900/60 text-emerald-400' : 'bg-amber-950 text-amber-400'
          } flex items-center justify-center shrink-0`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-lg text-white">
                Status da Conexão Supabase
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                configured
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {configured ? 'Conectado & Ativo' : 'Modo Demonstração Local'}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              {configured
                ? 'Suas credenciais do Supabase estão configuradas. As operações de leitura e escrita utilizam o backend em nuvem.'
                : 'A área administrativa está 100% funcional com persistência local avançada (localStorage) e preparada para conectar ao seu projeto Supabase a qualquer momento.'}
            </p>
          </div>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs transition-colors self-start md:self-auto"
        >
          <span>Abrir Supabase Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Guia de Passo a Passo */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Guia Rápido de 3 Minutos para Conectar seu Supabase</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-300 pt-2">
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#2A8882]/20 text-[#2A8882] font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-white">Criar Projeto no Supabase</h4>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Acesse <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-teal-400 underline">supabase.com</a>, crie um novo projeto gratuito e selecione a região <strong>São Paulo (sa-east-1)</strong> para menor latência no Brasil.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#2A8882]/20 text-[#2A8882] font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-white">Executar o Script SQL</h4>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              No menu lateral do Supabase, clique em <strong>SQL Editor</strong>, crie uma "New Query", cole o código abaixo e clique em <strong>Run</strong>. Todas as tabelas, índices e buckets serão criados.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#2A8882]/20 text-[#2A8882] font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-white">Inserir as Chaves no .env</h4>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Vá em <strong>Project Settings &gt; API</strong>, copie a <strong>URL</strong> e a chave <strong>anon key</strong> e cole nas variáveis <code className="text-amber-300">VITE_SUPABASE_URL</code> e <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Script SQL com Botão de Copiar */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-200">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-heading font-extrabold text-base text-white">
              Script SQL de Criação de Tabelas, RLS e Buckets
            </h3>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado para o Clipboard!' : 'Copiar Script SQL'}</span>
          </button>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950">
          <pre className="p-4 text-[11px] font-mono text-teal-300/90 overflow-x-auto max-h-96 leading-relaxed">
            {SUPABASE_SCHEMA_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
};
