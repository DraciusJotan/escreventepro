-- ============================================================================
-- Escrevente Pro: schema inicial
-- Rode UMA vez (SQL Editor do Supabase ou `supabase db push`).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tabelas
-- Toda tabela tem user_id (default auth.uid()) e RLS: cada usuário só enxerga
-- e altera as próprias linhas, mesmo que alguém chame a API direto.
-- Chaves estrangeiras compostas (x_id, user_id) impedem que uma linha
-- aponte para dados de OUTRO usuário.
-- ---------------------------------------------------------------------------

create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  unique (user_id, name),
  unique (id, user_id)
);

create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id     uuid not null,
  topic          text,
  statement      text not null check (length(trim(statement)) > 0),
  option_a       text not null,
  option_b       text not null,
  option_c       text not null,
  option_d       text not null,
  option_e       text not null,
  correct_option text not null check (correct_option in ('A','B','C','D','E')),
  source         text,
  status         text not null default 'active' check (status in ('active','draft')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (id, user_id),
  -- restrict: não deixa apagar uma matéria que ainda tem questões
  foreign key (subject_id, user_id) references public.subjects (id, user_id) on delete restrict
);
create index questions_user_subject_idx on public.questions (user_id, subject_id);

-- Cada tentativa de resposta. É a base do mapa de calor e das estatísticas.
create table public.answers (
  id              bigint generated always as identity primary key,
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id     uuid not null,
  selected_option text not null check (selected_option in ('A','B','C','D','E')),
  is_correct      boolean not null,
  mode            text not null default 'practice' check (mode in ('practice','review')),
  answered_at     timestamptz not null default now(),
  foreign key (question_id, user_id) references public.questions (id, user_id) on delete cascade
);
create index answers_user_time_idx on public.answers (user_id, answered_at);
create index answers_question_idx  on public.answers (question_id);

-- Estado da revisão espaçada (SM-2 simplificado): uma linha por questão na fila.
create table public.review_items (
  question_id      uuid primary key,
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ease_factor      numeric(3,2) not null default 2.5,
  interval_days    int  not null default 1,
  repetitions      int  not null default 0,
  due_date         date not null,
  last_reviewed_at timestamptz,
  foreign key (question_id, user_id) references public.questions (id, user_id) on delete cascade
);
create index review_items_due_idx on public.review_items (user_id, due_date);

-- updated_at automático
create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger questions_touch_updated_at
  before update on public.questions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.subjects     enable row level security;
alter table public.questions    enable row level security;
alter table public.answers      enable row level security;
alter table public.review_items enable row level security;

-- (select auth.uid()) em vez de auth.uid() direto: o Postgres avalia uma vez
-- por consulta, não uma vez por linha.
create policy "own rows" on public.subjects
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own rows" on public.questions
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own rows" on public.answers
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own rows" on public.review_items
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant usage on schema public to authenticated;
grant select, insert, update, delete
  on public.subjects, public.questions, public.answers, public.review_items
  to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- Matérias padrão: criadas automaticamente para cada novo usuário
-- (cada um edita as suas, sem afetar os outros).
-- ---------------------------------------------------------------------------
create function public.default_subject_names() returns text[]
language sql immutable as $$
  select array[
    'Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo',
    'Direito Penal', 'Direito Processual Penal', 'Direito Processual Civil',
    'Normas da Corregedoria', 'Matemática', 'Raciocínio Lógico',
    'Informática', 'Atualidades'
  ]
$$;

create function public.handle_new_user() returns trigger
language plpgsql
security definer          -- roda com permissão do dono, pois o usuário ainda não tem sessão
set search_path = ''
as $$
begin
  insert into public.subjects (user_id, name, sort_order)
  select new.id, t.name, t.ord
  from unnest(public.default_subject_names()) with ordinality as t(name, ord)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Quem já se cadastrou antes desta migration também recebe as matérias.
insert into public.subjects (user_id, name, sort_order)
select u.id, t.name, t.ord
from auth.users u
cross join unnest(public.default_subject_names()) with ordinality as t(name, ord)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- submit_answer: registra a resposta E atualiza a revisão espaçada,
-- tudo numa única transação. O gabarito é conferido AQUI (servidor),
-- então o navegador nunca decide se acertou.
--
-- Regras (SM-2 simplificado, só acerto/erro):
--   errou                     -> volta amanhã; repetitions=0; ease -0.2 (mín 1.3)
--   acertou questão na fila   -> repetitions+1; ease +0.1 (máx 3.0);
--                                1º acerto: 3 dias; depois: intervalo anterior * ease
--                                (teto de 60 dias, pois a prova tem data marcada)
--   acertou fora da fila      -> nada muda
-- security invoker (padrão): o RLS continua valendo dentro da função.
-- ---------------------------------------------------------------------------
create function public.submit_answer(
  p_question_id uuid,
  p_option      text,
  p_mode        text default 'practice'
) returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_option  text := upper(p_option);
  v_correct text;
  v_ok      boolean;
  v_item    public.review_items%rowtype;
  v_ease    numeric;
  v_reps    int;
  v_days    int;
  v_due     date;
  v_today   date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if v_uid is null then
    raise exception 'não autenticado' using errcode = '28000';
  end if;
  if v_option not in ('A','B','C','D','E') then
    raise exception 'alternativa inválida: %', p_option;
  end if;
  if p_mode not in ('practice','review') then
    raise exception 'modo inválido: %', p_mode;
  end if;

  select correct_option into v_correct
  from public.questions
  where id = p_question_id and user_id = v_uid;

  if not found then
    raise exception 'questão não encontrada';
  end if;

  v_ok := (v_option = v_correct);

  insert into public.answers (user_id, question_id, selected_option, is_correct, mode)
  values (v_uid, p_question_id, v_option, v_ok, p_mode);

  select * into v_item
  from public.review_items
  where question_id = p_question_id and user_id = v_uid;

  if not v_ok then
    v_ease := greatest(1.3, coalesce(v_item.ease_factor, 2.5) - 0.2);
    v_reps := 0;
    v_days := 1;
    v_due  := v_today + 1;
  elsif found then
    v_ease := least(3.0, v_item.ease_factor + 0.1);
    v_reps := v_item.repetitions + 1;
    v_days := case when v_reps = 1 then 3
                   else least(60, round(v_item.interval_days * v_ease)::int) end;
    v_due  := v_today + v_days;
  else
    -- acertou uma questão que não está na fila de revisão: nada a fazer
    return jsonb_build_object('is_correct', true, 'correct_option', v_correct, 'next_due', null);
  end if;

  insert into public.review_items
    (question_id, user_id, ease_factor, interval_days, repetitions, due_date, last_reviewed_at)
  values
    (p_question_id, v_uid, v_ease, v_days, v_reps, v_due, now())
  on conflict (question_id) do update set
    ease_factor      = excluded.ease_factor,
    interval_days    = excluded.interval_days,
    repetitions      = excluded.repetitions,
    due_date         = excluded.due_date,
    last_reviewed_at = excluded.last_reviewed_at;

  return jsonb_build_object('is_correct', v_ok, 'correct_option', v_correct, 'next_due', v_due);
end;
$$;

-- ---------------------------------------------------------------------------
-- random_questions: sorteia no banco (order by random) em vez de baixar tudo.
-- ---------------------------------------------------------------------------
create function public.random_questions(p_subject_ids uuid[], p_limit int default 10)
returns setof public.questions
language sql stable
set search_path = public
as $$
  select *
  from public.questions
  where status = 'active'
    and (p_subject_ids is null or cardinality(p_subject_ids) = 0 or subject_id = any (p_subject_ids))
  order by random()
  limit least(greatest(p_limit, 1), 200)
$$;

-- ---------------------------------------------------------------------------
-- Estatísticas agregadas no banco (GROUP BY), não no celular.
-- ---------------------------------------------------------------------------
create function public.subject_stats()
returns table (subject_id uuid, name text, total int, correct int)
language sql stable
set search_path = public
as $$
  select s.id, s.name,
         count(a.id)::int,
         (count(a.id) filter (where a.is_correct))::int
  from public.subjects s
  left join public.questions q on q.subject_id = s.id
  left join public.answers   a on a.question_id = q.id
  where s.user_id = (select auth.uid())
  group by s.id, s.name, s.sort_order
  order by s.sort_order, s.name
$$;

-- Dia no fuso de São Paulo: uma resposta às 22h não vira "amanhã" por causa do UTC.
create function public.daily_activity(p_start date, p_end date)
returns table (day date, total int, correct int)
language sql stable
set search_path = public
as $$
  select (a.answered_at at time zone 'America/Sao_Paulo')::date as day,
         count(*)::int,
         (count(*) filter (where a.is_correct))::int
  from public.answers a
  where a.user_id = (select auth.uid())
    and (a.answered_at at time zone 'America/Sao_Paulo')::date between p_start and p_end
  group by 1
  order by 1
$$;

revoke execute on function
  public.submit_answer(uuid, text, text),
  public.random_questions(uuid[], int),
  public.subject_stats(),
  public.daily_activity(date, date)
from public, anon;

grant execute on function
  public.submit_answer(uuid, text, text),
  public.random_questions(uuid[], int),
  public.subject_stats(),
  public.daily_activity(date, date)
to authenticated;
