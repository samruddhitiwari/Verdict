-- VERDICT Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Validations table (cases)
CREATE TABLE IF NOT EXISTS validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Case input
  idea_description TEXT NOT NULL,
  target_user TEXT NOT NULL,
  pain_point TEXT NOT NULL,
  frequency TEXT,
  current_workaround TEXT,
  willingness_to_pay TEXT,
  
  -- Judge output (null until paid and analyzed)
  score INT CHECK (score >= 0 AND score <= 100),
  verdict TEXT CHECK (verdict IN ('SHIP', 'VALIDATE', 'KILL')),
  ai_reasoning JSONB,
  recommendations TEXT[],
  red_flags TEXT[],
  
  -- Payment gating
  is_paid BOOLEAN DEFAULT FALSE NOT NULL,
  payment_id TEXT,
  
  -- Judgment is immutable once issued
  judgment_issued_at TIMESTAMPTZ
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  validation_id UUID REFERENCES validations(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')) NOT NULL,
  dodo_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_validations_user_id ON validations(user_id);
CREATE INDEX IF NOT EXISTS idx_validations_created_at ON validations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_validation_id ON payments(validation_id);

-- Row Level Security
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Validations policies
CREATE POLICY "Users can view own validations" 
  ON validations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own validations" 
  ON validations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own validations" 
  ON validations FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" 
  ON payments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" 
  ON payments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Service role policy for webhook updates
CREATE POLICY "Service role can update payments"
  ON payments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can update validations"
  ON validations FOR UPDATE
  USING (true)
  WITH CHECK (true);
