-- =============================================================================
-- Evolve – Personal Learning & Mistake Journal
-- Migration 0001: core schema (all tables, relationships, indexes, security)
--
-- How to run: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run once on a fresh project. Every table is protected by Row Level
-- Security so only the logged-in owner can read or change their rows.
-- =============================================================================

-- Fuzzy text matching (used for search and repeated-mistake detection).
create extension if not exists pg_trgm with schema extensions;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

-- Keeps updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- array_to_string() is not IMMUTABLE, so generated columns cannot call it
-- directly. This wrapper is safe because text[] -> text is deterministic.
create or replace function public.tags_to_text(tags text[])
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select coalesce(pg_catalog.array_to_string(tags, ' '), '');
$$;

-- -----------------------------------------------------------------------------
-- Repeated mistake patterns
-- A pattern is a mistake you have confirmed happens again and again.
-- Each occurrence is a row in public.mistakes pointing to the pattern.
-- -----------------------------------------------------------------------------
create table public.mistake_patterns (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 200),
  description    text not null default '',
  recommendation text not null default '',
  status         text not null default 'active' check (status in ('active', 'resolved')),
  resolved_at    date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (id, user_id)
);

-- -----------------------------------------------------------------------------
-- Learnings
-- -----------------------------------------------------------------------------
create table public.learnings (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title                 text not null check (char_length(title) between 1 and 200),
  description           text not null default '',
  entry_date            date not null default current_date,
  entry_time            time,
  occasion              text not null default '',
  category              text not null,
  source                text not null,
  learned_from          text not null default '',
  importance            smallint not null default 3 check (importance between 1 and 5),
  tags                  text[] not null default '{}',
  practical_application text not null default '',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  search                tsvector generated always as (
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', description || ' ' || practical_application || ' ' || occasion), 'B') ||
    setweight(to_tsvector('simple', learned_from || ' ' || public.tags_to_text(tags)), 'C')
  ) stored,
  unique (id, user_id)
);

create index learnings_user_date_idx   on public.learnings (user_id, entry_date desc, entry_time desc);
create index learnings_user_source_idx on public.learnings (user_id, source);
create index learnings_user_cat_idx    on public.learnings (user_id, category);
create index learnings_tags_idx        on public.learnings using gin (tags);
create index learnings_search_idx      on public.learnings using gin (search);

create trigger learnings_updated_at
  before update on public.learnings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Mistakes
-- -----------------------------------------------------------------------------
create table public.mistakes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 200),
  description    text not null default '',
  entry_date     date not null default current_date,
  entry_time     time,
  location       text not null,               -- where: Office, Meeting, Coding, ...
  occasion       text not null default '',
  why_happened   text not null default '',
  root_cause     text not null default '',
  impact         text not null default '',
  how_handled    text not null default '',
  lesson_learned text not null default '',
  do_differently text not null default '',
  category       text not null,
  severity       smallint not null default 3 check (severity between 1 and 5),
  self_rating    smallint check (self_rating between 1 and 5),
  status         text not null default 'unresolved'
                   check (status in ('unresolved', 'learning', 'resolved', 'repeated')),
  tags           text[] not null default '{}',
  pattern_id     uuid,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  search         tsvector generated always as (
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english',
      description || ' ' || why_happened || ' ' || root_cause || ' ' || lesson_learned || ' ' || do_differently
    ), 'B') ||
    setweight(to_tsvector('english', occasion || ' ' || impact || ' ' || how_handled), 'C') ||
    setweight(to_tsvector('simple', public.tags_to_text(tags)), 'C')
  ) stored,
  unique (id, user_id),
  -- The pattern must belong to the same user. Deleting a pattern keeps the mistakes.
  foreign key (pattern_id, user_id)
    references public.mistake_patterns (id, user_id) on delete set null (pattern_id)
);

create index mistakes_user_date_idx    on public.mistakes (user_id, entry_date desc, entry_time desc);
create index mistakes_user_status_idx  on public.mistakes (user_id, status);
create index mistakes_user_cat_idx     on public.mistakes (user_id, category);
create index mistakes_pattern_idx      on public.mistakes (pattern_id) where pattern_id is not null;
create index mistakes_tags_idx         on public.mistakes using gin (tags);
create index mistakes_search_idx       on public.mistakes using gin (search);
create index mistakes_title_trgm_idx   on public.mistakes using gin (title extensions.gin_trgm_ops);

create trigger mistakes_updated_at
  before update on public.mistakes
  for each row execute function public.set_updated_at();

create trigger mistake_patterns_updated_at
  before update on public.mistake_patterns
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Learning <-> Mistake links (many-to-many, stored once, shown on both sides)
-- -----------------------------------------------------------------------------
create table public.learning_mistake_links (
  learning_id uuid not null,
  mistake_id  uuid not null,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (learning_id, mistake_id),
  foreign key (learning_id, user_id) references public.learnings (id, user_id) on delete cascade,
  foreign key (mistake_id, user_id)  references public.mistakes (id, user_id)  on delete cascade
);

create index learning_mistake_links_mistake_idx on public.learning_mistake_links (mistake_id);

-- -----------------------------------------------------------------------------
-- "These two mistakes are NOT the same" decisions, so they are never
-- suggested as a repeated mistake again. Pair stored once (mistake_a < mistake_b).
-- -----------------------------------------------------------------------------
create table public.mistake_match_dismissals (
  mistake_a  uuid not null,
  mistake_b  uuid not null,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (mistake_a, mistake_b),
  check (mistake_a < mistake_b),
  foreign key (mistake_a, user_id) references public.mistakes (id, user_id) on delete cascade,
  foreign key (mistake_b, user_id) references public.mistakes (id, user_id) on delete cascade
);

create index mistake_match_dismissals_b_idx on public.mistake_match_dismissals (mistake_b);

-- -----------------------------------------------------------------------------
-- Weekly & monthly reviews (only what you write/rate is stored; all counts and
-- breakdowns are calculated live from your entries, so nothing is duplicated)
-- -----------------------------------------------------------------------------
create table public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  period_type        text not null check (period_type in ('week', 'month')),
  period_start       date not null,
  biggest_lesson     text not null default '',
  went_well          text not null default '',
  to_improve         text not null default '',
  reflection         text not null default '',
  overall_rating     smallint check (overall_rating between 1 and 10),
  best_learning_id   uuid,
  biggest_mistake_id uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, period_type, period_start),
  unique (id, user_id),
  foreign key (best_learning_id, user_id)
    references public.learnings (id, user_id) on delete set null (best_learning_id),
  foreign key (biggest_mistake_id, user_id)
    references public.mistakes (id, user_id) on delete set null (biggest_mistake_id)
);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Personal growth self-ratings (8 dimensions, 1–10) attached to a review.
create table public.growth_ratings (
  review_id  uuid not null,
  dimension  text not null check (dimension in (
               'technical_skills', 'communication', 'problem_solving', 'decision_making',
               'time_management', 'discipline', 'learning_consistency', 'professional_behaviour')),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rating     smallint not null check (rating between 1 and 10),
  note       text not null default '',
  primary key (review_id, dimension),
  foreign key (review_id, user_id) references public.reviews (id, user_id) on delete cascade
);

-- Goals set in a review; ticked off in the next review.
create table public.review_goals (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  goal       text not null check (char_length(goal) between 1 and 500),
  status     text not null default 'pending' check (status in ('pending', 'achieved', 'partial', 'missed')),
  position   smallint not null default 0,
  created_at timestamptz not null default now(),
  foreign key (review_id, user_id) references public.reviews (id, user_id) on delete cascade
);

create index review_goals_review_idx on public.review_goals (review_id, position);

-- -----------------------------------------------------------------------------
-- AI output – kept completely separate from your own journal entries.
-- -----------------------------------------------------------------------------
create table public.ai_insights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('summary', 'ask', 'dashboard', 'pattern')),
  range_start date,
  range_end   date,
  question    text,
  answer      text not null,
  model       text,
  created_at  timestamptz not null default now()
);

create index ai_insights_user_created_idx on public.ai_insights (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Per-user settings
-- -----------------------------------------------------------------------------
create table public.user_settings (
  user_id        uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6), -- 0 = Sunday, 1 = Monday
  timezone       text not null default 'UTC',
  updated_at     timestamptz not null default now()
);

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Read-only helper views (security_invoker => your RLS rules apply)
-- -----------------------------------------------------------------------------

-- Everyone/everything you learned from, for autocomplete and filtering.
create view public.learning_people
with (security_invoker = true) as
select
  learned_from      as name,
  count(*)::int     as entries,
  max(entry_date)   as last_date
from public.learnings
where learned_from <> ''
group by learned_from;

-- All tags used anywhere, with how often.
create view public.tag_usage
with (security_invoker = true) as
select tag, count(*)::int as uses
from (
  select unnest(tags) as tag from public.learnings
  union all
  select unnest(tags) as tag from public.mistakes
) t
group by tag;

-- -----------------------------------------------------------------------------
-- Row Level Security: each user can only see and change their own rows.
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'learnings', 'mistakes', 'mistake_patterns', 'learning_mistake_links',
    'mistake_match_dismissals', 'reviews', 'growth_ratings', 'review_goals',
    'ai_insights', 'user_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Owner full access" on public.%I for all to authenticated '
      'using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
  end loop;
end;
$$;

revoke all on public.learning_people, public.tag_usage from anon;
grant select on public.learning_people, public.tag_usage to authenticated;
