/*
  # Seed marketplace categories and attributes

  This migration adds:
  1. Main categories based on OLX and other marketplace platforms
  2. Category attributes for different listing types
  3. Initial deal categories
*/

-- Insert main categories
INSERT INTO categories (name, slug, icon, description, featured, order_index) VALUES
-- Vehicles
('Vehicles', 'vehicles', 'car', 'Cars, motorcycles, and other vehicles', true, 1),
('Cars', 'cars', 'car', 'New and used cars', true, 2),
('Motorcycles', 'motorcycles', 'motorcycle', 'Motorcycles and scooters', false, 3),
('Commercial Vehicles', 'commercial-vehicles', 'truck', 'Trucks, vans, and commercial vehicles', false, 4),
('Spare Parts', 'spare-parts', 'tool', 'Vehicle parts and accessories', false, 5),

-- Property
('Real Estate', 'real-estate', 'home', 'Properties for sale and rent', true, 10),
('Houses & Apartments', 'houses-apartments', 'building', 'Residential properties', true, 11),
('Commercial Property', 'commercial-property', 'store', 'Offices, retail spaces, and more', false, 12),
('Land & Plots', 'land-plots', 'map', 'Land for sale', false, 13),

-- Electronics
('Electronics & Appliances', 'electronics', 'smartphone', 'Gadgets and home appliances', true, 20),
('Mobile Phones', 'mobile-phones', 'smartphone', 'Smartphones and accessories', true, 21),
('Computers & Laptops', 'computers', 'laptop', 'PCs, laptops, and accessories', true, 22),
('TV & Audio', 'tv-audio', 'tv', 'Television and sound systems', false, 23),
('Gaming', 'gaming', 'gamepad', 'Gaming consoles and games', true, 24),
('Cameras', 'cameras', 'camera', 'Cameras and photography equipment', false, 25),

-- Fashion
('Fashion', 'fashion', 'shirt', 'Clothing and accessories', true, 30),
('Men''s Fashion', 'mens-fashion', 'user', 'Clothing for men', true, 31),
('Women''s Fashion', 'womens-fashion', 'user', 'Clothing for women', true, 32),
('Kids Fashion', 'kids-fashion', 'baby', 'Children''s clothing', false, 33),
('Watches & Accessories', 'watches-accessories', 'watch', 'Watches and fashion accessories', false, 34),

-- Home & Garden
('Home & Garden', 'home-garden', 'home', 'Furniture and home items', true, 40),
('Furniture', 'furniture', 'armchair', 'Home and office furniture', true, 41),
('Home Decor', 'home-decor', 'lamp', 'Decorative items', false, 42),
('Garden', 'garden', 'flower', 'Garden tools and plants', false, 43),

-- Sports & Hobbies
('Sports & Hobbies', 'sports-hobbies', 'dumbbell', 'Sports equipment and hobby items', true, 50),
('Sports Equipment', 'sports-equipment', 'dumbbell', 'Exercise and sports gear', true, 51),
('Musical Instruments', 'musical-instruments', 'music', 'Instruments and equipment', false, 52),
('Books & Magazines', 'books-magazines', 'book', 'Reading materials', false, 53),
('Art & Collectibles', 'art-collectibles', 'image', 'Art pieces and collectibles', false, 54),

-- Jobs & Services
('Jobs & Services', 'jobs-services', 'briefcase', 'Job listings and services', true, 60),
('Jobs', 'jobs', 'briefcase', 'Job opportunities', true, 61),
('Services', 'services', 'tool', 'Professional services', true, 62),

-- Pets & Animals
('Pets & Animals', 'pets-animals', 'dog', 'Pets and pet supplies', true, 70),
('Dogs', 'dogs', 'dog', 'Dogs for sale and adoption', true, 71),
('Cats', 'cats', 'cat', 'Cats for sale and adoption', true, 72),
('Pet Supplies', 'pet-supplies', 'package', 'Pet food and accessories', false, 73);

-- Insert category attributes
INSERT INTO category_attributes (category_id, name, type, options, required, order_index) 
SELECT id, 'Brand', 'text', null, true, 1
FROM categories WHERE slug = 'cars';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Model', 'text', null, true, 2
FROM categories WHERE slug = 'cars';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Year', 'number', jsonb_build_object('min', 1900, 'max', 2024), true, 3
FROM categories WHERE slug = 'cars';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Mileage', 'number', jsonb_build_object('min', 0), true, 4
FROM categories WHERE slug = 'cars';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Fuel Type', 'select', jsonb_build_array('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'), true, 5
FROM categories WHERE slug = 'cars';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Transmission', 'select', jsonb_build_array('Manual', 'Automatic'), true, 6
FROM categories WHERE slug = 'cars';

-- Mobile phones attributes
INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Brand', 'select', jsonb_build_array('Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Other'), true, 1
FROM categories WHERE slug = 'mobile-phones';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Model', 'text', null, true, 2
FROM categories WHERE slug = 'mobile-phones';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Storage', 'select', jsonb_build_array('16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'), true, 3
FROM categories WHERE slug = 'mobile-phones';

-- Real estate attributes
INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Property Type', 'select', jsonb_build_array('Apartment', 'House', 'Villa', 'Plot', 'Commercial'), true, 1
FROM categories WHERE slug = 'houses-apartments';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Bedrooms', 'select', jsonb_build_array('Studio', '1', '2', '3', '4', '5+'), true, 2
FROM categories WHERE slug = 'houses-apartments';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Bathrooms', 'select', jsonb_build_array('1', '2', '3', '4+'), true, 3
FROM categories WHERE slug = 'houses-apartments';

INSERT INTO category_attributes (category_id, name, type, options, required, order_index)
SELECT id, 'Furnishing', 'select', jsonb_build_array('Furnished', 'Semi-Furnished', 'Unfurnished'), true, 4
FROM categories WHERE slug = 'houses-apartments';

-- Insert deal categories
INSERT INTO deal_categories (name, description, icon, is_active) VALUES
('Flash Sale', 'Limited time deals with deep discounts', 'zap', true),
('Clearance', 'End of season clearance deals', 'tag', true),
('Bundle Deals', 'Save more when buying multiple items', 'package', true),
('Featured Deals', 'Handpicked deals from top sellers', 'star', true),
('New User Deals', 'Special offers for new users', 'user-plus', true),
('Weekend Specials', 'Special deals for the weekend', 'calendar', true),
('Category Deals', 'Deals by product category', 'grid', true),
('Local Deals', 'Deals from sellers in your area', 'map-pin', true);