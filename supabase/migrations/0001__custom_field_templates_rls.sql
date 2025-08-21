-- Create custom_field_templates table
CREATE TABLE public.custom_field_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., 'text', 'number', 'date', 'list'
  options TEXT[], -- For 'list' type fields
  description TEXT,
  required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.custom_field_templates ENABLE ROW LEVEL SECURITY;

-- Create secure policies for each operation
CREATE POLICY "custom_field_templates_select_policy" ON public.custom_field_templates 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "custom_field_templates_insert_policy" ON public.custom_field_templates 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "custom_field_templates_update_policy" ON public.custom_field_templates 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "custom_field_templates_delete_policy" ON public.custom_field_templates 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_custom_field_templates_updated_at
BEFORE UPDATE ON public.custom_field_templates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();