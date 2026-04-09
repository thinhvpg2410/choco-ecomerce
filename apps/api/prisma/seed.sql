CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

TRUNCATE TABLE
  payments,
  order_items,
  orders,
  cart_items,
  carts,
  reviews,
  coupons,
  banners,
  product_images,
  product_variants,
  products,
  brands,
  categories,
  user_addresses,
  users
CASCADE;

-- ================= USERS =================
INSERT INTO users (
  id, username, email, password, phone, role, status, created_at, updated_at
)
VALUES
  (uuid_generate_v4(), 'admin', 'admin@gmail.com', '123456', '0900000001', 'admin', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'user1', 'user1@gmail.com', '123456', '0900000002', 'user', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'user2', 'user2@gmail.com', '123456', '0900000003', 'user', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'user3', 'user3@gmail.com', '123456', '0900000004', 'user', 'active', NOW(), NOW());

-- ================= CATEGORIES =================
INSERT INTO categories (
  id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at
)
VALUES
  ('c1c82495-2b7b-41d5-b1c0-0a534fae82f4', 'Snacks', 'snacks', 'Sweet and savory snacks.', 'https://example.com/images/categories/snacks.jpg', 1, true, NOW(), NOW()),
  ('6d4833c7-9c37-4145-a8f9-8d0f1af1a4da', 'Beverages', 'beverages', 'Refreshing drinks and beverages.', 'https://example.com/images/categories/beverages.jpg', 2, true, NOW(), NOW()),
  ('f2f2311c-2d65-4ea1-8d3d-09b9d8d0f8ed', 'Dairy', 'dairy', 'Milk, cheese, yogurt and dairy products.', 'https://example.com/images/categories/dairy.jpg', 3, true, NOW(), NOW()),
  ('fa1f0304-afc3-4f07-856a-1a1f002b88ce', 'Bakery', 'bakery', 'Fresh bread, pastries and cakes.', 'https://example.com/images/categories/bakery.jpg', 4, true, NOW(), NOW()),
  ('97de0179-9a46-4b14-90d8-57d127a4f9ea', 'Frozen Foods', 'frozen-foods', 'Ready-to-eat frozen meals and desserts.', 'https://example.com/images/categories/frozen-foods.jpg', 5, true, NOW(), NOW());

-- ================= BRANDS =================
INSERT INTO brands (
  id, name, slug, description, logo_url, is_active, created_at, updated_at
)
VALUES
  ('b8bfc78f-9313-48ed-8d76-0d2d2f6b1a75', 'ChocoDelight', 'chocodelight', 'Premium chocolates and snacks.', 'https://example.com/images/brands/chocodelight.png', true, NOW(), NOW()),
  ('d6c0a18f-0c79-4e4c-8e4b-7c20c042e0b2', 'FreshFarm', 'freshfarm', 'Natural and healthy grocery products.', 'https://example.com/images/brands/freshfarm.png', true, NOW(), NOW()),
  ('a15fb8ae-bfb3-4f7e-bb9d-aa2a97ac7fb9', 'Bakers Best', 'bakers-best', 'Fresh bakery items and pastries.', 'https://example.com/images/brands/bakers-best.png', true, NOW(), NOW()),
  ('d1f8c390-23f9-4ad5-96de-2ee5a2f9b9aa', 'CoolSip', 'coolsip', 'Refreshing beverages for every occasion.', 'https://example.com/images/brands/coolsip.png', true, NOW(), NOW()),
  ('2dffd103-84a0-4803-a8c7-0ce5f7d4a950', 'GreenLeaf', 'greenleaf', 'Organic and plant-based foods.', 'https://example.com/images/brands/greenleaf.png', true, NOW(), NOW());

-- ================= COUPONS =================
INSERT INTO coupons (
  id, code, coupon_type, discount_percent, discount_amount, min_order_amount, max_discount_amount,
  usage_limit, used_count, per_user_limit, expiry_date, is_active, applicable_categories,
  applicable_products, created_at, updated_at
)
VALUES
  (uuid_generate_v4(), 'SALE10', 'PERCENT'::"CouponType", 10.00, NULL, 100000.00, 50000.00, 100, 10, 1, NOW() + INTERVAL '30 days', true, ARRAY['snacks', 'beverages'], ARRAY[]::text[], NOW(), NOW()),
  (uuid_generate_v4(), 'SAVE50K', 'FIXED'::"CouponType", NULL, 50000.00, 150000.00, NULL, 50, 5, 1, NOW() + INTERVAL '15 days', true, ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
  (uuid_generate_v4(), 'FREESHIP', 'FREE_SHIP'::"CouponType", NULL, NULL, 50000.00, NULL, 200, 25, 1, NOW() + INTERVAL '60 days', true, ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- ================= PRODUCTS =================
WITH category_ids AS (
  SELECT id FROM categories ORDER BY sort_order
),
brand_ids AS (
  SELECT id FROM brands ORDER BY name
)
INSERT INTO products (
  id, name, slug, short_description, description, sku, price, sale_price, cost_price, stock,
  image_url, images, category_id, brand_id, ingredients, nutrition_info, origin, weight,
  weight_unit, package_type, is_active, is_featured, is_best_seller, is_new,
  average_rating, review_count, created_at, updated_at
)
SELECT
  uuid_generate_v4(),
  'Product ' || i,
  'product-' || lpad(i::text, 4, '0'),
  'Short description for product ' || i,
  'Detailed description for product ' || i || '. This seed product includes category, brand, and pricing information.',
  'SKU-' || lpad(i::text, 4, '0'),
  (random() * 300000 + 50000)::numeric(12,2),
  CASE WHEN i % 4 = 0 THEN (random() * 20000 + 20000)::numeric(12,2) ELSE NULL END,
  (random() * 20000 + 20000)::numeric(12,2),
  (random() * 200 + 20)::int,
  'https://example.com/images/products/product-' || i || '-main.jpg',
  ARRAY[
    'https://example.com/images/products/product-' || i || '-main.jpg',
    'https://example.com/images/products/product-' || i || '-1.jpg',
    'https://example.com/images/products/product-' || i || '-2.jpg'
  ],
  (SELECT id FROM category_ids OFFSET ((i - 1) % 5) LIMIT 1),
  (SELECT id FROM brand_ids OFFSET ((i - 1) % 5) LIMIT 1),
  'Ingredient list for product ' || i,
  jsonb_build_object(
    'calories', (random() * 400 + 100)::int,
    'fat', (random() * 20 + 1)::numeric(5,2),
    'protein', (random() * 15 + 1)::numeric(5,2),
    'carbs', (random() * 50 + 5)::numeric(5,2)
  ),
  CASE WHEN i % 3 = 0 THEN 'Vietnam' ELSE 'Imported' END,
  (random() * 900 + 100)::numeric(8,2),
  'g',
  CASE WHEN i % 2 = 0 THEN 'Box' ELSE 'Bag' END,
  true,
  (i % 7 = 0),
  (i % 10 = 0),
  (i > 40),
  (3.0 + (i % 5) * 0.3)::numeric(4,2),
  (random() * 30)::int,
  NOW() - ((50 - i) || ' days')::interval,
  NOW() - ((50 - i) || ' days')::interval
FROM generate_series(1, 50) AS s(i);

-- ================= PRODUCT IMAGES =================
INSERT INTO product_images (id, product_id, image_url, sort_order, is_main, created_at)
SELECT
  uuid_generate_v4(),
  p.id,
  img,
  row_number() OVER (PARTITION BY p.id ORDER BY img) - 1,
  (row_number() OVER (PARTITION BY p.id ORDER BY img) = 1),
  NOW()
FROM products p,
  unnest(ARRAY[
    p.image_url,
    'https://example.com/images/products/' || p.slug || '-alt-1.jpg',
    'https://example.com/images/products/' || p.slug || '-alt-2.jpg'
  ]) AS img;

-- ================= PRODUCT VARIANTS =================
INSERT INTO product_variants (
  id, product_id, variant_name, sku, price, sale_price, stock, weight, image_url, is_active, created_at, updated_at
)
SELECT
  uuid_generate_v4(),
  p.id,
  CASE WHEN s.i = 1 THEN 'Size M' ELSE 'Size L' END,
  p.sku || '-V' || s.i,
  p.price + (random() * 10000)::numeric(12,2),
  CASE WHEN p.sale_price IS NOT NULL THEN p.sale_price + 5000 ELSE NULL END,
  GREATEST((p.stock - 5)::int, 0),
  p.weight + 10,
  'https://example.com/images/products/' || p.slug || '-variant-' || s.i || '.jpg',
  true,
  NOW(),
  NOW()
FROM products p
JOIN generate_series(1, 2) AS s(i) ON true;

-- ================= CARTS =================
INSERT INTO carts (id, user_id, created_at, updated_at)
SELECT uuid_generate_v4(), id, NOW(), NOW()
FROM users;

-- ================= CART ITEMS =================
INSERT INTO cart_items (id, cart_id, product_id, quantity, price, created_at, updated_at)
SELECT
  uuid_generate_v4(),
  c.id,
  p.id,
  (random() * 3 + 1)::int,
  COALESCE(p.sale_price, p.price),
  NOW(),
  NOW()
FROM carts c
JOIN products p ON random() < 0.25;

-- ================= ORDERS =================
WITH order_users AS (
  SELECT id, email, row_number() OVER (ORDER BY email) AS rn FROM users WHERE role = 'user'
)
INSERT INTO orders (
  id, user_id, coupon_id, total_amount, shipping_fee, discount_amount, final_amount,
  status, payment_status, receiver_name, receiver_phone,
  shipping_address, ward, district, city, note, created_at, updated_at
)
SELECT
  uuid_generate_v4(),
  ou.id,
  CASE WHEN ou.rn % 3 = 0 THEN (SELECT id FROM coupons ORDER BY code LIMIT 1 OFFSET 0) ELSE NULL END,
  (random() * 400000 + 80000)::numeric(12,2),
  20000.00,
  CASE WHEN ou.rn % 3 = 0 THEN 50000.00 ELSE 0.00 END,
  ((random() * 400000 + 80000)::numeric(12,2) + 20000.00 - CASE WHEN ou.rn % 3 = 0 THEN 50000.00 ELSE 0.00 END),
  CASE WHEN ou.rn % 4 = 0 THEN 'CONFIRMED'::"OrderStatus" ELSE 'PENDING'::"OrderStatus" END,
  CASE WHEN ou.rn % 4 = 0 THEN 'PAID'::"PaymentStatus" ELSE 'PENDING'::"PaymentStatus" END,
  'Nguyen Van ' || ou.rn,
  '09000000' || ou.rn,
  '123 Nguyen Trai',
  'Ward 1',
  'District 5',
  'Ho Chi Minh',
  'Please deliver between 9am and 5pm.',
  NOW() - ((ou.rn * 2) || ' days')::interval,
  NOW() - ((ou.rn * 2) || ' days')::interval
FROM order_users ou;

-- ================= ORDER ITEMS =================
INSERT INTO order_items (
  id, order_id, product_id, variant_id, product_name_at_time, product_image_at_time,
  quantity, price, sale_price
)
SELECT
  uuid_generate_v4(),
  o.id,
  p.id,
  NULL,
  p.name,
  p.image_url,
  (random() * 3 + 1)::int,
  COALESCE(p.sale_price, p.price),
  p.sale_price
FROM orders o
JOIN products p ON random() < 0.25;

-- ================= PAYMENTS =================
INSERT INTO payments (
  id, order_id, payment_method, payment_status, transaction_code, amount, paid_at, created_at
)
SELECT
  uuid_generate_v4(),
  o.id,
  CASE WHEN o.payment_status = 'PAID' THEN 'BANKING' ELSE 'COD' END,
  o.payment_status,
  CASE WHEN o.payment_status = 'PAID' THEN 'TXN-' || substring(o.id from 1 for 8) ELSE NULL END,
  o.final_amount,
  CASE WHEN o.payment_status = 'PAID' THEN NOW() - INTERVAL '1 day' ELSE NULL END,
  NOW()
FROM orders o;

-- ================= REVIEWS =================
INSERT INTO reviews (
  id, user_id, product_id, order_item_id, rating, comment, is_active, created_at
)
SELECT
  uuid_generate_v4(),
  u.id,
  p.id,
  NULL,
  ((random() * 4) + 1)::int,
  'Great product, fast delivery.',
  true,
  NOW() - ((random() * 20)::int || ' days')::interval
FROM users u
JOIN products p ON random() < 0.08;

-- ================= BANNERS =================
INSERT INTO banners (
  id, description, image_url, product_id, is_active, sort_order, created_at, updated_at
)
SELECT
  uuid_generate_v4(),
  'Featured banner for ' || p.name,
  'https://example.com/images/banners/' || p.slug || '.jpg',
  p.id,
  true,
  p.rn - 1,
  NOW(),
  NOW()
FROM (
  SELECT *, row_number() OVER (ORDER BY created_at) AS rn
  FROM products
) p
WHERE p.rn <= 5;
