-- Insert sample categories
INSERT INTO public.categories (id, name, slug, description) VALUES
  (uuid_generate_v4(), 'Electronics', 'electronics', 'Electronic devices and gadgets'),
  (uuid_generate_v4(), 'Clothing', 'clothing', 'Fashion and apparel'),
  (uuid_generate_v4(), 'Home & Garden', 'home-garden', 'Home improvement and garden supplies'),
  (uuid_generate_v4(), 'Sports & Fitness', 'sports-fitness', 'Sports equipment and fitness gear'),
  (uuid_generate_v4(), 'Books', 'books', 'Books and educational materials')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample discount codes
INSERT INTO public.discount_codes (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, valid_until) VALUES
  ('WELCOME10', '10% off for new customers', 'percentage', 10.00, 50.00, 100, NOW() + INTERVAL '30 days'),
  ('SAVE20', '$20 off orders over $100', 'fixed_amount', 20.00, 100.00, 50, NOW() + INTERVAL '14 days'),
  ('FREESHIP', 'Free shipping on orders over $75', 'fixed_amount', 10.00, 75.00, NULL, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;
