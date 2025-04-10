create table public.chat_usage (
  id uuid not null default extensions.uuid_generate_v4(),
  session_id uuid not null,
  message_id uuid not null,
  prompt_tokens integer not null,
  completion_tokens integer not null,
  total_tokens integer not null,
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  constraint chat_usage_pkey primary key (id),
  constraint chat_usage_session_id_fkey foreign key (session_id) references chat_sessions (id) on delete cascade,
  constraint chat_usage_message_id_fkey foreign key (message_id) references chat_messages (id) on delete cascade
) tablespace pg_default;

create index if not exists chat_usage_session_id_idx on public.chat_usage using btree (session_id) tablespace pg_default;
create index if not exists chat_usage_message_id_idx on public.chat_usage using btree (message_id) tablespace pg_default;
create index if not exists chat_usage_created_at_idx on public.chat_usage using btree (created_at) tablespace pg_default;

-- Add RLS (Row Level Security) policy to ensure users can only see their own usage data
alter table public.chat_usage enable row level security;

create policy "Users can view their own usage data"
  on public.chat_usage
  for select
  using (
    session_id in (
      select id from public.chat_sessions where user_id = auth.uid()
    )
  );

create policy "Users can insert their own usage data"
  on public.chat_usage
  for insert
  with check (
    session_id in (
      select id from public.chat_sessions where user_id = auth.uid()
    )
  );