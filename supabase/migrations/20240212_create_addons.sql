create table if not exists public."AdminAddons" (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  logo text not null,
  has_tools boolean default false,
  has_connection boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public."AdminAddons" enable row level security;

-- Allow public read access
create policy "Allow public read access"
  on public."AdminAddons"
  for select
  using (true);

-- Sample data
insert into public."AdminAddons" (name, description, logo, has_tools, has_connection) values
  ('Celigo', 'iPaaS integration platform for seamless connectivity', '/logos/celigo.jpg', true, true),
  ('NetSuite', 'Cloud-based business management suite', '/logos/NetSuite.png', true, true),
  ('Exa', 'Advanced data analytics and processing', '/logos/exa.jpg', false, false),
  ('Claude AI', 'Advanced AI assistant for intelligent automation', '/logos/Claude.png', false, false);

-- Create adminaddonsfeatures table
create table if not exists public.adminaddonsfeatures (
  id uuid default gen_random_uuid() primary key,
  addon_id uuid references public."AdminAddons"(id) on delete cascade,
  feature text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.adminaddonsfeatures enable row level security;

-- Allow public read access
create policy "Allow public read access"
  on public.adminaddonsfeatures
  for select
  using (true);

-- Sample features data
insert into public.adminaddonsfeatures (addon_id, feature)
select id, unnest(array[
  'SmartConnectors',
  'Integration Apps',
  'Flow Builder',
  'Data Transformation',
  'Error Management'
])
from public."AdminAddons" where name = 'Celigo';

insert into public.adminaddonsfeatures (addon_id, feature)
select id, unnest(array[
  'Financial Management',
  'Order Management',
  'Production Management',
  'Supply Chain',
  'Warehouse Management'
])
from public."AdminAddons" where name = 'NetSuite';

insert into public.adminaddonsfeatures (addon_id, feature)
select id, unnest(array[
  'Data Analytics',
  'Process Automation',
  'Reporting Tools',
  'Data Visualization',
  'Integration APIs'
])
from public."AdminAddons" where name = 'Exa';

insert into public.adminaddonsfeatures (addon_id, feature)
select id, unnest(array[
  'Natural Language Processing',
  'Task Automation',
  'Content Generation',
  'Data Analysis',
  'Code Generation'
])
from public."AdminAddons" where name = 'Claude AI';
