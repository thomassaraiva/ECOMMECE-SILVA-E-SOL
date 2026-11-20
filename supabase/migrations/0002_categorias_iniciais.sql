insert into public.categories (id, name, slug, display_order) values
  ('cat-sungas', 'Sungas', 'sungas', 1),
  ('cat-camisetas-tule', 'Camisetas & Tule', 'camisetas-tule', 2),
  ('cat-bolsas-acessorios', 'Bolsas & Acessórios', 'bolsas-acessorios', 3)
on conflict (id) do nothing;

insert into public.store_settings (id) values (1) on conflict (id) do nothing;
