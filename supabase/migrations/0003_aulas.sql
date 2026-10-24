-- ============================================================================
-- Escrevente Pro: aulas (links de videoaulas) e progresso do checklist do edital
-- Rode UMA vez no SQL Editor do Supabase (depois da 0001 e da 0002).
-- O app NÃO hospeda vídeos: guarda só o link do YouTube e o progresso de cada aula.
-- ============================================================================

create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id  uuid,
  topic       text,
  edital_key  text,          -- assunto do edital ao qual a aula pertence (ex.: 'lp-crase'), se houver
  title       text not null check (length(trim(title)) > 0),
  channel     text,
  url         text not null
              check (url ~* '^https://((www|m)\.)?(youtube\.com|youtu\.be)/'),
  kind        text not null default 'video' check (kind in ('video', 'playlist')),
  note        text,
  watched     boolean not null default false,
  watched_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, url),
  -- apagar a matéria não apaga a aula: ela só fica sem matéria (só a coluna subject_id vira nula)
  foreign key (subject_id, user_id) references public.subjects (id, user_id) on delete set null (subject_id)
);
create index lessons_user_subject_idx on public.lessons (user_id, subject_id);

alter table public.lessons enable row level security;

create policy "own rows" on public.lessons
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.lessons to authenticated;

-- ---------------------------------------------------------------------------
-- Progresso no conteúdo programático do edital: um registro por assunto estudado.
-- topic_key é a chave do assunto no app (ex.: 'lp-crase', 'pen-falsidade').
-- ---------------------------------------------------------------------------
create table public.edital_progress (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic_key  text not null check (length(topic_key) between 1 and 80),
  done       boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_key)
);

alter table public.edital_progress enable row level security;

create policy "own rows" on public.edital_progress
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.edital_progress to authenticated;
