-- ============================================================
-- GymovaFlow – Core Schema Migration
-- Created: 2026-03-09
-- Run this in the Supabase SQL editor (or via supabase db push)
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- TABLE 1: trainer_availability
-- Stores the weekly time slots when a trainer is bookable
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainer_availability (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id    bigint      NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week   integer     NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time    time        NOT NULL,
  end_time      time        NOT NULL,
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ta_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_trainer_availability_trainer_id
  ON trainer_availability (trainer_id);

CREATE INDEX IF NOT EXISTS idx_trainer_availability_day
  ON trainer_availability (trainer_id, day_of_week);


-- ────────────────────────────────────────────────────────────
-- TABLE 2: bookings
-- Connects a client to a trainer for a specific session
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  trainer_id    bigint      NOT NULL REFERENCES trainers(id) ON DELETE RESTRICT,
  booking_date  date        NOT NULL,
  start_time    time        NOT NULL,
  end_time      time        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending',
  goal_note     text,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT bookings_status_check
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  CONSTRAINT bookings_time_order
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id
  ON bookings (client_id);

CREATE INDEX IF NOT EXISTS idx_bookings_trainer_id
  ON bookings (trainer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_date
  ON bookings (booking_date);

CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON bookings (status);


-- ────────────────────────────────────────────────────────────
-- TABLE 3: gym_locations
-- Physical gyms or workout venues on the platform
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym_locations (
  id          uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text           NOT NULL,
  address     text,
  city        text,
  province    text,
  country     text,
  latitude    numeric(9, 6),
  longitude   numeric(9, 6),
  created_at  timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gym_locations_city
  ON gym_locations (city);

CREATE INDEX IF NOT EXISTS idx_gym_locations_country
  ON gym_locations (country);


-- ────────────────────────────────────────────────────────────
-- TABLE 4: trainer_locations
-- Many-to-many: trainers ↔ gym_locations
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainer_locations (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       bigint      NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  gym_location_id  uuid        NOT NULL REFERENCES gym_locations(id) ON DELETE CASCADE,
  is_primary       boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT trainer_locations_unique UNIQUE (trainer_id, gym_location_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_locations_trainer_id
  ON trainer_locations (trainer_id);

CREATE INDEX IF NOT EXISTS idx_trainer_locations_gym_id
  ON trainer_locations (gym_location_id);


-- ────────────────────────────────────────────────────────────
-- TABLE 5: messages
-- In-platform chat tied optionally to a booking
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id  uuid        REFERENCES bookings(id) ON DELETE SET NULL,
  content     text        NOT NULL,
  is_read     boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT messages_no_self_message CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON messages (sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_id
  ON messages (receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_booking_id
  ON messages (booking_id);

-- Efficient inbox/thread queries: fetch conversation between two users
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages (sender_id, receiver_id, created_at DESC);


-- ────────────────────────────────────────────────────────────
-- TABLE 6: client_goals
-- Onboarding data used for AI trainer recommendations
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_goals (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  primary_goal             text,
  experience_level         text,
  preferred_training_style text,
  workout_days_per_week    integer     CHECK (workout_days_per_week >= 1 AND workout_days_per_week <= 7),
  injuries_limitations     text,
  notes                    text,
  created_at               timestamptz NOT NULL DEFAULT now(),

  -- One active goals record per client; insert a new row to track history
  CONSTRAINT client_goals_unique_client UNIQUE (client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_goals_client_id
  ON client_goals (client_id);


-- ────────────────────────────────────────────────────────────
-- TABLE 7: reviews
-- Post-session ratings left by clients for trainers
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id  bigint      NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  rating      integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- One review per booking to prevent duplicate submissions
  CONSTRAINT reviews_unique_booking UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id
  ON reviews (booking_id);

CREATE INDEX IF NOT EXISTS idx_reviews_client_id
  ON reviews (client_id);

CREATE INDEX IF NOT EXISTS idx_reviews_trainer_id
  ON reviews (trainer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_rating
  ON reviews (trainer_id, rating);
