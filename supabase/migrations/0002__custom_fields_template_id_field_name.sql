-- Drop existing policies on custom_fields to allow schema changes
DROP POLICY IF EXISTS "Users can manage custom fields of their own contacts" ON public.custom_fields;

-- Add new column template_id
ALTER TABLE public.custom_fields
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.custom_field_templates(id) ON DELETE CASCADE;

-- Remove old column field_name
ALTER TABLE public.custom_fields
DROP COLUMN IF EXISTS field_name;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "custom_fields_select_policy" ON public.custom_fields;
DROP POLICY IF EXISTS "custom_fields_insert_policy" ON public.custom_fields;
DROP POLICY IF EXISTS "custom_fields_update_policy" ON public.custom_fields;
DROP POLICY IF EXISTS "custom_fields_delete_policy" ON public.custom_fields;

-- Recreate RLS policies for custom_fields with the new schema
CREATE POLICY "custom_fields_select_policy" ON public.custom_fields 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "custom_fields_insert_policy" ON public.custom_fields 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "custom_fields_update_policy" ON public.custom_fields 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "custom_fields_delete_policy" ON public.custom_fields 
FOR DELETE TO authenticated USING (auth.uid() = user_id);