-- S1 · Estrutura inicial da loja Silva e Sol.
-- RLS fechada por padrão; só administradores com verificação em duas etapas gravam.

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
     and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Silva e Sol',
  tagline text,
  whatsapp_number text not null default '5581920019982',
  instagram_handle text,
  contact_email text,
  legal_name text,
  cnpj text,
  address text,
  about_text text,
  about_mission text,
  shipping_policy text,
  return_policy text,
  privacy_policy text,
  free_shipping_threshold numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  display_order int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subcategories (
  id text primary key default gen_random_uuid()::text,
  category_id text not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  display_order int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text not null unique,
  sku text,
  brand text not null default 'Silva e Sol',
  description text not null,
  detailed_description text,
  price numeric(10,2) not null check (price >= 0),
  promotional_price numeric(10,2) check (promotional_price is null or (promotional_price >= 0 and promotional_price < price)),
  is_on_sale boolean not null default false,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  category_id text references public.categories(id) on delete set null,
  subcategory_id text references public.subcategories(id) on delete set null,
  images text[] not null default '{}',
  video_url text,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  models text[] not null default '{}',
  size_chart jsonb,
  variants jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  weight_grams numeric(8,2) not null default 200,
  height_cm numeric(8,2) not null default 4,
  width_cm numeric(8,2) not null default 15,
  length_cm numeric(8,2) not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.banners (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  subtitle text,
  image_url text not null,
  mobile_image_url text,
  link_url text not null default 'catalog',
  button_text text not null default 'Ver coleção',
  display_order int not null default 1,
  is_active boolean not null default true,
  object_position text not null default 'center center',
  mobile_object_position text not null default 'center center',
  created_at timestamptz not null default now()
);

create table public.orders (
  id text primary key default gen_random_uuid()::text,
  order_number text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_cpf text,
  customer_city text,
  customer_address text,
  customer_notes text,
  shipping_cost numeric(10,2) not null default 0,
  shipping_carrier text,
  payment_method text not null default 'whatsapp',
  payment_status text not null default 'pending',
  stone_transaction_id text,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'pending_whatsapp',
  items jsonb not null default '[]'::jsonb,
  tracking_code text,
  tracking_carrier text,
  tracking_url text,
  shipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.orders enable row level security;

-- Permissões de API (o projeto foi criado sem acesso automático a tabelas novas)
grant select on public.store_settings, public.categories, public.subcategories, public.products, public.banners to anon, authenticated;
grant insert, update, delete on public.store_settings, public.categories, public.subcategories, public.products, public.banners to authenticated;
grant select, update on public.orders to authenticated;

-- Leitura pública
create policy "Leitura pública dos dados da loja" on public.store_settings for select to anon, authenticated using (true);
create policy "Leitura pública de categorias ativas" on public.categories for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "Leitura pública de subcategorias ativas" on public.subcategories for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "Leitura pública de produtos ativos" on public.products for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "Leitura pública de banners ativos" on public.banners for select to anon, authenticated using (is_active or (select public.is_admin()));

-- Escrita só do administrador
create policy "Admin insere dados da loja" on public.store_settings for insert to authenticated with check ((select public.is_admin()));
create policy "Admin altera dados da loja" on public.store_settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin insere categorias" on public.categories for insert to authenticated with check ((select public.is_admin()));
create policy "Admin altera categorias" on public.categories for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin apaga categorias" on public.categories for delete to authenticated using ((select public.is_admin()));
create policy "Admin insere subcategorias" on public.subcategories for insert to authenticated with check ((select public.is_admin()));
create policy "Admin altera subcategorias" on public.subcategories for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin apaga subcategorias" on public.subcategories for delete to authenticated using ((select public.is_admin()));
create policy "Admin insere produtos" on public.products for insert to authenticated with check ((select public.is_admin()));
create policy "Admin altera produtos" on public.products for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin apaga produtos" on public.products for delete to authenticated using ((select public.is_admin()));
create policy "Admin insere banners" on public.banners for insert to authenticated with check ((select public.is_admin()));
create policy "Admin altera banners" on public.banners for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin apaga banners" on public.banners for delete to authenticated using ((select public.is_admin()));
create policy "Admin lê pedidos" on public.orders for select to authenticated using ((select public.is_admin()));
create policy "Admin altera pedidos" on public.orders for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Fotos: leitura pública pelo link (bucket público), envio e remoção só do administrador, sem listagem
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('banners', 'banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('institutional', 'institutional', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admin envia fotos" on storage.objects for insert to authenticated
  with check (bucket_id in ('products', 'banners', 'institutional') and (select public.is_admin()));
create policy "Admin altera fotos" on storage.objects for update to authenticated
  using (bucket_id in ('products', 'banners', 'institutional') and (select public.is_admin()));
create policy "Admin apaga fotos" on storage.objects for delete to authenticated
  using (bucket_id in ('products', 'banners', 'institutional') and (select public.is_admin()));
