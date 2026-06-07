# Plano Banco V2 — Via Log / Painel LDC

Este plano transforma o sistema de um modelo rápido com JSON em uma base mais profissional, sem quebrar o painel atual.

## O que foi criado

### SQL

Arquivo principal:

```text
supabase/migrations/20260606_v2_schema.sql
```

Ele cria:

- `vl_filiais`
- `vl_profiles`
- `vl_motoristas`
- `vl_captacoes`
- `vl_captacao_eventos`
- `vl_motorista_carregamentos`
- `vl_estadias`
- `vl_estadias_a_lancar`
- `vl_anexos`
- `vl_historico_eventos`
- `vw_motoristas_que_carregam`

## Como rodar no Supabase

1. Abra o Supabase.
2. Vá em **SQL Editor**.
3. Cole todo o conteúdo de:

```text
supabase/migrations/20260606_v2_schema.sql
```

4. Clique em **Run**.

## Como a captação funciona agora

A tela de captação tenta usar primeiro o banco V2:

```text
vl_motoristas
vl_captacoes
vl_motorista_carregamentos
```

Se o banco V2 ainda não existir ou der erro, ela volta para o modelo antigo:

```text
ldc_estadias com tipo = captacao
```

Quando o V2 funciona, o código também salva uma cópia no legado. Assim o Admin atual continua funcionando durante a migração.

## Fluxo de dados da captação

```text
Cadastrar motorista
↓
Cria/atualiza motorista em vl_motoristas
↓
Cria/atualiza captação em vl_captacoes
↓
Se status = carregou
↓
Trigger cria registro em vl_motorista_carregamentos
↓
View vw_motoristas_que_carregam mostra motoristas confiáveis
```

## Prioridade depois dessa etapa

1. Rodar o SQL no Supabase.
2. Testar captação no app.
3. Confirmar se aparece `Banco: v2+legado` na tela de captação.
4. Entrar no Admin e conferir motoristas com status carregou.
5. Depois migrar o Admin para ler diretamente `vw_motoristas_que_carregam`.
6. Depois migrar estadias para as tabelas `vl_estadias` e `vl_estadias_a_lancar`.
7. Só no final ativar Supabase Auth e RLS por usuário/filial.

## Observação importante

As policies do SQL V2 estão permissivas para manter compatibilidade com o app atual, que ainda usa login interno e chave anon. Quando migrar para Supabase Auth, trocar as policies por regras baseadas em `auth.uid()` e `vl_profiles`.
