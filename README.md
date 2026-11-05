# Evolve – Personal Learning & Mistake Journal

Record what you learn and the mistakes you make every day, link them together,
and (in later phases) review your weeks and months, spot repeated mistakes,
track your growth and ask AI questions about your own journal.

**Stack:** React 19 + TypeScript + Vite · Tailwind CSS + shadcn/ui · Supabase (Postgres, Auth, Row Level Security) · Vercel

## Build status

| Phase | Feature | Status |
|---|---|---|
| 3 | Learning & Mistake journal, linking, tags, search, filters, login, export | ✅ Done |
| 4 | Full dashboard + Learning Calendar / heatmap | Planned |
| 5 | Weekly & Monthly reviews | Planned |
| 6 | Repeated mistake detection | Planned |
| 7 | Personal Growth Score & analytics | Planned |
| 8 | AI Journal Insights + Ask My Journal | Planned |
| 9 | Full testing pass | Planned |

## One-time setup

### 1. Supabase

1. Create a new project at [supabase.com](https://supabase.com) (free plan).
2. **SQL Editor → New query** → paste the whole of
   [`supabase/migrations/0001_evolve_schema.sql`](supabase/migrations/0001_evolve_schema.sql) → **Run**.
   Run it once only.
3. **Authentication → Users → Add user → Create new user**: enter your email and a strong
   password and tick **Auto Confirm User**.
4. **Authentication → Sign In / Providers**: turn **off** “Allow new users to sign up”,
   so nobody else can create an account on your journal.
5. **Project Settings → API Keys**: copy the **Publishable key**. The **Project URL** is on the
   project home page (or under Data API).

### 2. Run locally

```bash
cp .env.example .env.local   # then paste your URL and publishable key into .env.local
npm install
npm run dev
```

Open http://localhost:5173 and sign in.

### 3. Deploy to Vercel (free)

1. Push this folder to a **private** GitHub repository.
2. Vercel → **Add New → Project** → import the repository (framework: Vite, detected automatically).
3. Under **Environment Variables** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. **Deploy**. Every push to `main` redeploys automatically.

## Good to know

- **Security:** every table uses Row Level Security, so only the signed-in owner can read or
  change rows. The publishable key in the browser is meant to be public. Never put the
  `service_role` / secret key in this app.
- **Backups:** Supabase’s free plan has no backups you can download. Use
  **Settings → Backup & export** in the app regularly (JSON = full backup, Markdown = readable copy).
- **Inactivity:** free Supabase projects pause after 7 days without use. Daily journaling keeps
  it active; a paused project can be restored from the Supabase dashboard without losing data.
- **Categories:** option lists live in [`src/lib/constants.ts`](src/lib/constants.ts). You can add
  categories or sources there without changing the database.

## Project structure

```
supabase/migrations/   SQL schema (run in Supabase SQL Editor)
src/
  app/                 router, layout, navigation
  components/ui/       shadcn/ui components
  components/common/   shared form & UI pieces (rating, tags, link picker…)
  features/
    auth/              login, session
    learnings/         learning list, form, detail, data hooks
    mistakes/          mistake list, form, detail, data hooks
    entries/           shared list/filter/detail building blocks
    dashboard/         dashboard
    search/            Ctrl+K global search
    settings/          settings, export
  lib/                 Supabase client, constants, dates, theme
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the app locally |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Lint the code |
