ALTER TABLE public.email_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_addresses_select_policy" ON public.email_addresses;
CREATE POLICY "email_addresses_select_policy" ON public.email_addresses
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "email_addresses_insert_policy" ON public.email_addresses;
CREATE POLICY "email_addresses_insert_policy" ON public.email_addresses
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "email_addresses_update_policy" ON public.email_addresses;
CREATE POLICY "email_addresses_update_policy" ON public.email_addresses
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "email_addresses_delete_policy" ON public.email_addresses;
CREATE POLICY "email_addresses_delete_policy" ON public.email_addresses
FOR DELETE TO authenticated USING (auth.uid() = user_id);