ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS gemini_model TEXT DEFAULT 'gemini-pro';

-- Update existing policies to include the new column if necessary (SELECT policy already covers all columns)
-- No new policies are strictly needed for this column as existing RLS policies on user_settings will apply.