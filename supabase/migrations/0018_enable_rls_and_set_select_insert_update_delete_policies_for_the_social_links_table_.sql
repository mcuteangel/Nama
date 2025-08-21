ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_links_select_policy" ON public.social_links;
CREATE POLICY "social_links_select_policy" ON public.social_links
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "social_links_insert_policy" ON public.social_links;
CREATE POLICY "social_links_insert_policy" ON public.social_links
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "social_links_update_policy" ON public.social_links;
CREATE POLICY "social_links_update_policy" ON public.social_links
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "social_links_delete_policy" ON public.social_links;
CREATE POLICY "social_links_delete_policy" ON public.social_links
FOR DELETE TO authenticated USING (auth.uid() = user_id);