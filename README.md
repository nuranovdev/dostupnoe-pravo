# Lexcase — Legal CRM

A clean, SaaS-style CRM prototype for lawyers to manage clients and track case
statuses. Built as an interview assignment: single-page dashboard, full CRUD,
search & filtering, live statistics, and an optional Telegram notification when a
new client is created.

> **Status:** production-ready prototype. Frontend + backend + database are fully
> wired to Supabase; deploy on Vercel in minutes (see below).

---

## Features

- **Dashboard** with four live statistics cards — Total, New, In Progress, Closed.
- **Clients table** — name, phone, status, created date, and row actions.
- **Create client** — validated form (React Hook Form + Zod), default status `NEW`.
- **Edit client** — update name, phone and status.
- **Delete client** — confirmation dialog before removal.
- **Quick status change** — click the status badge to advance
  `NEW → IN_PROGRESS → CLOSED`, or pick a specific status from the row menu.
  Updates optimistically and persists immediately.
- **Search** by name or phone, plus a **status filter** (All / New / In Progress / Closed).
- **UX states** — loading skeletons, empty states, error banner, and
  [Sonner](https://sonner.emilkowal.ski/) toast notifications on every mutation.
- **Responsive** — works on desktop and mobile.
- **Telegram notification (bonus)** — a message is sent when a client is created;
  silently skipped if the bot token / chat id are not configured.

---

## Tech stack

| Layer      | Choice                                                       |
| ---------- | ------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, Server Actions) + React 19           |
| Language   | TypeScript                                                   |
| Styling    | Tailwind CSS v4                                              |
| UI         | shadcn/ui (Base UI primitives) + lucide-react icons          |
| Forms      | React Hook Form + Zod                                        |
| Backend/DB | Supabase (PostgreSQL) via `@supabase/supabase-js`            |
| Toasts     | Sonner                                                       |
| Deployment | Vercel                                                       |

> The assignment specified Next.js 15; this uses the current Next.js 16 line,
> which is API-compatible for everything used here. Status is stored as a
> PostgreSQL `enum` (`NEW`, `IN_PROGRESS`, `CLOSED`) so allowed values are
> enforced at the database level.

---

## Architecture

- **Reads** happen in a Server Component (`src/app/page.tsx`) directly from
  Supabase and are streamed into the client dashboard as initial state.
- **Writes** go through typed **Server Actions** (`src/app/actions.ts`) so the
  Telegram bot token and (optional) service-role key stay server-only. The UI
  updates optimistically and shows a toast; failures roll back.
- Validation lives in one Zod schema (`src/lib/validations.ts`) shared by the
  form and the server actions.

```
src/
  app/
    actions.ts        # server actions: create / update / delete / change status
    page.tsx          # server component: fetches clients
    layout.tsx        # root layout + Toaster
  components/
    dashboard.tsx     # main client component (state, search, filter, handlers)
    stats-cards.tsx
    clients-table.tsx
    client-form-dialog.tsx
    delete-client-dialog.tsx
    status-badge.tsx
    ui/               # shadcn/ui components
  lib/
    supabase/         # browser + server clients
    telegram.ts       # best-effort notification
    validations.ts    # zod schema
    utils.ts
  types/
    client.ts         # Client type, statuses, helpers
supabase/
  migrations/0001_init_clients.sql
  seed.sql
```

---

## Local setup

Prerequisites: Node.js 18.18+ and a free [Supabase](https://supabase.com) project.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Create the database schema
#    Supabase Dashboard -> SQL Editor -> paste & run:
#      supabase/migrations/0001_init_clients.sql
#    (optional) load sample data with supabase/seed.sql

# 4. Run
npm run dev
# open http://localhost:3000
```

Quality gates:

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Environment variables

| Variable                        | Required | Description                                             |
| ------------------------------- | -------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | Supabase project URL.                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | Supabase anonymous (public) key.                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | no       | Optional. Used server-side for writes; bypasses RLS.    |
| `TELEGRAM_BOT_TOKEN`            | no       | Optional. Bot token for new-client notifications.       |
| `TELEGRAM_CHAT_ID`              | no       | Optional. Chat/channel id to notify.                    |

---

## Deployment (Vercel)

1. Push this repo to GitHub.
2. In Vercel, **Import** the repository.
3. Add the environment variables above in **Project Settings -> Environment Variables**.
4. Deploy. Vercel auto-detects Next.js — no extra config needed.
5. Ensure the SQL migration has been run against your Supabase project.

---

## AI usage

This prototype was built end-to-end with **Claude (Claude Code)** acting as an
autonomous senior developer:

- Analyzed the assignment and made the engineering decisions (Server Actions for
  writes, optimistic status updates, DB-level status enum, RLS policy).
- Scaffolded the Next.js + Tailwind + shadcn/ui project and wrote all application
  code, the SQL migration, seed data and this README.
- Ran `typecheck`, `lint` and `build` iteratively and fixed issues until green.

AI accelerated boilerplate and wiring; all architectural choices were reviewed
for correctness and kept deliberately simple per the brief.

---

## License

MIT — prototype for evaluation purposes.
