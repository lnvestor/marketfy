-- Drop the table if it exists
DROP TABLE IF EXISTS public.message_feedback;

-- Create a table for storing chat message feedback
CREATE TABLE public.message_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  session_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accuracy INT NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (including anonymous users)
CREATE POLICY "Allow feedback insertion by anyone" 
  ON public.message_feedback 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Users can only view their own feedback
CREATE POLICY "Users can view their own feedback" 
  ON public.message_feedback 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Index for faster lookups of feedback by message
CREATE INDEX message_feedback_message_id_idx ON public.message_feedback(message_id);