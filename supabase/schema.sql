-- ==============================================================================
-- PROJETO STREETLIFE — PLATAFORMA DE BATALHAS DE LOOKS (STREETWEAR & SPORTLIFE)
-- Esquema de Banco de Dados Oficial com RLS, Gatilhos e Realtime para Supabase
-- ==============================================================================

-- 1. Extensões
create extension if not exists "uuid-ossp";

-- 2. Tabela de Administradores
create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'admin',
    created_at timestamptz not null default now()
);

-- 3. Função de verificação de Administrador (Segura com SECURITY DEFINER e search_path restrito)
create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 
    from public.admin_users 
    where user_id = check_user_id
  );
$$;

-- 4. Perfis Públicos Mínimos dos Participantes
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique,
    display_name text,
    avatar_url text,
    bio text,
    instagram text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 5. Batalhas e Edições
create table if not exists public.battles (
    id uuid primary key default gen_random_uuid(),
    edition_number integer not null unique,
    title text not null,
    theme text not null,
    description text,
    cover_image_url text,
    status text not null check (status in ('draft', 'active', 'voting', 'completed')) default 'draft',
    start_date timestamptz,
    end_date timestamptz,
    prize_info text,
    rules text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 6. Looks Inscritos
create table if not exists public.looks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    battle_id uuid references public.battles(id) on delete set null,
    participant_name text not null,
    title text not null,
    description text,
    image_url text not null,
    style_tags text[] not null default '{}',
    pieces jsonb not null default '[]'::jsonb,
    votes_count integer not null default 0,
    status text not null check (status in ('pending', 'approved', 'rejected')) default 'approved',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 7. Classificações e Vencedores das Edições (Pódio 1º, 2º e 3º)
create table if not exists public.battle_results (
    id uuid primary key default gen_random_uuid(),
    battle_id uuid not null references public.battles(id) on delete cascade,
    placement integer not null check (placement in (1, 2, 3)),
    participant_name text not null,
    look_id uuid references public.looks(id) on delete set null,
    look_title text,
    look_image_url text not null,
    custom_notes text,
    created_at timestamptz not null default now(),
    constraint unique_battle_placement unique (battle_id, placement)
);

-- 8. Look da Semana (Destaque Independente das Batalhas)
create table if not exists public.look_of_the_week (
    id uuid primary key default gen_random_uuid(),
    look_id uuid references public.looks(id) on delete set null,
    title text not null,
    author_name text not null,
    image_url text not null,
    curator_comment text not null,
    highlight_period text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 9. Notificações de Novos Usuários (Área Exclusiva do Administrador)
create table if not exists public.user_notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    email text not null,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

-- Índices de Performance
create index if not exists idx_battles_status on public.battles(status);
create index if not exists idx_battles_edition on public.battles(edition_number desc);
create index if not exists idx_looks_battle_id on public.looks(battle_id);
create index if not exists idx_looks_user_id on public.looks(user_id);
create index if not exists idx_battle_results_battle on public.battle_results(battle_id);
create index if not exists idx_notifications_is_read on public.user_notifications(is_read);

-- ==============================================================================
-- GATILHOS (TRIGGERS) PARA NOVOS CADASTROS NO SUPABASE AUTH
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    -- 1. Cria perfil público inicial seguro
    insert into public.profiles (id, username, display_name, avatar_url)
    values (
        new.id,
        split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4),
        split_part(new.email, '@', 1),
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    )
    on conflict (id) do nothing;

    -- 2. Registra notificação para os administradores
    insert into public.user_notifications (user_id, email, is_read)
    values (
        new.id,
        new.email,
        false
    );

    return new;
end;
$$;

-- Desassocia se já existir e recria o trigger em auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ==============================================================================
-- BOOTSTRAP INICIAL DO PRIMEIRO ADMINISTRADOR
-- Permite que o primeiro usuário registrado assuma papel de admin de forma segura
-- se e somente se ainda não houver nenhum admin cadastrado na plataforma.
-- ==============================================================================
create or replace function public.claim_initial_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    current_admin_count integer;
    caller_id uuid;
begin
    caller_id := auth.uid();
    if caller_id is null then
        raise exception 'Não autenticado';
    end if;

    select count(*) into current_admin_count from public.admin_users;
    
    if current_admin_count = 0 then
        insert into public.admin_users (user_id, role)
        values (caller_id, 'admin');
        return true;
    else
        return false;
    end if;
end;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) — SEGURANÇA E POLÍTICAS OBRIGATÓRIAS
-- ==============================================================================

alter table public.admin_users enable row level security;
alter table public.profiles enable row level security;
alter table public.battles enable row level security;
alter table public.looks enable row level security;
alter table public.battle_results enable row level security;
alter table public.look_of_the_week enable row level security;
alter table public.user_notifications enable row level security;

-- --- Políticas para admin_users ---
drop policy if exists "Admins podem visualizar tabela de admins" on public.admin_users;
create policy "Admins podem visualizar tabela de admins"
    on public.admin_users for select
    using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Somente admins existentes podem modificar admin_users" on public.admin_users;
create policy "Somente admins existentes podem modificar admin_users"
    on public.admin_users for all
    using (public.is_admin(auth.uid()));

-- --- Políticas para profiles ---
drop policy if exists "Perfis são públicos para leitura" on public.profiles;
create policy "Perfis são públicos para leitura"
    on public.profiles for select
    using (true);

drop policy if exists "Usuário pode atualizar seu próprio perfil" on public.profiles;
create policy "Usuário pode atualizar seu próprio perfil"
    on public.profiles for update
    using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Inserção de perfil por usuário ou sistema" on public.profiles;
create policy "Inserção de perfil por usuário ou sistema"
    on public.profiles for insert
    with check (auth.uid() = id or public.is_admin(auth.uid()));

-- --- Políticas para battles ---
drop policy if exists "Batalhas públicas podem ser lidas por todos" on public.battles;
create policy "Batalhas públicas podem ser lidas por todos"
    on public.battles for select
    using (status != 'draft' or public.is_admin(auth.uid()));

drop policy if exists "Somente admin pode gerenciar batalhas" on public.battles;
create policy "Somente admin pode gerenciar batalhas"
    on public.battles for all
    using (public.is_admin(auth.uid()));

-- --- Políticas para looks ---
drop policy if exists "Looks aprovados são públicos" on public.looks;
create policy "Looks aprovados são públicos"
    on public.looks for select
    using (status = 'approved' or user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Usuários autenticados podem enviar looks" on public.looks;
create policy "Usuários autenticados podem enviar looks"
    on public.looks for insert
    with check (auth.uid() is not null);

drop policy if exists "Autor ou admin pode atualizar look" on public.looks;
create policy "Autor ou admin pode atualizar look"
    on public.looks for update
    using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Autor ou admin pode excluir look" on public.looks;
create policy "Autor ou admin pode excluir look"
    on public.looks for delete
    using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- --- Políticas para battle_results ---
drop policy if exists "Resultados das batalhas são públicos para leitura" on public.battle_results;
create policy "Resultados das batalhas são públicos para leitura"
    on public.battle_results for select
    using (true);

drop policy if exists "Somente admin pode gerenciar resultados" on public.battle_results;
create policy "Somente admin pode gerenciar resultados"
    on public.battle_results for all
    using (public.is_admin(auth.uid()));

-- --- Políticas para look_of_the_week ---
drop policy if exists "Look da Semana é público para leitura" on public.look_of_the_week;
create policy "Look da Semana é público para leitura"
    on public.look_of_the_week for select
    using (true);

drop policy if exists "Somente admin pode gerenciar Look da Semana" on public.look_of_the_week;
create policy "Somente admin pode gerenciar Look da Semana"
    on public.look_of_the_week for all
    using (public.is_admin(auth.uid()));

-- --- Políticas para user_notifications ---
drop policy if exists "Somente administradores podem consultar notificações" on public.user_notifications;
create policy "Somente administradores podem consultar notificações"
    on public.user_notifications for select
    using (public.is_admin(auth.uid()));

drop policy if exists "Somente administradores podem atualizar notificações" on public.user_notifications;
create policy "Somente administradores podem atualizar notificações"
    on public.user_notifications for update
    using (public.is_admin(auth.uid()));

drop policy if exists "Somente administradores podem deletar notificações" on public.user_notifications;
create policy "Somente administradores podem deletar notificações"
    on public.user_notifications for delete
    using (public.is_admin(auth.uid()));

-- ==============================================================================
-- SUPABASE REALTIME CONFIGURATION
-- Habilita escuta em tempo real para notificações e atualizações de batalhas
-- ==============================================================================

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.user_notifications;
alter publication supabase_realtime add table public.battles;
alter publication supabase_realtime add table public.looks;
alter publication supabase_realtime add table public.battle_results;
alter publication supabase_realtime add table public.look_of_the_week;
