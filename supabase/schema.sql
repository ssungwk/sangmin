-- 사용자 / 매입 / 매출 스키마
-- Supabase SQL Editor에서 그대로 실행하세요.

-- 앱 사용자 프로필 (Supabase Auth 계정과 1:1 연결, admin_yn으로 관리자 메뉴 노출 제어)
create table if not exists users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  user_nm text not null,
  admin_yn char(1) not null default '0' check (admin_yn in ('0', '1')),
  approved_yn char(1) not null default '0' check (approved_yn in ('0', '1')),
  created_at timestamptz not null default now()
);

-- 기존에 만든 프로젝트라면 approved_yn 컬럼이 없을 수 있으므로 추가.
-- 이미 가입되어 있던 사용자는 '1'(승인됨)로 채워 넣어 갑자기 잠기지 않게 하고,
-- 그 다음부터의 신규 가입 기본값만 '0'(대기)으로 바꿔서 적용.
alter table users add column if not exists approved_yn char(1) not null default '1' check (approved_yn in ('0', '1'));
alter table users alter column approved_yn set default '0';

-- 회원가입(auth.users insert) 시 users 테이블에도 자동으로 프로필 행 생성
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (user_id, user_nm)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- 제품 기준정보 (매입/매출 등록 시 콤보박스로 선택)
create table if not exists products (
  product_id integer generated always as identity (start with 1 increment by 1) primary key,
  product_nm text not null unique,
  created_at timestamptz not null default now()
);

insert into products (product_nm) values ('미분류') on conflict (product_nm) do nothing;

-- 매입 (원장, 수정/삭제 없음)
create table if not exists purchases (
  in_id integer generated always as identity (start with 1 increment by 1) primary key,
  in_date date not null default current_date,
  product_id integer not null references products(product_id),
  width_mm numeric(10, 2) not null,
  height_mm numeric(10, 2) not null,
  thickness_mm numeric(10, 2) not null,
  in_prc numeric(12, 2) not null check (in_prc >= 0),
  in_user_id uuid not null references users(user_id),
  created_at timestamptz not null default now()
);

-- 기존 프로젝트에 product_id가 없을 수 있으므로 추가하고, 기존 행은 '미분류'로 채워 넣음
alter table purchases add column if not exists product_id integer references products(product_id);
update purchases set product_id = (select product_id from products where product_nm = '미분류') where product_id is null;
alter table purchases alter column product_id set not null;

-- 매출 (원장, 수정/삭제 없음)
create table if not exists sales (
  out_id integer generated always as identity (start with 1 increment by 1) primary key,
  order_date date not null default current_date,
  out_date date,
  apartment text,
  product_id integer not null references products(product_id),
  width_mm numeric(10, 2) not null,
  height_mm numeric(10, 2) not null,
  thickness_mm numeric(10, 2) not null,
  out_prc numeric(12, 2) not null check (out_prc >= 0),
  out_user_id uuid not null references users(user_id),
  created_at timestamptz not null default now()
);

alter table sales add column if not exists product_id integer references products(product_id);
update sales set product_id = (select product_id from products where product_nm = '미분류') where product_id is null;
alter table sales alter column product_id set not null;

-- Row Level Security: 로그인한 사용자는 모두 조회 가능, 등록은 본인 명의로만
alter table users enable row level security;
alter table products enable row level security;
alter table purchases enable row level security;
alter table sales enable row level security;

drop policy if exists "authenticated read products" on products;
create policy "authenticated read products" on products
  for select to authenticated using (true);

drop policy if exists "authenticated insert products" on products;
create policy "authenticated insert products" on products
  for insert to authenticated with check (true);

drop policy if exists "authenticated read users" on users;
create policy "authenticated read users" on users
  for select to authenticated using (true);

-- 관리자(admin_yn='1')만 다른 사용자의 승인상태/관리자여부 변경 가능
drop policy if exists "admin update users" on users;
create policy "admin update users" on users
  for update to authenticated
  using (exists (select 1 from users me where me.user_id = auth.uid() and me.admin_yn = '1'))
  with check (exists (select 1 from users me where me.user_id = auth.uid() and me.admin_yn = '1'));

drop policy if exists "authenticated read purchases" on purchases;
create policy "authenticated read purchases" on purchases
  for select to authenticated using (true);

drop policy if exists "authenticated insert purchases" on purchases;
create policy "authenticated insert purchases" on purchases
  for insert to authenticated with check (in_user_id = auth.uid());

drop policy if exists "authenticated read sales" on sales;
create policy "authenticated read sales" on sales
  for select to authenticated using (true);

drop policy if exists "authenticated insert sales" on sales;
create policy "authenticated insert sales" on sales
  for insert to authenticated with check (out_user_id = auth.uid());

-- 같은 제품 안에서 규격(가로/세로/두께)이 가장 비슷한 매입/매출 1건 조회 (유클리드 거리 기준, 없으면 null)
drop function if exists nearest_purchase(numeric, numeric, numeric);
create or replace function nearest_purchase(p_product_id integer, w numeric, h numeric, t numeric)
returns purchases as $$
  select *
  from purchases
  where product_id = p_product_id
  order by power(width_mm - w, 2) + power(height_mm - h, 2) + power(thickness_mm - t, 2) asc
  limit 1;
$$ language sql stable;

drop function if exists nearest_sale(numeric, numeric, numeric);
create or replace function nearest_sale(p_product_id integer, w numeric, h numeric, t numeric)
returns sales as $$
  select *
  from sales
  where product_id = p_product_id
  order by power(width_mm - w, 2) + power(height_mm - h, 2) + power(thickness_mm - t, 2) asc
  limit 1;
$$ language sql stable;

-- 사용자관리 화면용: 이메일(auth.users)까지 합쳐서 전체 사용자 목록 조회.
-- 클라이언트 role은 auth.users를 직접 조회할 권한이 없어서 security definer로 우회하고,
-- 함수 내부에서 호출자가 관리자인지 다시 확인해 관리자가 아니면 빈 목록을 반환.
create or replace function list_users()
returns table (
  user_id uuid,
  user_nm text,
  admin_yn char(1),
  approved_yn char(1),
  email text,
  created_at timestamptz
)
security definer
set search_path = public
language sql
as $$
  select u.user_id, u.user_nm, u.admin_yn, u.approved_yn, a.email, u.created_at
  from public.users u
  join auth.users a on a.id = u.user_id
  where exists (
    select 1 from public.users me where me.user_id = auth.uid() and me.admin_yn = '1'
  )
  order by u.created_at desc;
$$;
