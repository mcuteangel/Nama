ALTER TABLE public.contact_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_groups_select_policy" ON public.contact_groups;
CREATE POLICY "contact_groups_select_policy" ON public.contact_groups
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "contact_groups_insert_policy" ON public.contact_groups;
CREATE POLICY "contact_groups_insert_policy" ON public.contact_groups
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "contact_groups_update_policy" ON public.contact_groups;
CREATE POLICY "contact_groups_update_policy" ON public.contact_groups
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "contact_groups_delete_policy" ON public.contact_groups;
CREATE POLICY "contact_groups_delete_policy" ON public.contact_groups
FOR DELETE TO authenticated USING (auth.uid() = user_id);