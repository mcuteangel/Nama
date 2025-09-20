-- Create social_links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own social links" ON public.social_links;
DROP POLICY IF EXISTS "Users can only insert their own social links" ON public.social_links;
DROP POLICY IF EXISTS "Users can only update their own social links" ON public.social_links;
DROP POLICY IF EXISTS "Users can only delete their own social links" ON public.social_links;

-- Create policies for each operation
CREATE POLICY "Users can only see their own social links" ON public.social_links
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own social links" ON public.social_links
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own social links" ON public.social_links
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own social links" ON public.social_links
FOR DELETE TO authenticated USING (auth.uid() = user_id);