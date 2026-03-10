# Trainer applications and role-based access

Used for: trainer signup → admin approval → trainer dashboard access and login redirect.

## Profiles table (extend existing)

Add columns so we can tell if a user is a client or an approved trainer:

| Column          | Type   | Notes |
|-----------------|--------|--------|
| `role`          | text   | `'client'` \| `'trainer'`. Default `'client'`. |
| `trainer_status`| text   | `'pending'` \| `'approved'` \| `'rejected'`. Only used when role = trainer. Nullable. |

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS trainer_status text;
```

- **Approved trainer** = `role = 'trainer'` AND `trainer_status = 'approved'`. These users are redirected to `/trainer` after login and can use the trainer dashboard.
- On trainer signup: set `role = 'trainer'`, `trainer_status = 'pending'`.
- When admin approves: set `trainer_status = 'approved'` for that user.

## Trainer applications table

Stores each trainer application so admin can review and approve. One row per applicant.

| Column            | Type    | Notes |
|------------------|---------|--------|
| `id`             | uuid    | Primary key, default gen_random_uuid(). |
| `user_id`        | uuid    | References auth.users(id). Who applied. |
| `name`           | text    | Full name. |
| `email`           | text    | Email (denormalized for admin list). |
| `phone`          | text    | Optional. |
| `location`       | text    | Optional. |
| `specializations`| jsonb   | Array of strings. |
| `certifications` | jsonb   | Array of strings. |
| `experience`     | text    | e.g. "5 years". |
| `hourly_rate`    | numeric | Optional. |
| `bio`            | text    | Optional. |
| `status`         | text    | `'pending'` \| `'approved'` \| `'rejected'`. |
| `created_at`     | timestamptz | default now(). |

```sql
CREATE TABLE IF NOT EXISTS trainer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text,
  specializations jsonb DEFAULT '[]',
  certifications jsonb DEFAULT '[]',
  experience text,
  hourly_rate numeric,
  bio text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- RLS: enable and add policies
ALTER TABLE trainer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own application"
  ON trainer_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admin panel to list all applications (uses anon key). For production, replace with a policy that restricts to admin role.
CREATE POLICY "Allow read all for admin panel"
  ON trainer_applications FOR SELECT
  USING (true);

-- Allow updates so admin can set status (approve/reject). Restrict to admin in production.
CREATE POLICY "Allow update status for admin"
  ON trainer_applications FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

When admin approves an application, the app updates `trainer_applications.status = 'approved'` and `profiles.trainer_status = 'approved'` for that `user_id`.

## Trainer availability (optional)

Trainers can log when they're available from the trainer dashboard. Stored per user:

```sql
CREATE TABLE IF NOT EXISTS trainer_availability (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  availability jsonb NOT NULL DEFAULT '{}'
);

-- RLS: users can read/update their own row
ALTER TABLE trainer_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own availability"
  ON trainer_availability FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own availability"
  ON trainer_availability FOR ALL USING (auth.uid() = user_id);
```

`availability` shape: `{ "monday": ["9:00 AM", "10:00 AM"], "tuesday": [], ... }` (keys: monday–sunday, values: array of time strings).
