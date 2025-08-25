-- Create ai_processing_queue table
CREATE TABLE public.ai_processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  raw_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  ai_suggestion_id UUID -- Will be linked to ai_suggestions.id after successful processing
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.ai_processing_queue ENABLE ROW LEVEL SECURITY;

-- Policies for ai_processing_queue
CREATE POLICY "Users can view their own processing queue" ON public.ai_processing_queue
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own processing queue" ON public.ai_processing_queue
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processing queue" ON public.ai_processing_queue
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own processing queue" ON public.ai_processing_queue
FOR DELETE TO authenticated USING (auth.uid() = user_id);