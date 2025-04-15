/*
  # Enhanced Marketplace Schema Update

  1. New Tables
    - `category_attributes`
      - Dynamic form fields for each category
    - `deals`
      - Today's deals and promotions
    - `deal_categories`
      - Deal category management
    - `analytics`
      - Platform metrics and analytics
    - `reports`
      - User reports and issues
    - `content_blocks`
      - Dynamic content management
    
  2. Changes
    - Add new columns to existing tables
    - Update category management
    - Enhanced analytics tracking
    
  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Category attributes table
CREATE TABLE IF NOT EXISTS category_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  type text NOT NULL, -- text, number, select, multiselect, boolean
  options jsonb, -- For select/multiselect types
  validation jsonb, -- Validation rules
  required boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  discount_type text NOT NULL, -- percentage, fixed_amount
  discount_value decimal NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  conditions jsonb,
  banner_image text,
  status text DEFAULT 'draft', -- draft, active, expired
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deal categories table
CREATE TABLE IF NOT EXISTS deal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value jsonb NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id),
  reported_item_type text NOT NULL, -- listing, user, message
  reported_item_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending', -- pending, investigating, resolved, dismissed
  resolved_by uuid REFERENCES profiles(id),
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- banner, card, section
  content jsonb NOT NULL,
  placement text NOT NULL,
  is_active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Add analytics columns to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS favorite_count integer DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS click_count integer DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS share_count integer DEFAULT 0;

-- Enable RLS
ALTER TABLE category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Category attributes
CREATE POLICY "Anyone can view category attributes"
  ON category_attributes FOR SELECT
  USING (true);

-- Deals
CREATE POLICY "Anyone can view active deals"
  ON deals FOR SELECT
  USING (status = 'active' AND now() BETWEEN start_date AND end_date);

-- Deal categories
CREATE POLICY "Anyone can view active deal categories"
  ON deal_categories FOR SELECT
  USING (is_active = true);

-- Analytics
CREATE POLICY "Only admins can access analytics"
  ON analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Content blocks
CREATE POLICY "Anyone can view active content blocks"
  ON content_blocks FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR now() >= start_date)
    AND (end_date IS NULL OR now() <= end_date)
  );

-- Functions

-- Function to increment listing view count
CREATE OR REPLACE FUNCTION increment_listing_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET view_count = view_count + 1
  WHERE id = NEW.id;
  
  -- Also track in analytics
  INSERT INTO analytics (metric_name, metric_value)
  VALUES (
    'listing_view',
    jsonb_build_object(
      'listing_id', NEW.id,
      'category_id', NEW.category_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track user actions
CREATE OR REPLACE FUNCTION track_user_action(
  action_name text,
  action_data jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics (metric_name, metric_value)
  VALUES (action_name, action_data);
END;
$$ LANGUAGE plpgsql;