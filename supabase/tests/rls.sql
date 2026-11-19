-- Testes das regras de acesso. Rodar só no silvaesol-teste.
-- Tudo acontece dentro de uma transação desfeita no fim: nada fica gravado.
-- As contagens olham só as linhas criadas aqui, então o teste funciona com dados reais no banco.
-- "(permissão)" = barrado por falta de GRANT; os demais são barrados pela RLS (o papel tem o GRANT).
begin;

insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@teste.local', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000c1', 'cliente@teste.local', 'authenticated', 'authenticated');
insert into public.admins (user_id) values ('00000000-0000-0000-0000-0000000000a1');
insert into public.categories (id, name, slug, is_active) values
  ('cat-teste', 'Teste', 'teste-rls', true),
  ('cat-inativa', 'Inativa', 'inativa-rls', false);
insert into public.banners (id, title, image_url, is_active) values
  ('b-inativo', 'Inativo', 'https://exemplo.invalid/b.jpg', false);
insert into public.products (id, name, slug, description, price, is_active, category_id) values
  ('p-ativo', 'Ativo', 'ativo-rls', 'x', 100, true, 'cat-teste'),
  ('p-inativo', 'Inativo', 'inativo-rls', 'x', 100, false, 'cat-teste');
insert into public.orders (id, order_number, customer_name, customer_phone, subtotal, total)
  values ('o-1', 'T-RLS-1', 'Cliente', '000', 10, 10);
insert into storage.objects (bucket_id, name) values ('products', 'teste-rls/foto.jpg');

-- 0. Sem TRUNCATE para os papéis da API (permissão)
do $$ begin
  if has_table_privilege('anon', 'public.orders', 'TRUNCATE') then
    raise exception 'FALHOU 0a (permissão): anon tem TRUNCATE em orders';
  end if;
  if has_table_privilege('authenticated', 'public.products', 'TRUNCATE') then
    raise exception 'FALHOU 0b (permissão): authenticated tem TRUNCATE em products';
  end if;
  if has_table_privilege('authenticated', 'public.admins', 'TRUNCATE') then
    raise exception 'FALHOU 0c (permissão): authenticated tem TRUNCATE em admins';
  end if;
end $$;

-- 1. Visitante vê só o que está ativo e não lista fotos
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$ begin
  if (select count(*) from public.products where id in ('p-ativo', 'p-inativo')) <> 1 then
    raise exception 'FALHOU 1a: visitante deveria ver só 1 produto ativo';
  end if;
  if (select count(*) from public.categories where id = 'cat-inativa') <> 0 then
    raise exception 'FALHOU 1b: visitante viu categoria inativa';
  end if;
  if (select count(*) from public.banners where id = 'b-inativo') <> 0 then
    raise exception 'FALHOU 1c: visitante viu banner inativo';
  end if;
  if (select count(*) from storage.objects where bucket_id = 'products' and name = 'teste-rls/foto.jpg') <> 0 then
    raise exception 'FALHOU 1d: visitante listou fotos';
  end if;
end $$;

-- 2. Visitante não grava produto (permissão)
do $$ begin
  begin
    insert into public.products (name, slug, description, price) values ('x', 'x-anon', 'x', 1);
    raise exception 'FALHOU 2 (permissão): visitante gravou produto';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 3. Visitante não lê pedidos (permissão)
do $$ begin
  begin
    perform count(*) from public.orders;
    raise exception 'FALHOU 3 (permissão): visitante leu pedidos';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 4. Conta comum logada (mesmo com duas etapas) não grava, não lê nem altera pedidos, não vê fotos
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000c1","aal":"aal2"}';
do $$
declare n int;
begin
  begin
    insert into public.products (name, slug, description, price) values ('x', 'x-cliente', 'x', 1);
    raise exception 'FALHOU 4a: conta comum gravou produto';
  exception when insufficient_privilege then null;
  end;
  if (select count(*) from public.orders where id = 'o-1') <> 0 then
    raise exception 'FALHOU 4b: conta comum leu pedidos';
  end if;
  update public.products set price = 1 where id = 'p-ativo';
  get diagnostics n = row_count;
  if n <> 0 or (select price from public.products where id = 'p-ativo') <> 100 then
    raise exception 'FALHOU 4c: conta comum alterou preço';
  end if;
  update public.orders set status = 'cancelado' where id = 'o-1';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'FALHOU 4d: conta comum alterou pedido';
  end if;
  delete from public.products where id = 'p-ativo';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'FALHOU 4e: conta comum apagou produto';
  end if;
  if (select count(*) from storage.objects where bucket_id = 'products' and name = 'teste-rls/foto.jpg') <> 0 then
    raise exception 'FALHOU 4f: conta comum listou fotos';
  end if;
end $$;

-- 5. Administrador sem duas etapas (aal1) não grava, não altera e não apaga
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000a1","aal":"aal1"}';
do $$
declare n int;
begin
  begin
    insert into public.products (name, slug, description, price) values ('x', 'x-aal1', 'x', 1);
    raise exception 'FALHOU 5a: administrador sem duas etapas gravou produto';
  exception when insufficient_privilege then null;
  end;
  update public.products set price = 1 where id in ('p-ativo', 'p-inativo');
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'FALHOU 5b: administrador sem duas etapas alterou produto';
  end if;
  delete from public.products where id in ('p-ativo', 'p-inativo');
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'FALHOU 5c: administrador sem duas etapas apagou produto';
  end if;
end $$;

-- 6. Administrador com duas etapas grava, vê inativos, lê pedidos e vê as fotos
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000a1","aal":"aal2"}';
do $$ begin
  insert into public.products (name, slug, description, price) values ('Novo', 'novo-admin-rls', 'x', 50);
  if (select count(*) from public.products where id in ('p-ativo', 'p-inativo') or slug = 'novo-admin-rls') <> 3 then
    raise exception 'FALHOU 6a: administrador deveria ver 3 produtos';
  end if;
  if (select count(*) from public.orders where id = 'o-1') <> 1 then
    raise exception 'FALHOU 6b: administrador deveria ler o pedido';
  end if;
  if (select count(*) from public.categories where id = 'cat-inativa') <> 1 then
    raise exception 'FALHOU 6c: administrador deveria ver a categoria inativa';
  end if;
  if (select count(*) from storage.objects where bucket_id = 'products' and name = 'teste-rls/foto.jpg') <> 1 then
    raise exception 'FALHOU 6d: administrador deveria ver a foto';
  end if;
end $$;

-- 7. Promoção maior ou igual ao preço é recusada
do $$ begin
  begin
    insert into public.products (name, slug, description, price, promotional_price)
      values ('Promo', 'promo-errada-rls', 'x', 100, 120);
    raise exception 'FALHOU 7: promoção maior que o preço foi aceita';
  exception when check_violation then null;
  end;
end $$;

-- 8. Ninguém lê a lista de administradores pela API (permissão)
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000c1","aal":"aal2"}';
do $$ begin
  begin
    perform count(*) from public.admins;
    raise exception 'FALHOU 8 (permissão): conta comum leu a tabela admins';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 9. Conferência final, sem RLS: nada do que foi barrado mudou
reset role;
do $$ begin
  if (select count(*) from public.products where id in ('p-ativo', 'p-inativo') and price = 100) <> 2 then
    raise exception 'FALHOU 9a: produtos de teste foram alterados ou apagados';
  end if;
  if (select status from public.orders where id = 'o-1') <> 'pending_whatsapp' then
    raise exception 'FALHOU 9b: pedido de teste foi alterado';
  end if;
end $$;

select 'RLS: todos os testes passaram' as resultado;
rollback;
