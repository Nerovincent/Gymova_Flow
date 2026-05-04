-- Add explicit profile flags for onboarding and email verification state.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_details jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Backfill from auth.users so existing accounts get consistent state.
UPDATE profiles p
SET
  onboarding_completed = CASE
    WHEN au.raw_user_meta_data ? 'onboarding_completed'
      THEN COALESCE((au.raw_user_meta_data ->> 'onboarding_completed')::boolean, false)
    ELSE p.onboarding_completed
  END,
  onboarding_completed_at = CASE
    WHEN
      (au.raw_user_meta_data ? 'onboarding_completed')
      AND COALESCE((au.raw_user_meta_data ->> 'onboarding_completed')::boolean, false)
      AND p.onboarding_completed_at IS NULL
    THEN now()
    ELSE p.onboarding_completed_at
  END,
  is_verified = (au.email_confirmed_at IS NOT NULL),
  email_verified_at = COALESCE(au.email_confirmed_at, p.email_verified_at)
FROM auth.users au
WHERE au.id = p.id;
