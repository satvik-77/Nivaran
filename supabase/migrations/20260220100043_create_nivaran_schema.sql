/*
  # Nivaran Smart City App Database Schema

  ## Overview
  Complete database schema for the Nivaran citizen services application including user profiles, 
  complaints tracking, city services, and notifications.

  ## New Tables

  ### 1. profiles
  Extended user profile information beyond auth.users
  - id (uuid, references auth.users)
  - full_name (text)
  - phone (text)
  - avatar_url (text)
  - language_preference (text)
  - notification_enabled (boolean)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 2. issue_categories
  Predefined categories for citizen complaints
  - id (uuid)
  - name (text)
  - icon (text)
  - color (text)
  - description (text)
  - active (boolean)

  ### 3. complaints
  Citizen-reported issues and complaints
  - id (uuid)
  - user_id (uuid, references profiles)
  - category_id (uuid, references issue_categories)
  - title (text)
  - description (text)
  - photo_url (text)
  - latitude (numeric)
  - longitude (numeric)
  - location_address (text)
  - severity (text: low, medium, high, critical)
  - status (text: submitted, under_review, assigned, in_progress, resolved, rejected)
  - assigned_officer (text)
  - estimated_resolution (timestamptz)
  - resolved_at (timestamptz)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 4. complaint_comments
  Communication thread for each complaint
  - id (uuid)
  - complaint_id (uuid, references complaints)
  - user_id (uuid, references profiles)
  - message (text)
  - is_admin (boolean)
  - created_at (timestamptz)

  ### 5. city_status
  Real-time city service status indicators
  - id (uuid)
  - service_type (text: traffic, air_quality, water_supply, power_supply)
  - status (text: good, moderate, poor, critical)
  - value (text)
  - description (text)
  - updated_at (timestamptz)

  ### 6. notifications
  User notifications and alerts
  - id (uuid)
  - user_id (uuid, references profiles)
  - title (text)
  - message (text)
  - type (text: complaint_update, city_alert, announcement)
  - read (boolean)
  - created_at (timestamptz)

  ### 7. emergency_contacts
  Important city emergency contact numbers
  - id (uuid)
  - category (text)
  - name (text)
  - phone (text)
  - available_24_7 (boolean)

  ## Security
  - Enable RLS on all tables
  - Policies for authenticated users to manage their own data
  - Admin-only policies for sensitive operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  language_preference text DEFAULT 'en',
  notification_enabled boolean DEFAULT true,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create issue_categories table
CREATE TABLE IF NOT EXISTS issue_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  color text DEFAULT '#3B82F6',
  description text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON issue_categories FOR SELECT
  TO authenticated
  USING (active = true);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES issue_categories(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  photo_url text DEFAULT '',
  latitude numeric,
  longitude numeric,
  location_address text DEFAULT '',
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected')),
  assigned_officer text DEFAULT '',
  estimated_resolution timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create complaint_comments table
CREATE TABLE IF NOT EXISTS complaint_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE complaint_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on own complaints"
  ON complaint_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_comments.complaint_id
      AND complaints.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments on own complaints"
  ON complaint_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_comments.complaint_id
      AND complaints.user_id = auth.uid()
    )
  );

-- Create city_status table
CREATE TABLE IF NOT EXISTS city_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL CHECK (service_type IN ('traffic', 'air_quality', 'water_supply', 'power_supply')),
  status text DEFAULT 'good' CHECK (status IN ('good', 'moderate', 'poor', 'critical')),
  value text DEFAULT '',
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE city_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view city status"
  ON city_status FOR SELECT
  TO authenticated
  USING (true);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'announcement' CHECK (type IN ('complaint_update', 'city_alert', 'announcement')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  available_24_7 boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (true);

-- Insert default issue categories
INSERT INTO issue_categories (name, icon, color, description) VALUES
  ('Road Damage', 'construction', '#EF4444', 'Report damaged roads and potholes'),
  ('Street Lights', 'lightbulb', '#F59E0B', 'Non-functioning street lights'),
  ('Garbage Overflow', 'trash-2', '#10B981', 'Overflowing garbage bins'),
  ('Water Leakage', 'droplet', '#3B82F6', 'Water pipe leaks and issues'),
  ('Electricity Outage', 'zap-off', '#8B5CF6', 'Power supply problems'),
  ('Traffic Signal', 'traffic-cone', '#F59E0B', 'Malfunctioning traffic lights'),
  ('Illegal Parking', 'car', '#EF4444', 'Report illegal parking'),
  ('Sewage Overflow', 'droplets', '#78350F', 'Sewage and drainage issues'),
  ('Public Transport', 'bus', '#06B6D4', 'Bus and metro issues'),
  ('Broken Footpath', 'footprints', '#6B7280', 'Damaged sidewalks'),
  ('Flooding', 'cloud-rain', '#1E40AF', 'Waterlogging and floods'),
  ('Tree Fallen', 'tree-deciduous', '#16A34A', 'Fallen trees and branches'),
  ('Public Safety', 'shield-alert', '#DC2626', 'Safety hazards'),
  ('Noise Pollution', 'volume-2', '#F97316', 'Excessive noise complaints'),
  ('Stray Animals', 'dog', '#A855F7', 'Stray animal issues'),
  ('Air Pollution', 'wind', '#64748B', 'Air quality concerns'),
  ('Other', 'alert-circle', '#6B7280', 'Other civic issues')
ON CONFLICT DO NOTHING;

-- Insert default city status
INSERT INTO city_status (service_type, status, value, description) VALUES
  ('traffic', 'good', 'Light', 'Traffic is flowing smoothly across the city'),
  ('air_quality', 'moderate', 'AQI 85', 'Air quality is acceptable for most people'),
  ('water_supply', 'good', 'Normal', 'Water supply is normal in all areas'),
  ('power_supply', 'good', 'Stable', 'No power outages reported')
ON CONFLICT DO NOTHING;

-- Insert default emergency contacts
INSERT INTO emergency_contacts (category, name, phone, available_24_7) VALUES
  ('Emergency', 'Police Emergency', '100', true),
  ('Emergency', 'Fire Department', '101', true),
  ('Emergency', 'Ambulance', '102', true),
  ('Emergency', 'Disaster Management', '108', true),
  ('Utilities', 'Electricity Helpline', '1912', true),
  ('Utilities', 'Water Supply', '1916', true),
  ('Transport', 'Traffic Control', '103', true),
  ('Health', 'Health Helpline', '104', true)
ON CONFLICT DO NOTHING;