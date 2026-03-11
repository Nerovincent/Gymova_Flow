-- ============================================================
-- GymovaFlow – Trainer Auth & Applications Migration
-- Created: 2026-03-10
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- Extend profiles table with role + trainer_status columns
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS trainer_status text;

-- role: 'client' | 'trainer'
-- trainer_status: 'pending' | 'approved' | 'rejected' (only set when role = 'trainer')


-- ────────────────────────────────────────────────────────────
-- TABLE: trainer_applications
-- One row per trainer signup — reviewed by admin
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainer_applications (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text         NOT NULL,
  email          text         NOT NULL,
  phone          text,
  location       text,
  specializations jsonb       NOT NULL DEFAULT '[]',
  certifications  jsonb       NOT NULL DEFAULT '[]',
  experience     text,
  hourly_rate    numeric,
  bio            text,
  status         text         NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at     timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_applications_user_id
  ON trainer_applications (user_id);

CREATE INDEX IF NOT EXISTS idx_trainer_applications_status
  ON trainer_applications (status);


-- ────────────────────────────────────────────────────────────
-- RLS: trainer_applications
-- ────────────────────────────────────────────────────────────
ALTER TABLE trainer_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all applications (admin panel uses anon key).
DROP POLICY IF EXISTS "trainer_applications_select_all" ON trainer_applications;
CREATE POLICY "trainer_applications_select_all"
  ON trainer_applications FOR SELECT
  USING (true);

-- Trainers can insert their own application row.
DROP POLICY IF EXISTS "trainer_applications_insert_own" ON trainer_applications;
CREATE POLICY "trainer_applications_insert_own"
  ON trainer_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow status updates (admin approval/rejection via service role and anon key).
DROP POLICY IF EXISTS "trainer_applications_update_status" ON trainer_applications;
CREATE POLICY "trainer_applications_update_status"
  ON trainer_applications FOR UPDATE
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- RLS: profiles — allow service-role writes for trainer approval
-- ────────────────────────────────────────────────────────────
-- If RLS is already enabled on profiles, add a policy that allows
-- the admin server action (via service role, which bypasses RLS) to
-- update trainer_status. The service role key bypasses RLS entirely,
-- so no additional policy is needed — but we add a fallback for the
-- anon-key admin panel path just in case.

-- Allow updating profile rows (trainer_status approval by admin via service role).
-- The service role key bypasses RLS entirely, but this policy is a safety net
-- for any anon-key path. Drop before recreating to avoid duplicate-policy errors.
DROP POLICY IF EXISTS "profiles_update_trainer_status" ON profiles;
CREATE POLICY "profiles_update_trainer_status"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);
