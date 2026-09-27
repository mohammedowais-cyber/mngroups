-- Seed data for MN GROUPS Property Maintenance System

-- Properties
INSERT INTO properties (id, name, type, address, manager_name) VALUES
('p1', 'Galaxy PG', 'PG', 'Koramangala, Bengaluru', 'Deepa R.'),
('p2', 'Sunrise Residency', 'Residential', 'Andheri West, Mumbai', 'Vikram S.'),
('p3', 'Green Heights', 'Residential', 'Indiranagar, Bengaluru', 'Deepa R.'),
('p4', 'Orchid Towers', 'Commercial', 'Powai, Mumbai', 'Vikram S.')
ON CONFLICT (id) DO NOTHING;

-- Vendors
INSERT INTO vendors (id, name, phone, categories, rating, jobs_done) VALUES
('v1', 'XYZ Plumbing Services', '+91 98765 43210', '{"plumbing"}', 4.6, 58),
('v2', 'ABC Electricals', '+91 91234 56780', '{"electrical"}', 4.4, 71),
('v3', 'Royal Carpentry', '+91 99887 76655', '{"carpentry"}', 4.8, 33),
('v4', 'FreshCoat Painters', '+91 90000 11122', '{"painting"}', 4.3, 22),
('v5', 'SparkleClean Co', '+91 93456 78901', '{"cleaning"}', 4.5, 64),
('v6', 'CoolAir HVAC', '+91 97766 55443', '{"ac"}', 4.2, 19),
('v7', 'General Fix-it Crew', '+91 90909 09090', '{"civil","internet","appliances","security","other"}', 4.0, 41)
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, emoji, default_vendor_id) VALUES
('electrical', 'Electrical', '⚡', 'v2'),
('plumbing', 'Plumbing', '🔧', 'v1'),
('carpentry', 'Carpentry', '🪚', 'v3'),
('painting', 'Painting', '🎨', 'v4'),
('cleaning', 'Cleaning', '🧹', 'v5'),
('civil', 'Civil work', '🏗️', 'v7'),
('internet', 'Internet', '📶', 'v7'),
('ac', 'Air conditioning', '❄️', 'v6'),
('appliances', 'Appliances', '🔌', 'v7'),
('security', 'Security', '🛡️', 'v7'),
('other', 'Other', '📋', 'v7')
ON CONFLICT (id) DO NOTHING;

-- Tenants
INSERT INTO tenants (id, name, phone, property_id, unit) VALUES
('t1', 'Rahul Kumar', '+91 98765 12340', 'p1', 'Room 202'),
('t2', 'Neha Singh', '+91 91234 55667', 'p2', 'Flat 101'),
('t3', 'Amit Patel', '+91 99887 22110', 'p3', 'Unit 203'),
('t4', 'Priya Nair', '+91 90000 44556', 'p1', 'Room 118'),
('t5', 'Sanjay Mehta', '+91 93456 77889', 'p4', 'Flat 405')
ON CONFLICT (id) DO NOTHING;

-- Complaints (Realistic initial complaints reflecting multiple lifecycle stages)
INSERT INTO complaints (
  id, tenant_id, property_id, unit, category_id, description, status, vendor_id,
  created_at, assigned_at, started_at, completed_at, verified_at, closed_at,
  before_photos, after_photos, materials_used, completion_notes, rating, feedback
) VALUES
(
  'MC-2026-00125', 't1', 'p1', 'Room 202', 'plumbing',
  'Bathroom tap is leaking continuously, water pooling on the floor.',
  'In Progress', 'v1',
  NOW() - INTERVAL '2 days' + INTERVAL '10 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '11 hours',
  NOW() - INTERVAL '1 day' + INTERVAL '9 hours',
  NULL, NULL, NULL,
  '{}', '{}', '', '', NULL, ''
),
(
  'MC-2026-00126', 't2', 'p2', 'Flat 101', 'electrical',
  'Power socket in the living room sparks when a plug is inserted.',
  'Assigned', 'v2',
  NOW() - INTERVAL '1 day' + INTERVAL '18 hours',
  NOW() - INTERVAL '1 day' + INTERVAL '18 hours 30 minutes',
  NULL, NULL, NULL, NULL,
  '{}', '{}', '', '', NULL, ''
),
(
  'MC-2026-00127', 't3', 'p3', 'Unit 203', 'carpentry',
  'Kitchen cabinet door has come off its hinge.',
  'Completed', 'v3',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days' + INTERVAL '30 minutes',
  NOW() - INTERVAL '5 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '5 days' + INTERVAL '6 hours',
  NULL, NULL,
  '{}', '{}', 'Replaced hinge set, wood screws',
  'Hinge was stripped, replaced with a heavier-duty pair and reset the door alignment.',
  NULL, ''
),
(
  'MC-2026-00128', 't4', 'p1', 'Room 118', 'internet',
  'Wi-Fi router in the common area keeps disconnecting.',
  'Submitted', NULL,
  NOW() - INTERVAL '8 hours',
  NULL, NULL, NULL, NULL, NULL,
  '{}', '{}', '', '', NULL, ''
),
(
  'MC-2026-00129', 't5', 'p4', 'Flat 405', 'ac',
  'AC is not cooling and making a rattling noise.',
  'Closed', 'v6',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days' + INTERVAL '20 minutes',
  NOW() - INTERVAL '11 days',
  NOW() - INTERVAL '11 days' + INTERVAL '3 hours',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days',
  '{}', '{}', 'Cleaned filter, topped up refrigerant',
  'Filter was clogged and gas level was low. Cleaned and recharged the unit; cooling restored.',
  5, 'Quick and clean work, thank you.'
),
(
  'MC-2026-00130', 't1', 'p1', 'Room 202', 'cleaning',
  'Common corridor on the 2nd floor needs deep cleaning after renovation dust.',
  'Closed', 'v5',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days' + INTERVAL '15 minutes',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days' + INTERVAL '3 hours',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  '{}', '{}', 'Standard cleaning kit',
  'Deep cleaned corridor, removed dust and debris, mopped and sanitised.',
  4, 'Good job overall.'
),
(
  'MC-2026-00131', 't2', 'p2', 'Flat 101', 'painting',
  'Ceiling in the bedroom has a damp patch and peeling paint.',
  'Submitted', NULL,
  NOW() - INTERVAL '15 hours',
  NULL, NULL, NULL, NULL, NULL,
  '{}', '{}', '', '', NULL, ''
),
(
  'MC-2026-00132', 't3', 'p3', 'Unit 203', 'security',
  'Main gate CCTV camera is not recording at night.',
  'In Progress', 'v7',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '30 minutes',
  NOW() - INTERVAL '2 days',
  NULL, NULL, NULL,
  '{}', '{}', '', '', NULL, ''
),
(
  'MC-2026-00133', 't4', 'p1', 'Room 118', 'appliances',
  'Common washing machine drum is not spinning.',
  'Closed', 'v7',
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '16 days' + INTERVAL '30 minutes',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days' + INTERVAL '4 hours',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days',
  '{}', '{}', 'Replaced drive belt',
  'Drive belt had snapped; replaced it and tested a full cycle.',
  5, 'Fixed the same day, appreciated.'
),
(
  'MC-2026-00134', 't5', 'p4', 'Flat 405', 'civil',
  'Small crack appearing near the balcony door frame.',
  'Assigned', 'v7',
  NOW() - INTERVAL '1 day' + INTERVAL '12 hours',
  NOW() - INTERVAL '1 day' + INTERVAL '12 hours 30 minutes',
  NULL, NULL, NULL, NULL,
  '{}', '{}', '', '', NULL, ''
),
(
  'MC-2026-00135', 't1', 'p1', 'Room 202', 'electrical',
  'Ceiling fan makes a loud clicking noise on high speed.',
  'Closed', 'v2',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days' + INTERVAL '30 minutes',
  NOW() - INTERVAL '19 days',
  NOW() - INTERVAL '19 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days',
  '{}', '{}', 'Capacitor replacement',
  'Capacitor was faulty, replaced and balanced the fan blades.',
  4, 'Noise is gone, thanks.'
),
(
  'MC-2026-00136', 't2', 'p2', 'Flat 101', 'plumbing',
  'Kitchen sink drain is clogged and draining very slowly.',
  'Completed', 'v1',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days' + INTERVAL '30 minutes',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '2 hours',
  NULL, NULL,
  '{}', '{}', 'Drain snake, cleaning solution',
  'Cleared a heavy grease blockage in the trap and flushed the line.',
  NULL, ''
)
ON CONFLICT (id) DO NOTHING;
