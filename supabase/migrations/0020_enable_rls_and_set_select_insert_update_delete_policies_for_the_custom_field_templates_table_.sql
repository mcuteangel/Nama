ALTER TABLE public.custom_field_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_field_templates_select_policy" ON public.custom_field_templates;
CREATE POLICY "custom_field_templates_select_policy" ON public.custom_field_templates
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_field_templates_insert_policy" ON public.custom_field_templates;
CREATE POLICY "custom_field_templates_insert_policy" ON public.custom_field_templates
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_field_templates_update_policy" ON public.custom_field_templates;
CREATE POLICY "custom_field_templates_update_policy" ON public.custom_field_templates
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_field_templates_delete_policy" ON public.custom_field_templates;
CREATE POLICY "custom_field_templates_delete_policy" ON public.custom_field_templates
FOR DELETE TO authenticated USING (auth.uid() = user_id);