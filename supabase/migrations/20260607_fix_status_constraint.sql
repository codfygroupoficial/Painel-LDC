-- Corrige a constraint de status de vl_captacoes para incluir 'nao_carregou',
-- valor já usado pelo frontend mas ausente no schema v2 original — causava
-- falha silenciosa ao salvar captações marcadas como "Não carregou".

alter table public.vl_captacoes
  drop constraint if exists vl_captacoes_status_check;

alter table public.vl_captacoes
  add constraint vl_captacoes_status_check
  check (status in ('contatado','ordem','carregou','nao_carregou'));
