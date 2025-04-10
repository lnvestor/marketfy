-- Add usage tracking columns to the existing chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN prompt_tokens INTEGER,
ADD COLUMN completion_tokens INTEGER,
ADD COLUMN total_tokens INTEGER;