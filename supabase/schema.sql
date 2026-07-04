-- 상품/입고/출고 관리 스키마
-- Supabase SQL Editor에서 그대로 실행하세요.
-- 전제: 로그인한 모든 사용자가 같은 회사의 재고를 공유해서 관리 (1인/소규모 팀 기준)

create extension if not exists "pgcrypto";

-- 상품 (현재 재고, 최근 매입가/판매가 스냅샷)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  purchase_price numeric(12, 2) not null default 0,
  sale_price numeric(12, 2) not null default 0,
  stock_quantity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 입고 이력 (수정/삭제 불가한 원장 형태)
create table if not exists stock_in (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  purchase_price numeric(12, 2) not null check (purchase_price >= 0),
  note text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- 출고 이력 (수정/삭제 불가한 원장 형태)
create table if not exists stock_out (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  sale_price numeric(12, 2) not null check (sale_price >= 0),
  note text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- 입고 시 재고 증가 + 최근 매입가 갱신
create or replace function handle_stock_in()
returns trigger as $$
begin
  update products
  set stock_quantity = stock_quantity + new.quantity,
      purchase_price = new.purchase_price,
      updated_at = now()
  where id = new.product_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_stock_in_after_insert on stock_in;
create trigger trg_stock_in_after_insert
after insert on stock_in
for each row execute function handle_stock_in();

-- 출고 시 재고 감소(음수 방지) + 최근 판매가 갱신
create or replace function handle_stock_out()
returns trigger as $$
declare
  current_stock integer;
begin
  select stock_quantity into current_stock from products where id = new.product_id for update;

  if current_stock is null or current_stock < new.quantity then
    raise exception '재고가 부족합니다 (현재 재고: %)', coalesce(current_stock, 0);
  end if;

  update products
  set stock_quantity = stock_quantity - new.quantity,
      sale_price = new.sale_price,
      updated_at = now()
  where id = new.product_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_stock_out_after_insert on stock_out;
create trigger trg_stock_out_after_insert
after insert on stock_out
for each row execute function handle_stock_out();

-- 출고 건별 마진율 조회 뷰
-- 주의: 매입가는 "현재" products.purchase_price 기준 근사치이며, 입고 시점 매입가(FIFO)와 다를 수 있습니다.
create or replace view stock_out_with_margin as
select
  so.*,
  p.name as product_name,
  p.purchase_price as current_purchase_price,
  (so.sale_price - p.purchase_price) as margin_amount,
  case when so.sale_price = 0 then null
       else round((so.sale_price - p.purchase_price) / so.sale_price * 100, 2)
  end as margin_rate_percent
from stock_out so
join products p on p.id = so.product_id;

-- Row Level Security: 로그인한 사용자는 모두 조회/입력 가능, 원장(stock_in/out)은 수정·삭제 불가
alter table products enable row level security;
alter table stock_in enable row level security;
alter table stock_out enable row level security;

drop policy if exists "authenticated read products" on products;
create policy "authenticated read products" on products
  for select to authenticated using (true);

drop policy if exists "authenticated write products" on products;
create policy "authenticated write products" on products
  for insert to authenticated with check (true);

drop policy if exists "authenticated update products" on products;
create policy "authenticated update products" on products
  for update to authenticated using (true) with check (true);

drop policy if exists "authenticated read stock_in" on stock_in;
create policy "authenticated read stock_in" on stock_in
  for select to authenticated using (true);

drop policy if exists "authenticated insert stock_in" on stock_in;
create policy "authenticated insert stock_in" on stock_in
  for insert to authenticated with check (created_by = auth.uid());

drop policy if exists "authenticated read stock_out" on stock_out;
create policy "authenticated read stock_out" on stock_out
  for select to authenticated using (true);

drop policy if exists "authenticated insert stock_out" on stock_out;
create policy "authenticated insert stock_out" on stock_out
  for insert to authenticated with check (created_by = auth.uid());
