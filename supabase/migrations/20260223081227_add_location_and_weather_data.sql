/*
  # Add Location and Real-time Data Tables

  ## Overview
  Extended database schema to support real-time location-based data including weather, 
  air quality, traffic, and user location tracking.

  ## New Tables

  ### 1. user_locations
  Track user's current and historical locations
  - id (uuid)
  - user_id (uuid, references profiles)
  - latitude (numeric)
  - longitude (numeric)
  - city_name (text)
  - address (text)
  - last_updated (timestamptz)
  - created_at (timestamptz)

  ### 2. weather_data
  Real-time weather information by city
  - id (uuid)
  - city_name (text)
  - latitude (numeric)
  - longitude (numeric)
  - temperature (numeric)
  - feels_like (numeric)
  - humidity (numeric)
  - pressure (numeric)
  - weather_condition (text)
  - description (text)
  - wind_speed (numeric)
  - clouds (numeric)
  - visibility (numeric)
  - uv_index (numeric)
  - updated_at (timestamptz)

  ### 3. air_quality_data
  Air quality index data by city
  - id (uuid)
  - city_name (text)
  - latitude (numeric)
  - longitude (numeric)
  - aqi (numeric)
  - pm25 (numeric)
  - pm10 (numeric)
  - o3 (numeric)
  - no2 (numeric)
  - so2 (numeric)
  - co (numeric)
  - status (text)
  - health_recommendation (text)
  - updated_at (timestamptz)

  ### 4. traffic_data
  Real-time traffic information
  - id (uuid)
  - city_name (text)
  - latitude (numeric)
  - longitude (numeric)
  - congestion_level (text)
  - speed (numeric)
  - free_flow_speed (numeric)
  - accidents (integer)
  - updated_at (timestamptz)

  ### 5. weather_forecast
  7-day weather forecast
  - id (uuid)
  - city_name (text)
  - forecast_date (date)
  - temperature_max (numeric)
  - temperature_min (numeric)
  - condition (text)
  - precipitation_chance (numeric)
  - created_at (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for weather/traffic/AQI data
  - User-only access for personal locations
*/

CREATE TABLE IF NOT EXISTS user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  city_name text NOT NULL,
  address text DEFAULT '',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own location"
  ON user_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location"
  ON user_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own location"
  ON user_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL UNIQUE,
  latitude numeric,
  longitude numeric,
  temperature numeric,
  feels_like numeric,
  humidity numeric,
  pressure numeric,
  weather_condition text,
  description text,
  wind_speed numeric,
  clouds numeric,
  visibility numeric,
  uv_index numeric,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weather data"
  ON weather_data FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS air_quality_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL UNIQUE,
  latitude numeric,
  longitude numeric,
  aqi numeric,
  pm25 numeric,
  pm10 numeric,
  o3 numeric,
  no2 numeric,
  so2 numeric,
  co numeric,
  status text,
  health_recommendation text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE air_quality_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view air quality data"
  ON air_quality_data FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS traffic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL UNIQUE,
  latitude numeric,
  longitude numeric,
  congestion_level text,
  speed numeric,
  free_flow_speed numeric,
  accidents integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view traffic data"
  ON traffic_data FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS weather_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL,
  forecast_date date NOT NULL,
  temperature_max numeric,
  temperature_min numeric,
  condition text,
  precipitation_chance numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(city_name, forecast_date)
);

ALTER TABLE weather_forecast ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weather forecast"
  ON weather_forecast FOR SELECT
  TO authenticated
  USING (true);