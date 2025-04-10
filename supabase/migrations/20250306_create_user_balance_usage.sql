-- Create user_balance table to track available credits
CREATE TABLE public.user_balance (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Unique constraint to ensure one balance record per user
  CONSTRAINT user_balance_user_id_unique UNIQUE (user_id)
);

-- Create user_token_usage table to track all token usage
CREATE TABLE public.user_token_usage (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  prompt_cost NUMERIC(10, 6) NOT NULL DEFAULT 0,
  completion_cost NUMERIC(10, 6) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for improved query performance
CREATE INDEX user_balance_user_id_idx ON public.user_balance (user_id);
CREATE INDEX user_token_usage_user_id_idx ON public.user_token_usage (user_id);
CREATE INDEX user_token_usage_created_at_idx ON public.user_token_usage (created_at);

-- Enable row level security
ALTER TABLE public.user_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_token_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own balance" 
  ON public.user_balance
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own token usage" 
  ON public.user_token_usage
  FOR SELECT
  USING (user_id = auth.uid());

-- Create function to add balance to a user account
CREATE OR REPLACE FUNCTION public.add_user_balance(
  p_user_id UUID,
  p_amount NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance NUMERIC;
BEGIN
  -- Insert or update balance
  INSERT INTO public.user_balance (
    user_id,
    balance,
    updated_at
  )
  VALUES (
    p_user_id,
    p_amount,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_balance.balance + p_amount,
    updated_at = now()
  RETURNING balance INTO v_new_balance;
  
  RETURN v_new_balance;
END;
$$;

-- Create function to track token usage and deduct from balance
CREATE OR REPLACE FUNCTION public.deduct_token_usage(
  p_user_id UUID,
  p_prompt_tokens INTEGER,
  p_completion_tokens INTEGER,
  p_prompt_cost NUMERIC,
  p_completion_cost NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_tokens INTEGER;
  v_total_cost NUMERIC;
  v_remaining_balance NUMERIC;
BEGIN
  -- Calculate totals
  v_total_tokens := p_prompt_tokens + p_completion_tokens;
  v_total_cost := p_prompt_cost + p_completion_cost;
  
  -- Record token usage
  INSERT INTO public.user_token_usage (
    user_id,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    prompt_cost,
    completion_cost,
    total_cost
  )
  VALUES (
    p_user_id,
    p_prompt_tokens,
    p_completion_tokens,
    v_total_tokens,
    p_prompt_cost,
    p_completion_cost,
    v_total_cost
  );
  
  -- Deduct from balance
  UPDATE public.user_balance
  SET 
    balance = balance - v_total_cost,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_remaining_balance;
  
  RETURN v_remaining_balance;
END;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.user_balance TO authenticated;
GRANT SELECT ON public.user_token_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_token_usage TO authenticated;