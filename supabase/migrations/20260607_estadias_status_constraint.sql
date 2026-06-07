-- Adiciona check constraint nos status de estadias: hoje as colunas aceitam
-- qualquer texto, mas o frontend depende dos literais exatos 'Aberto'/'Feito'/
-- 'Finalizado' (vl_estadias) e 'A lançar' (vl_estadias_a_lancar). Um typo ou
-- valor fora do enum gera registro "órfão" que não casa com nenhum estado da UI.

alter table public.vl_estadias
  drop constraint if exists vl_estadias_status_check;

alter table public.vl_estadias
  add constraint vl_estadias_status_check
  check (status in ('Aberto','Feito','Finalizado'));

alter table public.vl_estadias_a_lancar
  drop constraint if exists vl_estadias_a_lancar_status_check;

alter table public.vl_estadias_a_lancar
  add constraint vl_estadias_a_lancar_status_check
  check (status in ('A lançar'));
