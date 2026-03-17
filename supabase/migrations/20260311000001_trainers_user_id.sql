-- ============================================================
-- GymovaFlow – Add user_id to trainers table
-- Created: 2026-03-11
-- Run this in the Supabase SQL editor after the trainer_auth migration
-- ============================================================

-- Link the trainers table back to the auth user who owns the profile.
-- This is used when admin approves a trainer application to insert the row.
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Also ensure the profile-related columns exist (safe to run even if already present).
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS clients_helped int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reviews_list jsonb DEFAULT '[]';

-- Index for fast lookup by user_id (e.g. trainer dashboard → their own row).
CREATE UNIQUE INDEX IF NOT EXISTS idx_trainers_user_id
  ON trainers (user_id)
  WHERE user_id IS NOT NULL;
