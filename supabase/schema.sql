-- 사용자 / 매입 / 매출 스키마
-- Supabase SQL Editor에서 그대로 실행하세요.

-- 앱 사용자 프로필 (Supabase Auth 계정과 1:1 연결, admin_yn으로 관리자 메뉴 노출 제어)
create table if not exists users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  user_nm text not null,
  admin_yn char(1) not null default '0' check (admin_yn in ('0', '1')),
  created_at timestamptz not null default now()
);

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

-- 매입 (원장, 수정/삭제 없음)
create table if not exists purchases (
  in_id integer generated always as identity (start with 1 increment by 1) primary key,
  in_date date not null default current_date,
  width_mm numeric(10, 2) not null,
  height_mm numeric(10, 2) not null,
  thickness_mm numeric(10, 2) not null,
  in_prc numeric(12, 2) not null check (in_prc >= 0),
  in_user_id uuid not null references users(user_id),
  created_at timestamptz not null default now()
);

-- 매출 (원장, 수정/삭제 없음)
create table if not exists sales (
  out_id integer generated always as identity (start with 1 increment by 1) primary key,
  order_date date not null default current_date,
  out_date date,
  apartment text,
  width_mm numeric(10, 2) not null,
  height_mm numeric(10, 2) not null,
  thickness_mm numeric(10, 2) not null,
  out_prc numeric(12, 2) not null check (out_prc >= 0),
  out_user_id uuid not null references users(user_id),
  created_at timestamptz not null default now()
);

-- Row Level Security: 로그인한 사용자는 모두 조회 가능, 등록은 본인 명의로만
alter table users enable row level security;
alter table purchases enable row level security;
alter table sales enable row level security;

drop policy if exists "authenticated read users" on users;
create policy "authenticated read users" on users
  for select to authenticated using (true);

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

-- 규격(가로/세로/두께)이 가장 비슷한 매입/매출 1건 조회 (유클리드 거리 기준, 없으면 null)
create or replace function nearest_purchase(w numeric, h numeric, t numeric)
returns purchases as $$
  select *
  from purchases
  order by power(width_mm - w, 2) + power(height_mm - h, 2) + power(thickness_mm - t, 2) asc
  limit 1;
$$ language sql stable;

create or replace function nearest_sale(w numeric, h numeric, t numeric)
returns sales as $$
  select *
  from sales
  order by power(width_mm - w, 2) + power(height_mm - h, 2) + power(thickness_mm - t, 2) asc
  limit 1;
$$ language sql stable;
