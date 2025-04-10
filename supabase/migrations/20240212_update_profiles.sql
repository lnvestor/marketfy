-- Update profiles table with company information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Update existing admin profile with placeholder data
UPDATE public.profiles 
SET 
    company_name = COALESCE(company_name, ''),
    company_size = COALESCE(company_size, ''),
    phone = COALESCE(phone, ''),
    linkedin = COALESCE(linkedin, ''),
    company_logo = COALESCE(company_logo, '')
WHERE role = 'admin';