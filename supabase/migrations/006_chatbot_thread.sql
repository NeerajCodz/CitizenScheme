-- Add chatbot_thread_id column to user_profiles for persistent Backboard chat threads
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS chatbot_thread_id TEXT DEFAULT NULL;

COMMENT ON COLUMN user_profiles.chatbot_thread_id IS 'Backboard.io thread ID for the user chatbot session';
