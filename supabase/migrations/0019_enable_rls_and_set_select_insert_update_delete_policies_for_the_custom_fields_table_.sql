ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_fields_select_policy" ON public.custom_fields;
CREATE POLICY "custom_fields_select_policy" ON public.custom_fields
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_fields_insert_policy" ON public.custom_fields;
CREATE POLICY "custom_fields_insert_policy" ON public.custom_fields
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_fields_update_policy" ON public.custom_fields;
CREATE POLICY "custom_fields_update_policy" ON public.custom_fields
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_fields_delete_policy" ON public.custom_fields;
CREATE POLICY "custom_fields_delete_policy" ON public.custom_fields
FOR DELETE TO authenticated USING (auth.uid() = user_id);