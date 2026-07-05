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
-- product_id는 엑셀에서 그대로 가져올 수 있도록 문자열 자연키 사용 (등록 시 product_nm과 동일한 값을 입력)
create table if not exists products (
  product_id text primary key,
  product_nm text not null,
  sort_no integer not null default 0,
  created_at timestamptz not null default now()
);

alter table products add column if not exists sort_no integer not null default 0;

-- 매입 (등록자 본인 또는 관리자가 수정/삭제 가능)
create table if not exists purchases (
  in_id integer generated always as identity (start with 1 increment by 1) primary key,
  in_date date not null default current_date,
  product_id text not null references products(product_id),
  width_mm numeric(10, 2) not null,
  height_mm numeric(10, 2) not null,
  thickness_mm numeric(10, 2),
  in_prc numeric(12, 2) not null check (in_prc >= 0),
  note text,
  in_user_id uuid not null references users(user_id),
  created_at timestamptz not null default now()
);

alter table purchases add column if not exists note text;

-- 매출 (등록자 본인 또는 관리자가 수정/삭제 가능)
create table if not exists sales (
  out_id integer generated always as identity (start with 1 increment by 1) primary key,
  order_date date not null default current_date,
  out_date date,
  apartment text,
  product_id text not null references products(product_id),
  width_mm numeric(10, 2) not null,
  height_mm numeric(10, 2) not null,
  thickness_mm numeric(10, 2),
  out_prc numeric(12, 2) not null check (out_prc >= 0),
  note text,
  out_user_id uuid not null references users(user_id),
  created_at timestamptz not null default now()
);

alter table sales add column if not exists note text;

-- 이전 버전에서 thickness_mm이 not null이었다면 해제 (가로/세로만 입력하는 등록을 허용)
alter table purchases alter column thickness_mm drop not null;
alter table sales alter column thickness_mm drop not null;

-- 이전 버전에서 product_id를 integer(자동증가)로 만든 적이 있다면 text로 안전하게 전환하고,
-- product_id가 항상 product_nm과 같은 값이 되도록 맞춤.
-- (신규 설치에서는 이미 text이고 두 값이 같으므로 아래 구문은 실질적으로 아무 것도 바꾸지 않음)
alter table purchases drop constraint if exists purchases_product_id_fkey;
alter table sales drop constraint if exists sales_product_id_fkey;
alter table products drop constraint if exists products_pkey;

-- purchases/sales의 product_id를 text로 바꾼 뒤(옛 integer 값은 문자열로만 캐스팅됨),
-- products가 아직 옛 product_id를 갖고 있을 때 그 값을 product_nm으로 다시 매핑
alter table purchases alter column product_id type text using product_id::text;
alter table sales alter column product_id type text using product_id::text;

update purchases p set product_id = pr.product_nm
  from products pr where pr.product_id::text = p.product_id and pr.product_nm <> p.product_id;
update sales s set product_id = pr.product_nm
  from products pr where pr.product_id::text = s.product_id and pr.product_nm <> s.product_id;

do $$
begin
  if exists (
    select 1 from pg_attribute a
    join pg_class c on a.attrelid = c.oid
    where c.relname = 'products' and a.attname = 'product_id' and a.attidentity <> ''
  ) then
    alter table products alter column product_id drop identity;
  end if;
end $$;

-- products 자신의 키도 product_nm과 같은 값으로 고정
alter table products alter column product_id type text using product_nm;
alter table products add primary key (product_id);

alter table purchases alter column product_id set not null;
alter table purchases add constraint purchases_product_id_fkey foreign key (product_id) references products(product_id);

alter table sales alter column product_id set not null;
alter table sales add constraint sales_product_id_fkey foreign key (product_id) references products(product_id);

-- 위 마이그레이션으로 product_id가 text로 정리된 뒤에 기본 제품 보장 (신규 설치용, 기존 DB에는 이미 존재)
insert into products (product_id, product_nm) values ('미분류', '미분류') on conflict (product_id) do nothing;

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

drop policy if exists "authenticated update products" on products;
create policy "authenticated update products" on products
  for update to authenticated using (true) with check (true);

drop policy if exists "authenticated delete products" on products;
create policy "authenticated delete products" on products
  for delete to authenticated using (true);

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

-- 등록자 본인 또는 관리자만 수정/삭제 가능
drop policy if exists "own or admin update purchases" on purchases;
create policy "own or admin update purchases" on purchases
  for update to authenticated
  using (in_user_id = auth.uid() or exists (select 1 from users me where me.user_id = auth.uid() and me.admin_yn = '1'))
  with check (in_user_id = auth.uid() or exists (select 1 from users me where me.user_id = auth.uid() and me.admin_yn = '1'));

drop policy if exists "own or admin delete purchases" on purchases;
create policy "own or admin delete purchases" on purchases
  for delete to authenticated
  using (in_user_id = auth.uid() or exists (select 1 from users me where me.user_id = auth.uid() and me.admin_yn = '1'));

drop policy if exists "authenticated read sales" on sales;
create policy "authenticated read sales" on sales
  for select to authenticated using (true);

drop policy if exists "authenticated insert sales" on sales;
create policy "authenticated insert sales" on sales
  for insert to authenticated with check (out_user_id = auth.uid());

drop policy if exists "own or admin update sales" on sales;
create policy "own or admin update sales" on sales
  for update to authenticated
  using (out_user_id = auth.uid() or exists (select 1 from users me where me.user_id = auth.uid() and me.admin_yn = '1'))
  with check (out_user_id = auth.uid() or exists (select 1 from users me where me.user_id = auth.uid() and me.admin_yn = '1'));

drop policy if exists "own or admin delete sales" on sales;
create policy "own or admin delete sales" on sales
  for delete to authenticated
  using (out_user_id = auth.uid() or exists (select 1 from users me where me.user_id = auth.uid() and me.admin_yn = '1'));

-- 같은 제품 안에서 규격(가로/세로, 두께는 입력됐을 때만)이 가장 비슷한 매입/매출 1건 조회
-- (유클리드 거리 기준, 없으면 null). t가 null이거나 해당 행의 thickness_mm이 null이면
-- 두께 차이는 거리 계산에서 제외하고 가로/세로만으로 비교함.
drop function if exists nearest_purchase(numeric, numeric, numeric);
drop function if exists nearest_purchase(integer, numeric, numeric, numeric);
drop function if exists nearest_purchase(text, numeric, numeric, numeric);
create or replace function nearest_purchase(p_product_id text, w numeric, h numeric, t numeric default null)
returns purchases as $$
  select *
  from purchases
  where product_id = p_product_id
  order by power(width_mm - w, 2) + power(height_mm - h, 2)
    + case when t is not null and thickness_mm is not null then power(thickness_mm - t, 2) else 0 end asc
  limit 1;
$$ language sql stable;

drop function if exists nearest_sale(numeric, numeric, numeric);
drop function if exists nearest_sale(integer, numeric, numeric, numeric);
drop function if exists nearest_sale(text, numeric, numeric, numeric);
create or replace function nearest_sale(p_product_id text, w numeric, h numeric, t numeric default null)
returns sales as $$
  select *
  from sales
  where product_id = p_product_id
  order by power(width_mm - w, 2) + power(height_mm - h, 2)
    + case when t is not null and thickness_mm is not null then power(thickness_mm - t, 2) else 0 end asc
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
