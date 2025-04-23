-- Insert admin user
INSERT INTO users (email, first_name, last_name, role, phone)
VALUES 
  ('admin@example.com', 'Admin', 'User', 'admin', '123-456-7890'),
  ('staff@example.com', 'Staff', 'User', 'staff', '123-456-7891'),
  ('customer@example.com', 'Customer', 'User', 'customer', '123-456-7892');

-- Insert availability settings (9 AM to 5 PM, Monday to Friday)
INSERT INTO availability_settings (day_of_week, start_time, end_time, is_available)
VALUES
  (1, '09:00:00', '17:00:00', TRUE), -- Monday
  (2, '09:00:00', '17:00:00', TRUE), -- Tuesday
  (3, '09:00:00', '17:00:00', TRUE), -- Wednesday
  (4, '09:00:00', '17:00:00', TRUE), -- Thursday
  (5, '09:00:00', '17:00:00', TRUE), -- Friday
  (0, '00:00:00', '00:00:00', FALSE), -- Sunday (closed)
  (6, '00:00:00', '00:00:00', FALSE); -- Saturday (closed)

-- Insert sample reservations
INSERT INTO reservations (title, description, start_time, end_time, customer_id, created_by, status)
VALUES (
  'Sample Reservation',
  'This is a sample reservation description',
  NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
  NOW() + INTERVAL '1 day' + INTERVAL '11 hours',
  (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
  (SELECT id FROM users WHERE role = 'staff' LIMIT 1),
  'confirmed'
);

-- Insert reservation details
INSERT INTO reservation_details (reservation_id, special_requests, number_of_people, additional_notes)
VALUES (
  (SELECT id FROM reservations LIMIT 1),
  'No special requests',
  2,
  'Additional notes about the reservation'
);