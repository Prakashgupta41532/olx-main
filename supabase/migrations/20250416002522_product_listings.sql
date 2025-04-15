-- Create product_listings table
CREATE TABLE IF NOT EXISTS product_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location TEXT NOT NULL,
  distance TEXT,
  image TEXT,
  condition TEXT,
  posted TEXT,
  verified BOOLEAN DEFAULT false,
  category_id UUID REFERENCES categories(id),
  seller_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_product_listings_updated_at
BEFORE UPDATE ON product_listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX product_listings_category_id_idx ON product_listings(category_id);
CREATE INDEX product_listings_price_idx ON product_listings(price);
CREATE INDEX product_listings_created_at_idx ON product_listings(created_at);

-- Function to insert sample data
CREATE OR REPLACE FUNCTION insert_sample_product_listings() 
RETURNS void AS $$
DECLARE
  electronics_id UUID;
  fashion_id UUID;
  sports_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO electronics_id FROM categories WHERE slug = 'electronics' LIMIT 1;
  SELECT id INTO fashion_id FROM categories WHERE slug = 'fashion' LIMIT 1;
  SELECT id INTO sports_id FROM categories WHERE slug = 'sports-equipment' LIMIT 1;
  
  -- Insert sample data
  INSERT INTO product_listings (title, price, location, distance, image, condition, posted, verified, category_id, description)
  VALUES
    ('2022 MacBook Pro M2', 1899, 'Toronto, ON', '2.3 km', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=500', 'Like New', '2 hours ago', true, electronics_id, 'Excellent condition MacBook Pro with M2 chip, 16GB RAM, and 512GB SSD.'),
    ('Canon EOS R5 Camera', 3499, 'Vancouver, BC', '1.5 km', 'https://images.unsplash.com/photo-1621520291095-aa6c7137f578?auto=format&fit=crop&q=80&w=500', 'Excellent', '5 hours ago', true, electronics_id, 'Professional camera with 45MP full-frame sensor, 8K video recording, and dual card slots.'),
    ('Canada Goose Parka', 599, 'Montreal, QC', '3.1 km', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=500', 'Good', '1 day ago', false, fashion_id, 'Warm winter parka, size M, barely used.'),
    ('iPhone 15 Pro Max', 1299, 'Calgary, AB', '0.8 km', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=500', 'Like New', '3 hours ago', true, electronics_id, '256GB model with AppleCare+, includes original box and accessories.'),
    ('Peloton Bike+', 1899, 'Ottawa, ON', '4.2 km', 'https://images.unsplash.com/photo-1591291621164-2c6367723315?auto=format&fit=crop&q=80&w=500', 'Excellent', '6 hours ago', true, sports_id, 'Barely used Peloton Bike+ with 1-year subscription included.'),
    ('PS5 Bundle with Games', 549, 'Edmonton, AB', '1.7 km', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=500', 'Good', '4 hours ago', false, electronics_id, 'PlayStation 5 disc edition with 2 controllers and 3 games.'),
    ('DJI Mavic 3 Pro Drone', 2299, 'Winnipeg, MB', '2.9 km', 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=500', 'Like New', '2 days ago', true, electronics_id, 'Professional drone with Hasselblad camera, includes extra batteries and carrying case.'),
    ('Ski Equipment Set', 799, 'Quebec City, QC', '5.3 km', 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&q=80&w=500', 'Good', '1 day ago', false, sports_id, 'Complete ski set including skis, boots, poles, and helmet.');
END;
$$ LANGUAGE plpgsql;

-- Execute the function to insert sample data
SELECT insert_sample_product_listings();

-- Drop the function after use
DROP FUNCTION insert_sample_product_listings();
