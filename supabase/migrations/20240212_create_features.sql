-- Create features table
CREATE TABLE IF NOT EXISTS features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS features_user_id_idx ON features(user_id);

-- Add RLS policies
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own feature requests
CREATE POLICY "Users can view own feature requests"
    ON features
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own feature requests
CREATE POLICY "Users can insert own feature requests"
    ON features
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
