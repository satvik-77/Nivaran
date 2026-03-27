import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  language_preference: string;
  notification_enabled: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type IssueCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  active: boolean;
};

export type Complaint = {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  photo_url: string;
  latitude: number | null;
  longitude: number | null;
  location_address: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  assigned_officer: string;
  estimated_resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CityStatus = {
  id: string;
  service_type: 'traffic' | 'air_quality' | 'water_supply' | 'power_supply';
  status: 'good' | 'moderate' | 'poor' | 'critical';
  value: string;
  description: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'complaint_update' | 'city_alert' | 'announcement';
  read: boolean;
  created_at: string;
};
