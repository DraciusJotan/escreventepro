-- ============================================================================
-- Escrevente Pro: simulados, caderno de erros e metas semanais
-- Rode UMA vez no SQL Editor do Supabase (depois da 0001).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Respostas de simulado: novo modo 'exam' (funciona como 'practice' para a revisão espaçada)
-- ---------------------------------------------------------------------------
alter table public.answers drop constraint if exists answers_mode_check;
alter table public.answers
  add constraint answers_mode_check check (mode in ('practice', 'review', 'exam'));

create or replace function public.submit_answer(
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
  if p_mode not in ('practice','review','exam') then
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
-- Simulados realizados (resumo + gabarito marcado por questão)
-- items: [{ "q": "<id da questão>", "sel": "A".."E" ou null, "ok": true/false }]
-- ---------------------------------------------------------------------------
create table public.exams (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title              text not null default 'Simulado',
  started_at         timestamptz not null default now(),
  finished_at        timestamptz not null default now(),
  time_limit_seconds int  not null check (time_limit_seconds > 0),
  time_used_seconds  int  not null check (time_used_seconds >= 0),
  total              int  not null check (total > 0),
  correct            int  not null check (correct >= 0),
  items              jsonb not null default '[]'::jsonb
);
create index exams_user_finished_idx on public.exams (user_id, finished_at desc);

-- ---------------------------------------------------------------------------
-- Preferências do usuário (meta semanal de questões)
-- ---------------------------------------------------------------------------
create table public.user_settings (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  weekly_goal int  not null default 100 check (weekly_goal between 1 and 5000),
  updated_at  timestamptz not null default now()
);

alter table public.exams         enable row level security;
alter table public.user_settings enable row level security;

create policy "own rows" on public.exams
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own rows" on public.user_settings
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.exams, public.user_settings to authenticated;

-- ---------------------------------------------------------------------------
-- Caderno de erros: questões cuja ÚLTIMA resposta foi errada
-- (quando você acerta, ela sai do caderno)
-- ---------------------------------------------------------------------------
create function public.wrong_questions(p_subject_ids uuid[] default null, p_limit int default 200)
returns setof public.questions
language sql stable
set search_path = public
as $$
  select q.*
  from public.questions q
  join lateral (
    select a.is_correct, a.answered_at
    from public.answers a
    where a.question_id = q.id
    order by a.answered_at desc, a.id desc
    limit 1
  ) last on true
  where not last.is_correct
    and q.status = 'active'
    and (p_subject_ids is null or cardinality(p_subject_ids) = 0 or q.subject_id = any (p_subject_ids))
  order by last.answered_at desc
  limit least(greatest(p_limit, 1), 500)
$$;

revoke execute on function public.wrong_questions(uuid[], int) from public, anon;
grant  execute on function public.wrong_questions(uuid[], int) to authenticated;

revoke execute on function public.submit_answer(uuid, text, text) from public, anon;
grant  execute on function public.submit_answer(uuid, text, text) to authenticated;
