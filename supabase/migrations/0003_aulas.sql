-- ============================================================================
-- Escrevente Pro: aulas (links de videoaulas organizados por matéria e assunto)
-- Rode UMA vez no SQL Editor do Supabase (depois da 0001 e da 0002).
-- O app NÃO hospeda vídeos: guarda só o link do YouTube e o progresso de cada aula.
-- ============================================================================

create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id  uuid,
  topic       text,
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
