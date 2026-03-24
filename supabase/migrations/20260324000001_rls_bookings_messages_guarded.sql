-- Ensure launch-critical RLS policies exist for bookings and messages.
-- Uses IF NOT EXISTS and DROP/CREATE where needed so the migration is safe to re-run.

ALTER TABLE IF EXISTS bookings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY bookings_client_select ON bookings
    FOR SELECT USING (auth.uid() = client_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY bookings_trainer_select ON bookings
    FOR SELECT USING (
      trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY bookings_client_insert ON bookings
    FOR INSERT WITH CHECK (auth.uid() = client_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY messages_select ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY messages_insert ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;
