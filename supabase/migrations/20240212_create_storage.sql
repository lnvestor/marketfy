-- Create storage bucket for company logos
insert into storage.buckets (id, name, public) 
values ('company-logos', 'company-logos', true);

-- Create policy to allow public access to company logos
create policy "Company logos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'company-logos' );

-- Create policy to allow authenticated users to upload company logos
create policy "Users can upload company logos"
  on storage.objects for insert
  with check (
    bucket_id = 'company-logos' 
    and auth.role() = 'authenticated'
  );

-- Create policy to allow users to update their own company logos
create policy "Users can update own company logos"
  on storage.objects for update
  using (
    bucket_id = 'company-logos'
    and auth.uid() = owner
  );