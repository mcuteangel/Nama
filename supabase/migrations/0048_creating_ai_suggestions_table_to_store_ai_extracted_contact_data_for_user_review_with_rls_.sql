-- Create ai_suggestions table
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  extracted_data JSONB NOT NULL, -- Stores the JSON output from AI
  status TEXT DEFAULT 'pending_review' NOT NULL, -- 'pending_review', 'accepted', 'discarded', 'edited'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  ai_processing_queue_id UUID REFERENCES public.ai_processing_queue(id) ON DELETE SET NULL
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own AI suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Users can insert their own AI suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Users can update their own AI suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Users can delete their own AI suggestions" ON public.ai_suggestions;

-- Policies for ai_suggestions
CREATE POLICY "Users can view their own AI suggestions" ON public.ai_suggestions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI suggestions" ON public.ai_suggestions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI suggestions" ON public.ai_suggestions
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI suggestions" ON public.ai_suggestions
FOR DELETE TO authenticated USING (auth.uid() = user_id);