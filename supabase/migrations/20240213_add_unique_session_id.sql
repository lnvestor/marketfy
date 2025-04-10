-- Add unique constraint on session_id in chat_sessions
ALTER TABLE chat_sessions
ADD CONSTRAINT chat_sessions_session_id_key UNIQUE (session_id);
