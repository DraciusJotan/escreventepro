# Escrevente Pro

App web para estudar para o concurso de **Escrevente Técnico Judiciário do TJSP** (banca VUNESP): banco de questões, modo de resolução, revisão espaçada, mapa de calor de estudo e painel de desempenho.

> Em desenvolvimento. Este README será completado ao fim do MVP.

## Stack

- **Frontend:** React 19 + Vite + React Router (JavaScript)
- **Backend:** Supabase: Auth, Postgres e Row Level Security
- **IA (fase 2):** API do Claude via Supabase Edge Functions
- **Deploy:** Vercel

## Rodando localmente

Pré-requisitos: Node.js 20+ e um projeto no [Supabase](https://supabase.com).

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a chave anon do seu projeto
npm run dev
```

Abra http://localhost:5173.

## Segurança

- `.env.local` nunca é commitado (está no `.gitignore`).
- A chave `anon` do Supabase é pública por design. Quem isola os dados de cada usuário é o **Row Level Security** no Postgres.
- A chave da API do Claude fica só nos *secrets* da Edge Function, nunca no frontend.
