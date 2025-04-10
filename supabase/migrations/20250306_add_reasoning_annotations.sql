-- Add reasoning and annotations columns to the chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN reasoning TEXT NULL,
ADD COLUMN annotations TEXT NULL;