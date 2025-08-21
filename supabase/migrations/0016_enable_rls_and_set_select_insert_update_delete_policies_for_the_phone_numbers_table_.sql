ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "phone_numbers_select_policy" ON public.phone_numbers;
CREATE POLICY "phone_numbers_select_policy" ON public.phone_numbers
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "phone_numbers_insert_policy" ON public.phone_numbers;
CREATE POLICY "phone_numbers_insert_policy" ON public.phone_numbers
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "phone_numbers_update_policy" ON public.phone_numbers;
CREATE POLICY "phone_numbers_update_policy" ON public.phone_numbers
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "phone_numbers_delete_policy" ON public.phone_numbers;
CREATE POLICY "phone_numbers_delete_policy" ON public.phone_numbers
FOR DELETE TO authenticated USING (auth.uid() = user_id);