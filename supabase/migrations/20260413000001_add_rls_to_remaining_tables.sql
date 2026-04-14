-- Enable RLS on all remaining tables that didn't have it enabled previously

-- 1. trainer_availability
ALTER TABLE IF EXISTS trainer_availability ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read on trainer_availability" ON trainer_availability FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow authenticated read/write on trainer_availability" ON trainer_availability FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. gym_locations
ALTER TABLE IF EXISTS gym_locations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read on gym_locations" ON gym_locations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow authenticated read/write on gym_locations" ON gym_locations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. trainer_locations
ALTER TABLE IF EXISTS trainer_locations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read on trainer_locations" ON trainer_locations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow authenticated read/write on trainer_locations" ON trainer_locations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. reviews
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read on reviews" ON reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow authenticated read/write on reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. profiles
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read on profiles" ON profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  -- Often users update their own profiles, or admins update profiles.
  -- To prevent breakage we allow auth users to write, but you could restrict this to (id = auth.uid()) later.
  CREATE POLICY "Allow authenticated read/write on profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. trainers / trainer_records View or Table
ALTER TABLE IF EXISTS trainer_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read on trainer_records" ON trainer_records FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow authenticated read/write on trainer_records" ON trainer_records FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 7. ai_model_configs
ALTER TABLE IF EXISTS ai_model_configs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read on ai_model_configs" ON ai_model_configs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow authenticated read/write on ai_model_configs" ON ai_model_configs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;
