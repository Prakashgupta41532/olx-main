/*
  # Update marketplace categories and attributes

  1. Changes
    - Add new categories if they don't exist
    - Update existing categories
    - Add category attributes
    - Add deal categories
*/

-- Function to safely insert or update categories
CREATE OR REPLACE FUNCTION upsert_category(
  p_name text,
  p_slug text,
  p_icon text,
  p_description text,
  p_featured boolean,
  p_order_index integer
) RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM categories WHERE slug = p_slug) THEN
    UPDATE categories
    SET 
      name = p_name,
      icon = p_icon,
      description = p_description,
      featured = p_featured,
      order_index = p_order_index
    WHERE slug = p_slug;
  ELSE
    INSERT INTO categories (name, slug, icon, description, featured, order_index)
    VALUES (p_name, p_slug, p_icon, p_description, p_featured, p_order_index);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Vehicles
SELECT upsert_category('Vehicles', 'vehicles', '🚗', 'Cars, motorcycles, and other vehicles', true, 1);
SELECT upsert_category('Cars', 'cars', '🚗', 'New and used cars', true, 2);
SELECT upsert_category('Motorcycles', 'motorcycles', '🏍️', 'Motorcycles and scooters', false, 3);
SELECT upsert_category('Commercial Vehicles', 'commercial-vehicles', '🚛', 'Trucks, vans, and commercial vehicles', false, 4);
SELECT upsert_category('Spare Parts', 'spare-parts', '🔧', 'Vehicle parts and accessories', false, 5);

-- Property
SELECT upsert_category('Real Estate', 'real-estate', '🏠', 'Properties for sale and rent', true, 10);
SELECT upsert_category('Houses & Apartments', 'houses-apartments', '🏘️', 'Residential properties', true, 11);
SELECT upsert_category('Commercial Property', 'commercial-property', '🏢', 'Offices, retail spaces, and more', false, 12);
SELECT upsert_category('Land & Plots', 'land-plots', '🗺️', 'Land for sale', false, 13);

-- Electronics
SELECT upsert_category('Electronics & Appliances', 'electronics', '📱', 'Gadgets and home appliances', true, 20);
SELECT upsert_category('Mobile Phones', 'mobile-phones', '📱', 'Smartphones and accessories', true, 21);
SELECT upsert_category('Computers & Laptops', 'computers', '💻', 'PCs, laptops, and accessories', true, 22);
SELECT upsert_category('TV & Audio', 'tv-audio', '📺', 'Television and sound systems', false, 23);
SELECT upsert_category('Gaming', 'gaming', '🎮', 'Gaming consoles and games', true, 24);
SELECT upsert_category('Cameras', 'cameras', '📸', 'Cameras and photography equipment', false, 25);

-- Fashion
SELECT upsert_category('Fashion', 'fashion', '👕', 'Clothing and accessories', true, 30);
SELECT upsert_category('Men''s Fashion', 'mens-fashion', '👔', 'Clothing for men', true, 31);
SELECT upsert_category('Women''s Fashion', 'womens-fashion', '👗', 'Clothing for women', true, 32);
SELECT upsert_category('Kids Fashion', 'kids-fashion', '🧸', 'Children''s clothing', false, 33);
SELECT upsert_category('Watches & Accessories', 'watches-accessories', '⌚', 'Watches and fashion accessories', false, 34);

-- Home & Garden
SELECT upsert_category('Home & Garden', 'home-garden', '🏡', 'Furniture and home items', true, 40);
SELECT upsert_category('Furniture', 'furniture', '🛋️', 'Home and office furniture', true, 41);
SELECT upsert_category('Home Decor', 'home-decor', '🎭', 'Decorative items', false, 42);
SELECT upsert_category('Garden', 'garden', '🌺', 'Garden tools and plants', false, 43);

-- Sports & Hobbies
SELECT upsert_category('Sports & Hobbies', 'sports-hobbies', '⚽', 'Sports equipment and hobby items', true, 50);
SELECT upsert_category('Sports Equipment', 'sports-equipment', '🏋️', 'Exercise and sports gear', true, 51);
SELECT upsert_category('Musical Instruments', 'musical-instruments', '🎸', 'Instruments and equipment', false, 52);
SELECT upsert_category('Books & Magazines', 'books-magazines', '📚', 'Reading materials', false, 53);
SELECT upsert_category('Art & Collectibles', 'art-collectibles', '🎨', 'Art pieces and collectibles', false, 54);

-- Jobs & Services
SELECT upsert_category('Jobs & Services', 'jobs-services', '💼', 'Job listings and services', true, 60);
SELECT upsert_category('Jobs', 'jobs', '💼', 'Job opportunities', true, 61);
SELECT upsert_category('Services', 'services', '🛠️', 'Professional services', true, 62);

-- Pets & Animals
SELECT upsert_category('Pets & Animals', 'pets-animals', '🐕', 'Pets and pet supplies', true, 70);
SELECT upsert_category('Dogs', 'dogs', '🐕', 'Dogs for sale and adoption', true, 71);
SELECT upsert_category('Cats', 'cats', '🐈', 'Cats for sale and adoption', true, 72);
SELECT upsert_category('Pet Supplies', 'pet-supplies', '🦴', 'Pet food and accessories', false, 73);

-- Mobile Phones & Tablets
SELECT upsert_category('Tablets', 'tablets', '📱', 'iPads and Android tablets', true, 81);
SELECT upsert_category('Mobile Accessories', 'mobile-accessories', '🔌', 'Cases, chargers, and more', false, 82);

-- Electronics & Appliances
SELECT upsert_category('Laptops', 'laptops', '💻', 'All types of laptops', true, 90);
SELECT upsert_category('Desktop Computers', 'desktop-computers', '🖥️', 'Desktop PCs and accessories', false, 91);
SELECT upsert_category('Computer Accessories', 'computer-accessories', '🖱️', 'Keyboards, mice, and more', false, 92);
SELECT upsert_category('TVs', 'tvs', '📺', 'LED, LCD, and Smart TVs', true, 93);
SELECT upsert_category('Kitchen Appliances', 'kitchen-appliances', '🍳', 'Refrigerators, microwaves, etc', false, 94);
SELECT upsert_category('Cameras & Lenses', 'cameras-lenses', '📸', 'Digital cameras and accessories', true, 95);

-- Beauty & Personal Care
SELECT upsert_category('Beauty', 'beauty', '💄', 'Makeup and cosmetics', true, 100);
SELECT upsert_category('Personal Care', 'personal-care', '🧴', 'Skincare and grooming', false, 101);
SELECT upsert_category('Health & Wellness', 'health-wellness', '🧘', 'Fitness and wellness products', false, 102);

-- Function to safely insert category attributes
CREATE OR REPLACE FUNCTION upsert_category_attribute(
  p_category_slug text,
  p_name text,
  p_type text,
  p_options jsonb,
  p_required boolean,
  p_order_index integer
) RETURNS void AS $$
DECLARE
  v_category_id uuid;
BEGIN
  SELECT id INTO v_category_id FROM categories WHERE slug = p_category_slug;
  
  IF v_category_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM category_attributes 
      WHERE category_id = v_category_id AND name = p_name
    ) THEN
      UPDATE category_attributes
      SET 
        type = p_type,
        options = p_options,
        required = p_required,
        order_index = p_order_index
      WHERE category_id = v_category_id AND name = p_name;
    ELSE
      INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
      VALUES (v_category_id, p_name, p_type, p_options, p_required, p_order_index);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Cars attributes
SELECT upsert_category_attribute('cars', 'Brand', 'text', null, true, 1);
SELECT upsert_category_attribute('cars', 'Model', 'text', null, true, 2);
SELECT upsert_category_attribute('cars', 'Year', 'number', '{"min": 1900, "max": 2024}', true, 3);
SELECT upsert_category_attribute('cars', 'Mileage', 'number', '{"min": 0}', true, 4);
SELECT upsert_category_attribute('cars', 'Fuel Type', 'select', '["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"]', true, 5);
SELECT upsert_category_attribute('cars', 'Transmission', 'select', '["Manual", "Automatic"]', true, 6);

-- Mobile phones attributes
SELECT upsert_category_attribute('mobile-phones', 'Brand', 'select', '["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Other"]', true, 1);
SELECT upsert_category_attribute('mobile-phones', 'Model', 'text', null, true, 2);
SELECT upsert_category_attribute('mobile-phones', 'Storage', 'select', '["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"]', true, 3);

-- Real estate attributes
SELECT upsert_category_attribute('houses-apartments', 'Property Type', 'select', '["Apartment", "House", "Villa", "Plot", "Commercial"]', true, 1);
SELECT upsert_category_attribute('houses-apartments', 'Bedrooms', 'select', '["Studio", "1", "2", "3", "4", "5+"]', true, 2);
SELECT upsert_category_attribute('houses-apartments', 'Bathrooms', 'select', '["1", "2", "3", "4+"]', true, 3);
SELECT upsert_category_attribute('houses-apartments', 'Furnishing', 'select', '["Furnished", "Semi-Furnished", "Unfurnished"]', true, 4);

-- Function to safely insert deal categories
CREATE OR REPLACE FUNCTION upsert_deal_category(
  p_name text,
  p_description text,
  p_icon text,
  p_is_active boolean
) RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM deal_categories WHERE name = p_name) THEN
    UPDATE deal_categories
    SET 
      description = p_description,
      icon = p_icon,
      is_active = p_is_active
    WHERE name = p_name;
  ELSE
    INSERT INTO deal_categories (name, description, icon, is_active)
    VALUES (p_name, p_description, p_icon, p_is_active);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Deal categories
SELECT upsert_deal_category('Flash Sale', 'Limited time deals with deep discounts', '⚡', true);
SELECT upsert_deal_category('Clearance', 'End of season clearance deals', '🏷️', true);
SELECT upsert_deal_category('Bundle Deals', 'Save more when buying multiple items', '📦', true);
SELECT upsert_deal_category('Featured Deals', 'Handpicked deals from top sellers', '⭐', true);
SELECT upsert_deal_category('New User Deals', 'Special offers for new users', '👤', true);
SELECT upsert_deal_category('Weekend Specials', 'Special deals for the weekend', '📅', true);
SELECT upsert_deal_category('Category Deals', 'Deals by product category', '📱', true);
SELECT upsert_deal_category('Local Deals', 'Deals from sellers in your area', '📍', true);

-- Clean up functions
DROP FUNCTION IF EXISTS upsert_category;
DROP FUNCTION IF EXISTS upsert_category_attribute;
DROP FUNCTION IF EXISTS upsert_deal_category;