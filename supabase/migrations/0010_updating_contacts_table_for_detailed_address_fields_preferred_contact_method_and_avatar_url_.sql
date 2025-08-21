-- Drop the existing 'address' column if it exists
ALTER TABLE public.contacts
DROP COLUMN IF EXISTS address;

-- Add new detailed address columns
ALTER TABLE public.contacts
ADD COLUMN street TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip_code TEXT,
ADD COLUMN country TEXT;

-- Add preferred_contact_method column
ALTER TABLE public.contacts
ADD COLUMN preferred_contact_method TEXT;

-- Add avatar_url column
ALTER TABLE public.contacts
ADD COLUMN avatar_url TEXT;

-- RLS policies for contacts table already cover these new columns due to the '*' command.
-- No explicit RLS policy updates are needed for these new columns on the contacts table.