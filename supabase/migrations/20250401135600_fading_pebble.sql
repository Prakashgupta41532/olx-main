/*
  # Add new features to marketplace schema

  1. New Tables
    - `onboarding`
      - User onboarding information and verification documents
    - `listing_attributes`
      - Dynamic attributes for different listing categories
    - `transactions`
      - Transaction history
    - `help_articles`
      - Help and support content
    - `languages`
      - Supported languages
    - `suggested_tags`
      - Auto-suggested tags for listings
    
  2. Changes
    - Add new columns to existing tables
    - Update existing table constraints
    
  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Onboarding table
CREATE TABLE IF NOT EXISTS onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  selfie_url text,
  id_document_url text,
  status verification_status DEFAULT 'pending',
  completed_steps jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Listing attributes table
CREATE TABLE IF NOT EXISTS listing_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id),
  category_id uuid REFERENCES categories(id),
  attributes jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id),
  buyer_id uuid REFERENCES profiles(id),
  seller_id uuid REFERENCES profiles(id),
  amount decimal NOT NULL,
  status text DEFAULT 'pending',
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Help articles table
CREATE TABLE IF NOT EXISTS help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Suggested tags table
CREATE TABLE IF NOT EXISTS suggested_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  tag text NOT NULL,
  frequency integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS negotiable boolean DEFAULT true;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS condition text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS year integer;

-- Enable RLS
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggested_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Onboarding
CREATE POLICY "Users can view their own onboarding"
  ON onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
  ON onboarding FOR UPDATE
  USING (auth.uid() = user_id);

-- Listing attributes
CREATE POLICY "Anyone can view listing attributes"
  ON listing_attributes FOR SELECT
  USING (true);

CREATE POLICY "Users can update their listing attributes"
  ON listing_attributes FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT seller_id FROM listings WHERE id = listing_id
    )
  );

-- Transactions
CREATE POLICY "Users can view their transactions"
  ON transactions FOR SELECT
  USING (auth.uid() IN (buyer_id, seller_id));

-- Help articles
CREATE POLICY "Anyone can view published help articles"
  ON help_articles FOR SELECT
  USING (is_published = true);

-- Languages
CREATE POLICY "Anyone can view active languages"
  ON languages FOR SELECT
  USING (is_active = true);

-- Suggested tags
CREATE POLICY "Anyone can view suggested tags"
  ON suggested_tags FOR SELECT
  USING (true);

-- Functions

-- Function to update listing views
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-suggest tags
CREATE OR REPLACE FUNCTION suggest_tags(category_id uuid, search_term text)
RETURNS TABLE (tag text, frequency integer) AS $$
BEGIN
  RETURN QUERY
  SELECT st.tag, st.frequency
  FROM suggested_tags st
  WHERE st.category_id = $1
    AND st.tag ILIKE '%' || $2 || '%'
  ORDER BY st.frequency DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;