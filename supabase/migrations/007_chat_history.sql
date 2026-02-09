-- ============================================================
-- Citizen Scheme — Supabase Migration
-- 007: Chat history tables (threads + messages)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. chat_threads
-- ──────────────────────────────────────────────────────────────
create table if not exists public.chat_threads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default 'New chat',
  last_message text,
  last_message_at timestamptz default now(),
  backboard_thread_id text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_chat_threads_user on public.chat_threads(user_id);
create index if not exists idx_chat_threads_last_message on public.chat_threads(last_message_at desc);

comment on table public.chat_threads is 'Per-user chat threads with Backboard thread IDs.';

-- ──────────────────────────────────────────────────────────────
-- 2. chat_messages
-- ──────────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_chat_messages_thread on public.chat_messages(thread_id);
create index if not exists idx_chat_messages_created on public.chat_messages(created_at);

comment on table public.chat_messages is 'Message history per chat thread.';

-- ──────────────────────────────────────────────────────────────
-- 3. RLS policies
-- ──────────────────────────────────────────────────────────────
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users can view own chat threads"
  on public.chat_threads for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat threads"
  on public.chat_threads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chat threads"
  on public.chat_threads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own chat threads"
  on public.chat_threads for delete
  using (auth.uid() = user_id);

create policy "Users can view own chat messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id
        and t.user_id = auth.uid()
    )
  );

create policy "Users can insert own chat messages"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id
        and t.user_id = auth.uid()
    )
  );

create policy "Users can delete own chat messages"
  on public.chat_messages for delete
  using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id
        and t.user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 4. updated_at trigger
-- ──────────────────────────────────────────────────────────────
create trigger set_updated_at_chat_threads
  before update on public.chat_threads
  for each row execute function public.handle_updated_at();
