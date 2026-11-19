-- Testes das regras de acesso. Rodar só no silvaesol-teste.
-- Tudo acontece dentro de uma transação desfeita no fim: nada fica gravado.
begin;

insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@teste.local', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000c1', 'cliente@teste.local', 'authenticated', 'authenticated');
insert into public.admins (user_id) values ('00000000-0000-0000-0000-0000000000a1');
insert into public.categories (id, name, slug) values ('cat-teste', 'Teste', 'teste');
insert into public.products (id, name, slug, description, price, is_active, category_id) values
  ('p-ativo', 'Ativo', 'ativo', 'x', 100, true, 'cat-teste'),
  ('p-inativo', 'Inativo', 'inativo', 'x', 100, false, 'cat-teste');
insert into public.orders (id, order_number, customer_name, customer_phone, subtotal, total)
  values ('o-1', 'T-1', 'Cliente', '000', 10, 10);

-- 1. Visitante vê só o produto ativo
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$ begin
  if (select count(*) from public.products) <> 1 then
    raise exception 'FALHOU 1: visitante deveria ver só 1 produto ativo';
  end if;
end $$;

-- 2. Visitante não grava produto
do $$ begin
  begin
    insert into public.products (name, slug, description, price) values ('x', 'x-anon', 'x', 1);
    raise exception 'FALHOU 2: visitante gravou produto';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 3. Visitante não lê pedidos
do $$ begin
  begin
    perform count(*) from public.orders;
    raise exception 'FALHOU 3: visitante leu pedidos';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 4. Conta comum logada (mesmo com duas etapas) não grava e não lê pedidos
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000c1","aal":"aal2"}';
do $$ begin
  begin
    insert into public.products (name, slug, description, price) values ('x', 'x-cliente', 'x', 1);
    raise exception 'FALHOU 4a: conta comum gravou produto';
  exception when insufficient_privilege then null;
  end;
  if (select count(*) from public.orders) <> 0 then
    raise exception 'FALHOU 4b: conta comum leu pedidos';
  end if;
  update public.products set price = 1 where id = 'p-ativo';
  if (select price from public.products where id = 'p-ativo') <> 100 then
    raise exception 'FALHOU 4c: conta comum alterou preço';
  end if;
end $$;

-- 5. Administrador sem duas etapas (aal1) não grava
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000a1","aal":"aal1"}';
do $$ begin
  begin
    insert into public.products (name, slug, description, price) values ('x', 'x-aal1', 'x', 1);
    raise exception 'FALHOU 5: administrador sem duas etapas gravou produto';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 6. Administrador com duas etapas grava, vê inativos e lê pedidos
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000a1","aal":"aal2"}';
do $$ begin
  insert into public.products (name, slug, description, price) values ('Novo', 'novo-admin', 'x', 50);
  if (select count(*) from public.products) <> 3 then
    raise exception 'FALHOU 6a: administrador deveria ver 3 produtos';
  end if;
  if (select count(*) from public.orders) <> 1 then
    raise exception 'FALHOU 6b: administrador deveria ler o pedido';
  end if;
end $$;

-- 7. Promoção maior ou igual ao preço é recusada
do $$ begin
  begin
    insert into public.products (name, slug, description, price, promotional_price)
      values ('Promo', 'promo-errada', 'x', 100, 120);
    raise exception 'FALHOU 7: promoção maior que o preço foi aceita';
  exception when check_violation then null;
  end;
end $$;

-- 8. Ninguém lê a lista de administradores pela API
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000c1","aal":"aal2"}';
do $$ begin
  begin
    perform count(*) from public.admins;
    raise exception 'FALHOU 8: conta comum leu a tabela admins';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
select 'RLS: todos os testes passaram' as resultado;
rollback;
