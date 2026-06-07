-- Corrige o valor padrão de filial nas tabelas legadas (ldc_estadias/ldc_usuarios):
-- elas usavam 'principal', um id que não existe em vl_filiais/FILIAIS, fazendo
-- registros sem filial exibirem o id cru em vez do nome da cidade.
-- 'jatai-go' é o id canônico já usado como padrão pelo frontend e existente em vl_filiais.

alter table public.ldc_estadias
  alter column filial set default 'jatai-go';

alter table public.ldc_usuarios
  alter column filial set default 'jatai-go';

update public.ldc_estadias set filial = 'jatai-go' where filial = 'principal';
update public.ldc_usuarios set filial = 'jatai-go' where filial = 'principal';
