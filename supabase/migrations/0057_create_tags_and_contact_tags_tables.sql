-- Create tags table for storing custom tags with colors
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Create contact_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.contact_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(contact_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON public.contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag_id ON public.contact_tags(tag_id);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags table
CREATE POLICY "Users can view their own tags" ON public.tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" ON public.tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON public.tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON public.tags
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for contact_tags table
CREATE POLICY "Users can view contact tags for their contacts" ON public.contact_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts
            WHERE contacts.id = contact_tags.contact_id
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert contact tags for their contacts" ON public.contact_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contacts
            WHERE contacts.id = contact_tags.contact_id
            AND contacts.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM public.tags
            WHERE tags.id = contact_tags.tag_id
            AND tags.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update contact tags for their contacts" ON public.contact_tags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.contacts
            WHERE contacts.id = contact_tags.contact_id
            AND contacts.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM public.tags
            WHERE tags.id = contact_tags.tag_id
            AND tags.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete contact tags for their contacts" ON public.contact_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.contacts
            WHERE contacts.id = contact_tags.contact_id
            AND contacts.user_id = auth.uid()
        )
    );

-- Create function to get tags with contact count
CREATE OR REPLACE FUNCTION get_tags_with_contact_count(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    color TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    contact_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.name,
        t.color,
        t.user_id,
        t.created_at,
        t.updated_at,
        COUNT(ct.contact_id)::BIGINT as contact_count
    FROM public.tags t
    LEFT JOIN public.contact_tags ct ON t.id = ct.tag_id
    LEFT JOIN public.contacts c ON ct.contact_id = c.id AND c.user_id = user_uuid
    WHERE t.user_id = user_uuid
    GROUP BY t.id, t.name, t.color, t.user_id, t.created_at, t.updated_at
    ORDER BY t.name;
END;
$$;

-- Create function to get contact tags
CREATE OR REPLACE FUNCTION get_contact_tags(contact_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    color TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.name,
        t.color,
        t.user_id,
        t.created_at,
        t.updated_at
    FROM public.tags t
    INNER JOIN public.contact_tags ct ON t.id = ct.tag_id
    INNER JOIN public.contacts c ON ct.contact_id = c.id
    WHERE ct.contact_id = contact_uuid AND c.user_id = auth.uid()
    ORDER BY t.name;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();