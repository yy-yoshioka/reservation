-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- 1. Users can view their own profile
CREATE POLICY user_read_own_profile ON users
  FOR SELECT USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY user_update_own_profile ON users
  FOR UPDATE USING (auth.uid() = id);

-- 3. Admins can view all users
CREATE POLICY admin_read_all_users ON users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- 4. Admins can update all users
CREATE POLICY admin_update_all_users ON users
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for reservations table
-- 1. Customers can view their own reservations
CREATE POLICY customer_read_own_reservations ON reservations
  FOR SELECT USING (
    auth.uid() = customer_id
  );

-- 2. Customers can create their own reservations
CREATE POLICY customer_create_own_reservations ON reservations
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    auth.uid() = created_by
  );

-- 3. Customers can update their own reservations
CREATE POLICY customer_update_own_reservations ON reservations
  FOR UPDATE USING (
    auth.uid() = customer_id
  );

-- 4. Customers can delete their own reservations
CREATE POLICY customer_delete_own_reservations ON reservations
  FOR DELETE USING (
    auth.uid() = customer_id
  );

-- 5. Staff can view all reservations
CREATE POLICY staff_read_all_reservations ON reservations
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'staff' OR auth.jwt() ->> 'role' = 'admin'
  );

-- 6. Staff can create reservations for any customer
CREATE POLICY staff_create_reservations ON reservations
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'staff' OR auth.jwt() ->> 'role' = 'admin'
  );

-- 7. Staff can only update reservations they created
CREATE POLICY staff_update_own_reservations ON reservations
  FOR UPDATE USING (
    auth.uid() = created_by AND
    auth.jwt() ->> 'role' = 'staff'
  );

-- 8. Admin can update any reservation
CREATE POLICY admin_update_all_reservations ON reservations
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- 9. Staff can only delete reservations they created
CREATE POLICY staff_delete_own_reservations ON reservations
  FOR DELETE USING (
    auth.uid() = created_by AND
    auth.jwt() ->> 'role' = 'staff'
  );

-- 10. Admin can delete any reservation
CREATE POLICY admin_delete_all_reservations ON reservations
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for reservation_details table
-- 1. Policies should follow the same access pattern as the reservations table
-- Users can view details of their own reservations
CREATE POLICY user_read_own_reservation_details ON reservation_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE id = reservation_details.reservation_id AND customer_id = auth.uid()
    )
  );

-- Staff can view all reservation details
CREATE POLICY staff_read_all_reservation_details ON reservation_details
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'staff' OR auth.jwt() ->> 'role' = 'admin'
  );

-- Users can update details of their own reservations
CREATE POLICY user_update_own_reservation_details ON reservation_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE id = reservation_details.reservation_id AND customer_id = auth.uid()
    )
  );

-- Staff can update details of reservations they created
CREATE POLICY staff_update_own_reservation_details ON reservation_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE id = reservation_details.reservation_id AND created_by = auth.uid()
    ) AND auth.jwt() ->> 'role' = 'staff'
  );

-- Admin can update any reservation details
CREATE POLICY admin_update_all_reservation_details ON reservation_details
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for availability_settings table
-- Only admins can view and modify availability settings
CREATE POLICY admin_read_availability_settings ON availability_settings
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY admin_insert_availability_settings ON availability_settings
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY admin_update_availability_settings ON availability_settings
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY admin_delete_availability_settings ON availability_settings
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Public can view availability settings (for booking page)
CREATE POLICY public_read_availability_settings ON availability_settings
  FOR SELECT USING (true);