-- Enable Row Level Security on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Clients can read their own bookings
CREATE POLICY "bookings_client_select" ON bookings
  FOR SELECT USING (auth.uid() = client_id);

-- Trainers can read bookings assigned to them
CREATE POLICY "bookings_trainer_select" ON bookings
  FOR SELECT USING (
    trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  );

-- Clients can only insert bookings for themselves
CREATE POLICY "bookings_client_insert" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can update (e.g. cancel) their own bookings
CREATE POLICY "bookings_client_update" ON bookings
  FOR UPDATE USING (auth.uid() = client_id);

-- Trainers can update status of their bookings (approve/reject)
CREATE POLICY "bookings_trainer_update" ON bookings
  FOR UPDATE USING (
    trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  );

-- Enable Row Level Security on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages they sent or received
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can only send messages as themselves
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (e.g. mark as read)
CREATE POLICY "messages_update" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);
