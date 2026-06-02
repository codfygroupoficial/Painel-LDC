-- ============================================================
-- SCHEMA: Painel LDC
-- Fase 1 — Multi-tenant, normalizado, pronto para escalar
-- Rodar no SQL Editor do Supabase (projeto: qzjwjylpbmnggczrbgoe)
-- ============================================================

-- ============================================================
-- 1. UNIDADES (filiais / silos)
-- ============================================================
create table if not exists unidades (
  id        uuid primary key default gen_random_uuid(),
  nome      varchar(100) not null,
  cidade    varchar(100) not null,
  estado    char(2)      not null,
  regiao    varchar(50),
  ativa     boolean      not null default true,
  criado_at timestamptz  not null default now()
);

-- ============================================================
-- 2. PROFILES (ligado ao Supabase Auth)
--    Substitui o defaultUsers.js hardcoded
-- ============================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  unidade_id  uuid        references unidades(id),
  nome        varchar(100) not null,
  cargo       varchar(100),
  role        varchar(20)  not null default 'operador'
                check (role in ('admin', 'supervisor', 'operador', 'visualizador')),
  avatar      varchar(10),
  ativo       boolean      not null default true,
  criado_at   timestamptz  not null default now()
);

-- ============================================================
-- 3. TRANSPORTADORAS
-- ============================================================
create table if not exists transportadoras (
  id        uuid primary key default gen_random_uuid(),
  nome      varchar(100) not null,
  cnpj      varchar(18)  unique,
  ativa     boolean      not null default true,
  criado_at timestamptz  not null default now()
);

-- ============================================================
-- 4. VEÍCULOS
-- ============================================================
create table if not exists veiculos (
  placa             varchar(10)  primary key,
  transportadora_id uuid         references transportadoras(id),
  tipo              varchar(50),
  ativo             boolean      not null default true,
  criado_at         timestamptz  not null default now()
);

-- ============================================================
-- 5. MOTORISTAS
-- ============================================================
create table if not exists motoristas (
  id                uuid primary key default gen_random_uuid(),
  nome              varchar(100) not null,
  cpf               varchar(14)  unique,
  telefone          varchar(20),
  transportadora_id uuid         references transportadoras(id),
  ativo             boolean      not null default true,
  criado_at         timestamptz  not null default now()
);

-- ============================================================
-- 6. ESTADIAS (tabela principal)
-- ============================================================
create table if not exists estadias (
  id                uuid primary key default gen_random_uuid(),
  unidade_id        uuid not null references unidades(id),

  -- Tipo e fluxo
  tipo              varchar(20) not null default 'a_lancar'
                      check (tipo in ('a_lancar', 'lancada')),
  status            varchar(20) not null default 'pendente'
                      check (status in ('pendente', 'aberto', 'feito', 'finalizado')),
  prioridade        varchar(20) not null default 'Normal'
                      check (prioridade in ('Normal', 'Média', 'Urgente')),

  -- Identificação
  chamado           varchar(50),
  placa             varchar(10)  references veiculos(placa),
  motorista_id      uuid         references motoristas(id),
  transportadora_id uuid         references transportadoras(id),

  -- Dados financeiros e operacionais
  peso_kg           numeric(10,2),       -- sempre em kg
  chegada_at        timestamptz,         -- com fuso horário
  saida_at          timestamptz,
  horas_cobradas    numeric(8,2),
  valor_centavos    integer,             -- R$ 1.234,56 → 123456 (nunca string)
  pago_por          varchar(20)
                      check (pago_por in ('Logística', 'Transportes')),

  -- Observação (campo livre, vem do a_lancar)
  obs               text,

  -- Auditoria de quem fez cada etapa
  criado_por        uuid        references profiles(id),
  criado_at         timestamptz not null default now(),
  feito_por         uuid        references profiles(id),
  feito_at          timestamptz,
  finalizado_por    uuid        references profiles(id),
  finalizado_at     timestamptz,
  atualizado_por    uuid        references profiles(id),
  atualizado_at     timestamptz
);

-- ============================================================
-- 7. ANEXOS
-- ============================================================
create table if not exists estadias_anexos (
  id            uuid primary key default gen_random_uuid(),
  estadia_id    uuid not null references estadias(id) on delete cascade,
  nome          varchar(255) not null,
  tipo_mime     varchar(100),
  tamanho_bytes integer,
  url           text         not null,
  cloud         boolean      not null default true,
  criado_at     timestamptz  not null default now()
);

-- ============================================================
-- 8. LOG DE AUDITORIA (imutável — nunca deletar linhas)
-- ============================================================
create table if not exists estadias_log (
  id              uuid primary key default gen_random_uuid(),
  estadia_id      uuid        not null references estadias(id),
  evento          varchar(50) not null,  -- criado | feito | finalizado | reaberto | excluido | atualizado
  status_anterior varchar(20),
  status_novo     varchar(20),
  usuario_id      uuid        references profiles(id),
  dados_extra     jsonb,                 -- snapshot de campos que mudaram
  criado_at       timestamptz not null default now()
);

-- ============================================================
-- 9. ÍNDICES (performance em queries nacionais)
-- ============================================================
create index if not exists idx_estadias_unidade    on estadias(unidade_id);
create index if not exists idx_estadias_tipo       on estadias(tipo);
create index if not exists idx_estadias_status     on estadias(status);
create index if not exists idx_estadias_placa      on estadias(placa);
create index if not exists idx_estadias_criado_at  on estadias(criado_at desc);
create index if not exists idx_estadias_motorista  on estadias(motorista_id);
create index if not exists idx_estadias_log_estadia on estadias_log(estadia_id);
create index if not exists idx_estadias_log_at     on estadias_log(criado_at desc);

-- ============================================================
-- 10. ROW LEVEL SECURITY
--     Operador só vê sua unidade. Admin vê tudo.
-- ============================================================
alter table unidades          enable row level security;
alter table profiles          enable row level security;
alter table transportadoras   enable row level security;
alter table veiculos          enable row level security;
alter table motoristas        enable row level security;
alter table estadias          enable row level security;
alter table estadias_anexos   enable row level security;
alter table estadias_log      enable row level security;

-- Funções auxiliares para as políticas
create or replace function minha_unidade_id()
returns uuid language sql stable security definer
as $$ select unidade_id from profiles where id = auth.uid() $$;

create or replace function meu_role()
returns text language sql stable security definer
as $$ select role from profiles where id = auth.uid() $$;

-- Políticas: estadias
create policy "estadias_select" on estadias for select
  using (unidade_id = minha_unidade_id() or meu_role() = 'admin');

create policy "estadias_insert" on estadias for insert
  with check (
    unidade_id = minha_unidade_id()
    and meu_role() in ('admin', 'supervisor', 'operador')
  );

create policy "estadias_update" on estadias for update
  using (unidade_id = minha_unidade_id() or meu_role() = 'admin');

create policy "estadias_delete" on estadias for delete
  using (meu_role() in ('admin', 'supervisor'));

-- Políticas: log (append-only para usuários, nunca apagar)
create policy "log_select" on estadias_log for select
  using (estadia_id in (select id from estadias));

create policy "log_insert" on estadias_log for insert
  with check (true);

-- Políticas: profiles
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or meu_role() = 'admin');

create policy "profiles_update" on profiles for update
  using (id = auth.uid() or meu_role() = 'admin');

-- Políticas: tabelas de referência (todos leem, só admin edita)
create policy "transportadoras_select" on transportadoras for select using (true);
create policy "transportadoras_write"  on transportadoras for all using (meu_role() = 'admin');

create policy "veiculos_select" on veiculos for select using (true);
create policy "veiculos_write"  on veiculos for all using (meu_role() in ('admin', 'supervisor'));

create policy "motoristas_select" on motoristas for select using (true);
create policy "motoristas_write"  on motoristas for all using (meu_role() in ('admin', 'supervisor'));

-- ============================================================
-- 11. TRIGGER: audit log automático
-- ============================================================
create or replace function fn_estadias_log()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    insert into estadias_log(estadia_id, evento, status_novo, usuario_id)
    values (NEW.id, 'criado', NEW.status, NEW.criado_por);

  elsif TG_OP = 'UPDATE' then
    if OLD.status <> NEW.status then
      insert into estadias_log(estadia_id, evento, status_anterior, status_novo, usuario_id)
      values (
        NEW.id,
        case NEW.status
          when 'feito'      then 'feito'
          when 'finalizado' then 'finalizado'
          when 'aberto'     then 'reaberto'
          else 'atualizado'
        end,
        OLD.status,
        NEW.status,
        NEW.atualizado_por
      );
    end if;

  elsif TG_OP = 'DELETE' then
    insert into estadias_log(estadia_id, evento, status_anterior, usuario_id)
    values (OLD.id, 'excluido', OLD.status, auth.uid());
  end if;

  return coalesce(NEW, OLD);
end;
$$;

create or replace trigger trg_estadias_log
after insert or update or delete on estadias
for each row execute function fn_estadias_log();

-- ============================================================
-- 12. VIEW: consulta rica (join de todas as entidades)
--     O frontend pode consultar essa view e receber tudo junto
-- ============================================================
create or replace view v_estadias as
select
  e.id,
  e.unidade_id,
  u.nome            as unidade_nome,
  u.cidade          as unidade_cidade,
  u.estado          as unidade_estado,
  e.tipo,
  e.status,
  e.prioridade,
  e.chamado,
  e.placa,
  t.nome            as transportadora,
  m.nome            as motorista,
  m.telefone        as telefone_motorista,
  e.peso_kg,
  e.chegada_at,
  e.saida_at,
  e.horas_cobradas,
  e.valor_centavos,
  round(e.valor_centavos::numeric / 100, 2) as valor_reais,
  e.pago_por,
  e.obs,
  -- auditoria
  cp.nome           as criado_por_nome,
  e.criado_at,
  fp.nome           as feito_por_nome,
  e.feito_at,
  fnp.nome          as finalizado_por_nome,
  e.finalizado_at
from estadias e
left join unidades         u   on u.id  = e.unidade_id
left join transportadoras  t   on t.id  = e.transportadora_id
left join motoristas       m   on m.id  = e.motorista_id
left join profiles         cp  on cp.id = e.criado_por
left join profiles         fp  on fp.id = e.feito_por
left join profiles         fnp on fnp.id = e.finalizado_por;

-- ============================================================
-- 13. DADOS INICIAIS
-- ============================================================
insert into unidades (nome, cidade, estado, regiao) values
  ('LDC Rondonópolis', 'Rondonópolis', 'MT', 'Centro-Oeste')
on conflict do nothing;
