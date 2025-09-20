-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow authenticated users to update their own gemini settings" ON public.user_settings;

CREATE POLICY "Allow authenticated users to update their own gemini settings"
ON public.user_settings
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);