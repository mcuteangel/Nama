-- Drop existing columns that are not needed or are inconsistent
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS full_name;

-- Add new columns for first_name and last_name
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- The existing RLS policies are based on 'id' and 'auth.uid()', which are still valid.
-- No changes are needed for the RLS policies themselves.