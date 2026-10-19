# Escrevente Pro

App web (mobile-first) para estudar para o concurso de **Escrevente Técnico Judiciário do TJSP** (banca VUNESP). Projeto pessoal, também usado para aprender backend de verdade com Supabase e Postgres.

## Funcionalidades (MVP)

- **Login** com e-mail e senha. Cada usuário vê só os próprios dados (Row Level Security).
- **Matérias** pré-cadastradas automaticamente no cadastro (11 matérias do edital) e editáveis.
- **Banco de questões** de múltipla escolha (enunciado, alternativas A–E, gabarito, matéria, assunto, fonte), com filtro e busca.
- **Importação em massa** por planilha `.xlsx` ou `.csv`, com prévia e relatório de erros por linha antes de salvar.
- **Modo resolver**: escolha matérias e quantidade, responda uma por vez e veja na hora se acertou.
- **Revisão espaçada** (SM-2 simplificado): questões erradas voltam nos dias seguintes. Tela "Revisão de hoje".
- **Mapa de calor** anual de questões resolvidas por dia (estilo GitHub) e sequência de dias.
- **Painel de desempenho**: % de acerto geral e por matéria, com as mais fracas em destaque.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite, React Router, CSS Modules (JavaScript) |
| Backend | Supabase: Auth, Postgres, Row Level Security, funções SQL (RPC) |
| Planilhas | SheetJS (carregado sob demanda só na tela de importação) |
| Deploy | Vercel |
| IA (fase 2) | API do Claude via Supabase Edge Functions |

## Decisões de arquitetura

- **RLS em todas as tabelas.** A chave pública (`anon`/`publishable`) fica no navegador por design. Quem isola os dados é o Postgres: toda política exige `user_id = auth.uid()`. Chaves estrangeiras compostas `(id, user_id)` impedem até que uma linha aponte para dados de outro usuário.
- **Regra de negócio no banco.** `submit_answer()` confere o gabarito, grava a tentativa e atualiza a revisão espaçada numa única transação. O navegador nunca decide se acertou.
- **Estatísticas agregadas em SQL** (`subject_stats`, `daily_activity`), não no celular. Os dias do mapa de calor usam o fuso `America/Sao_Paulo`.
- **Sorteio no banco** (`random_questions`), em vez de baixar todas as questões.
- **Migrations versionadas** em `supabase/migrations/`: o schema fica no Git.
- **`services/`** concentra toda conversa com o Supabase; as páginas não chamam o banco diretamente.

### Como funciona a revisão espaçada

Algoritmo SM-2 simplificado para acerto/erro (sem nota de 0 a 5). Cada questão na fila tem um fator de facilidade (`ease`, começa em 2,5).

| Situação | Efeito |
|---|---|
| Errou (qualquer modo) | Entra na fila ou reinicia. Volta **amanhã**. `ease` −0,2 (mín. 1,3) |
| Acertou uma questão da fila | 1º acerto: **3 dias**. Depois: intervalo anterior × `ease`. `ease` +0,1 (máx. 3,0). Teto de 60 dias |
| Acertou uma questão fora da fila | Nada muda |

Sequência típica após um erro: 1 → 3 → 8 → 21 → 57 dias. Questões erradas muitas vezes têm `ease` baixo e voltam com mais frequência.

## Rodando localmente

Pré-requisitos: Node.js 20+ e uma conta gratuita no [Supabase](https://supabase.com).

```bash
npm install
cp .env.example .env.local   # no Windows (PowerShell): copy .env.example .env.local
```

1. Crie um projeto no Supabase (região South America – São Paulo).
2. Preencha o `.env.local` com a **Project URL** e a chave **anon/publishable** (Project Settings → API). Nunca use a chave `service_role`/`secret` no frontend.
3. No painel do Supabase, abra **SQL Editor → New query**, cole o conteúdo de [`supabase/migrations/0001_schema.sql`](supabase/migrations/0001_schema.sql) e clique em **Run**. Isso cria tabelas, RLS, funções e o gatilho das matérias. Rode uma única vez.
4. Em **Authentication → URL Configuration**, defina *Site URL* como `http://localhost:5173`.
5. Inicie o app:

```bash
npm run dev
```

Abra http://localhost:5173 e crie sua conta.

> Alternativa com a Supabase CLI: `npx supabase login`, `npx supabase link --project-ref <ref>` e `npx supabase db push`.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run lint` | Lint com oxlint |
| `node scripts/gen-template.mjs` | Regera `public/modelo-questoes.xlsx` e `.csv` |
| `node scripts/parse-check.mjs` | Verifica o parser de importação |

## Importando questões

Baixe o modelo na tela **Questões → Importar**. Colunas: `materia`, `assunto`, `enunciado`, `alternativa_a` … `alternativa_e`, `gabarito` (A–E), `fonte`. O nome da matéria deve ser igual ao de uma das suas matérias (maiúsculas e acentos não importam). Aceita CSV separado por vírgula ou ponto e vírgula (padrão do Excel brasileiro).

## Deploy (Vercel)

1. Suba o projeto para um repositório no GitHub.
2. Na Vercel, **Add New → Project**, importe o repositório (preset Vite é detectado).
3. Em **Environment Variables**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. No Supabase, em **Authentication → URL Configuration**, adicione a URL da Vercel em *Site URL* e *Redirect URLs*.

O arquivo `vercel.json` faz todas as rotas caírem no `index.html`, necessário para o React Router.

## Segurança

- `.env.local` nunca é commitado (está no `.gitignore`).
- Só variáveis com prefixo `VITE_` chegam ao navegador. Segredos (ex.: chave do Claude) nunca usam esse prefixo.
- A chave da API do Claude ficará somente nos *secrets* das Edge Functions (fase 2).

## Estrutura

```
src/
  lib/          cliente Supabase, datas (fuso SP), parser de importação
  contexts/     AuthContext (sessão)
  services/     toda comunicação com o Supabase
  components/   Layout, Heatmap, QuizRunner, StatBar, ProtectedRoute
  pages/        Login, Dashboard, Practice, Review, Questions, Import, Subjects, Stats
supabase/migrations/   schema, RLS e funções SQL
scripts/               gerador do modelo de planilha e verificações
```

## Roadmap (fase 2)

- Botão "Explicar com IA" (Claude explica o gabarito e o erro cometido)
- Geração de questões no estilo VUNESP a partir de trechos de lei, com revisão manual antes de salvar
- Resumo semanal gerado por IA com os assuntos mais errados
- Cronograma de estudo com meta de horas por semana
