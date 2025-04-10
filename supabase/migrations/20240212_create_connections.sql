-- Create connections table
create table public.connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  addon_id uuid not null references public."AdminAddons"(id),
  token text not null,
  refresh_token text,
  account_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Add unique constraint to prevent duplicate connections for same user and addon
  unique(user_id, addon_id)
);

-- Add RLS policies
alter table public.connections enable row level security;

create policy "Users can view their own connections"
  on public.connections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own connections"
  on public.connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own connections"
  on public.connections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own connections"
  on public.connections for delete
  using (auth.uid() = user_id);