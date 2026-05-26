SET client_encoding = 'UTF8';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

TRUNCATE TABLE
  payments, order_items, orders, cart_items, carts,
  reviews, coupons, banners, product_images, products,
  brands, categories, user_addresses, users
CASCADE;

-- ================= USERS =================
INSERT INTO users (id, username, email, password, phone, role, status, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'admin',  'admin@gmail.com', '$2b$10$hashedpassword123456', '0900000001', 'admin', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'user1',  'user1@gmail.com', '$2b$10$hashedpassword123456', '0900000002', 'user',  'active', NOW(), NOW()),
  (uuid_generate_v4(), 'user2',  'user2@gmail.com', '$2b$10$hashedpassword123456', '0900000003', 'user',  'active', NOW(), NOW()),
  (uuid_generate_v4(), 'user3',  'user3@gmail.com', '$2b$10$hashedpassword123456', '0900000004', 'user',  'active', NOW(), NOW());

-- ================= CATEGORIES =================
-- Dùng slug làm khoá tạm để products có thể JOIN đúng UUID
INSERT INTO categories (id, name, slug, description, image_url, parent_id, sort_order, is_active, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Bánh',          'banh',          'Các loại bánh ngọt và bánh snack',    NULL, NULL,  1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Kẹo',           'keo',           'Các loại kẹo ngọt',                   NULL, NULL,  2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Socola',        'socola',        'Sản phẩm socola cao cấp',             NULL, NULL,  3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Snack',         'snack',         'Đồ ăn vặt snack',                     NULL, NULL,  4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Kẹo cao su',    'keo-cao-su',    'Kẹo cao su các loại',                 NULL, NULL,  5, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Bánh quy',      'banh-quy',      'Các loại bánh quy giòn và ngọt',      NULL, NULL,  6, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Bánh kem',      'banh-kem',      'Bánh kem sinh nhật và tiệc',          NULL, NULL,  7, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Kẹo dẻo',      'keo-deo',       'Kẹo dẻo nhiều hương vị',              NULL, NULL,  8, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Kẹo caramel',  'keo-caramel',   'Kẹo caramel mềm và ngọt',             NULL, NULL,  9, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Socola đen',   'socola-den',    'Socola đen nguyên chất',              NULL, NULL, 10, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Socola sữa',   'socola-sua',    'Socola sữa thơm béo',                 NULL, NULL, 11, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Snack khoai tây','snack-khoai-tay','Snack khoai tây chiên giòn',        NULL, NULL, 12, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Snack bắp',    'snack-bap',     'Snack làm từ bắp giòn rụm',           NULL, NULL, 13, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Kẹo xốp',      'keo-xop',       'Kẹo xốp mềm, nhẹ',                   NULL, NULL, 14, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Quà vặt',      'qua-vat',       'Tổng hợp đồ ăn vặt khác',             NULL, NULL, 15, true, NOW(), NOW());

-- ================= BRANDS =================
INSERT INTO brands (id, name, slug, description, logo_url, is_active, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'KitKat',      'kitkat',      'Thanh socola wafer nổi tiếng của Nestlé',   NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Snickers',    'snickers',    'Thanh socola nhân nougat, đậu phộng',        NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'M&M''s',      'mms',         'Kẹo socola phủ đường nhiều màu',             NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Oreo',        'oreo',        'Bánh quy kẹp kem sữa nổi tiếng',            NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Pocky',       'pocky',       'Bánh que phủ socola từ Nhật Bản',            NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Pringles',    'pringles',    'Snack khoai tây dạng lon đặc trưng',         NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Toblerone',   'toblerone',   'Socola Thụy Sĩ hình tam giác',              NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Lotte',       'lotte',       'Tập đoàn bánh kẹo Hàn Quốc',               NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Glico',       'glico',       'Thương hiệu snack và bánh Nhật Bản',        NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Meiji',       'meiji',       'Socola và sữa Nhật Bản cao cấp',            NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Nestlé',      'nestle',      'Tập đoàn thực phẩm toàn cầu Thụy Sĩ',      NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Mars',        'mars',        'Thương hiệu socola và kẹo Mỹ',              NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Mentos',      'mentos',      'Kẹo ngậm mát lạnh nhiều hương vị',         NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Alpenliebe',  'alpenliebe',  'Kẹo caramel và kẹo cứng phổ biến',         NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Kinh Đô',    'kinh-do',     'Bánh kẹo Việt Nam quen thuộc',              NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Danisa',      'danisa',      'Bánh quy cao cấp Đan Mạch',                 NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Haribo',      'haribo',      'Kẹo dẻo nổi tiếng Đức',                    NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Ferrero',     'ferrero',     'Socola Ý cao cấp',                          NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Lays',        'lays',        'Snack khoai tây giòn',                      NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Orion',       'orion',       'Bánh kẹo Hàn Quốc - Việt Nam',             NULL, true, NOW(), NOW());

-- ================= COUPONS =================
INSERT INTO coupons (
  id, code, coupon_type, discount_percent, discount_amount, min_order_amount,
  max_discount_amount, usage_limit, used_count, per_user_limit, expiry_date,
  is_active, applicable_categories, applicable_products, created_at, updated_at
)
VALUES
  (uuid_generate_v4(), 'SALE10',   'PERCENT',   10.00, NULL,      100000.00, 50000.00, 100, 10, 1, NOW() + INTERVAL '30 days', true, ARRAY['snacks'], '{}', NOW(), NOW()),
  (uuid_generate_v4(), 'SAVE50K',  'FIXED',     NULL,  50000.00,  150000.00, NULL,     50,   5, 1, NOW() + INTERVAL '15 days', true, '{}',           '{}', NOW(), NOW()),
  (uuid_generate_v4(), 'FREESHIP', 'FREE_SHIP', NULL,  NULL,       50000.00, NULL,     200, 25, 1, NOW() + INTERVAL '60 days', true, '{}',           '{}', NOW(), NOW());

-- ================= PRODUCTS =================
-- Dùng CTE để JOIN slug → UUID thật, tránh hardcode string
WITH
  cat AS (SELECT id, slug FROM categories),
  brd AS (SELECT id, slug FROM brands)
INSERT INTO products (
  id, name, slug, short_description, description, sku,
  price, sale_price, cost_price, stock, image_url,
  category_id, brand_id,
  ingredients, nutrition_info,
  origin, weight, weight_unit, package_type,
  is_active, is_featured, is_best_seller, is_new,
  created_at, updated_at, average_rating, review_count
)
VALUES
-- 1
(uuid_generate_v4(), 'Bánh Oreo Original', 'banh-oreo-original', 'Bánh quy kẹp kem sữa', 'Bánh quy socola đen kẹp lớp kem sữa béo ngậy.', 'BR-ORE-001',
 35000, 32000, 20000, 200, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776455334/1_gtgszz.jpg',
 (SELECT id FROM cat WHERE slug='banh-quy'), (SELECT id FROM brd WHERE slug='oreo'),
 'Bột mì, cacao, kem sữa', '{"energy":"480kcal"}', 'USA', 133, 'g', 'Gói', true, true, true, false, NOW(), NOW(), 4.7, 5000),
-- 2
(uuid_generate_v4(), 'KitKat Chocolate 4 Finger', 'kitkat-chocolate-4-finger', 'Socola wafer giòn tan', 'Thanh socola giòn với lớp wafer đặc trưng KitKat.', 'KK-004',
 12000, 10000, 7000, 500, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456600/2_yct7eq.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='kitkat'),
 'Socola, bột mì, sữa', '{"energy":"520kcal"}', 'Japan', 45, 'g', 'Thanh', true, false, true, true, NOW(), NOW(), 4.6, 8000),
-- 3
(uuid_generate_v4(), 'Snickers Peanut Chocolate Bar', 'snickers-peanut-bar', 'Socola nhân đậu phộng', 'Socola caramel, nougat và đậu phộng giòn.', 'SN-001',
 18000, 16000, 12000, 300, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456599/3_eiwjpm.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='snickers'),
 'Đậu phộng, socola, caramel', '{"energy":"530kcal"}', 'USA', 50, 'g', 'Thanh', true, false, false, true, NOW(), NOW(), 4.5, 4200),
-- 4
(uuid_generate_v4(), 'Haribo Goldbears', 'haribo-goldbears', 'Kẹo dẻo gấu nhiều vị', 'Kẹo dẻo hình gấu nổi tiếng Đức.', 'HB-001',
 45000, 42000, 30000, 150, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456580/4_g368f4.jpg',
 (SELECT id FROM cat WHERE slug='keo-deo'), (SELECT id FROM brd WHERE slug='haribo'),
 'Gelatin, đường, hương trái cây', '{"energy":"350kcal"}', 'Germany', 200, 'g', 'Gói', true, true, false, false, NOW(), NOW(), 4.8, 3000),
-- 5
(uuid_generate_v4(), 'Pringles Original', 'pringles-original', 'Snack khoai tây dạng lon', 'Khoai tây chiên giòn đặc trưng Pringles.', 'PR-001',
 65000, 60000, 45000, 120, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456519/5_ogne7y.jpg',
 (SELECT id FROM cat WHERE slug='snack-khoai-tay'), (SELECT id FROM brd WHERE slug='pringles'),
 'Khoai tây, dầu thực vật, muối', '{"energy":"540kcal"}', 'USA', 165, 'g', 'Lon', true, true, true, false, NOW(), NOW(), 4.6, 2500),
-- 6
(uuid_generate_v4(), 'Pocky Chocolate Stick', 'pocky-chocolate-stick', 'Bánh que phủ socola', 'Bánh que giòn phủ socola Nhật Bản.', 'PK-001',
 28000, 25000, 18000, 180, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456518/6_wycqsg.jpg',
 (SELECT id FROM cat WHERE slug='snack'), (SELECT id FROM brd WHERE slug='pocky'),
 'Bột mì, socola, đường', '{"energy":"430kcal"}', 'Japan', 40, 'g', 'Hộp', true, false, true, false, NOW(), NOW(), 4.7, 6000),
-- 7
(uuid_generate_v4(), 'M&M Chocolate Candy', 'mm-chocolate-candy', 'Kẹo socola nhiều màu', 'Socola phủ đường giòn nhiều màu sắc.', 'MM-001',
 30000, 27000, 20000, 250, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456476/7_izgmur.jpg',
 (SELECT id FROM cat WHERE slug='keo'), (SELECT id FROM brd WHERE slug='mms'),
 'Socola, đường, màu thực phẩm', '{"energy":"490kcal"}', 'USA', 100, 'g', 'Gói', true, false, false, true, NOW(), NOW(), 4.6, 7000),
-- 8
(uuid_generate_v4(), 'Toblerone Milk Chocolate', 'toblerone-milk-chocolate', 'Socola tam giác Thụy Sĩ', 'Socola sữa với mật ong và hạnh nhân.', 'TBL-001',
 90000, 85000, 65000, 90, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456453/8_hcoyni.jpg',
 (SELECT id FROM cat WHERE slug='socola-sua'), (SELECT id FROM brd WHERE slug='toblerone'),
 'Socola sữa, mật ong, hạnh nhân', '{"energy":"560kcal"}', 'Switzerland', 100, 'g', 'Thanh', true, true, false, true, NOW(), NOW(), 4.9, 1500),
-- 9
(uuid_generate_v4(), 'Lotte Pepero Almond', 'lotte-pepero-almond', 'Bánh que phủ hạnh nhân', 'Bánh que socola phủ hạnh nhân giòn.', 'LT-001',
 20000, 18000, 12000, 400, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456414/9_ndpuko.jpg',
 (SELECT id FROM cat WHERE slug='snack'), (SELECT id FROM brd WHERE slug='lotte'),
 'Bột mì, socola, hạnh nhân', '{"energy":"410kcal"}', 'Korea', 32, 'g', 'Hộp', true, true, true, false, NOW(), NOW(), 4.5, 5000),
-- 10
(uuid_generate_v4(), 'Mentos Mint Fresh', 'mentos-mint-fresh', 'Kẹo ngậm bạc hà', 'Kẹo ngậm mát lạnh vị bạc hà.', 'MT-001',
 15000, 13000, 9000, 500, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456413/10_yyiunw.jpg',
 (SELECT id FROM cat WHERE slug='keo-cao-su'), (SELECT id FROM brd WHERE slug='mentos'),
 'Đường, bạc hà', '{"energy":"380kcal"}', 'Netherlands', 50, 'g', 'Gói', true, false, false, false, NOW(), NOW(), 4.4, 9000),
-- 11
(uuid_generate_v4(), 'Alpenliebe Caramel Candy', 'alpenliebe-caramel', 'Kẹo caramel ngọt mềm', 'Kẹo caramel tan chảy trong miệng.', 'AL-001',
 12000, 10000, 7000, 600, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456413/11_s9xuvx.jpg',
 (SELECT id FROM cat WHERE slug='keo-caramel'), (SELECT id FROM brd WHERE slug='alpenliebe'),
 'Đường, sữa, caramel', '{"energy":"400kcal"}', 'Germany', 40, 'g', 'Gói', true, false, false, false, NOW(), NOW(), 4.3, 8000),
-- 12
(uuid_generate_v4(), 'Kinh Đô Snack Mix', 'kinh-do-snack-mix', 'Snack tổng hợp Việt Nam', 'Snack giòn nhiều vị quen thuộc.', 'KD-001',
 25000, 22000, 15000, 350, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456412/12_wuf0yi.jpg',
 (SELECT id FROM cat WHERE slug='snack'), (SELECT id FROM brd WHERE slug='kinh-do'),
 'Bột mì, dầu ăn, gia vị', '{"energy":"450kcal"}', 'Vietnam', 60, 'g', 'Gói', true, true, true, false, NOW(), NOW(), 4.2, 12000),
-- 13
(uuid_generate_v4(), 'Ferrero Rocher Chocolate', 'ferrero-rocher', 'Socola hạt phỉ cao cấp', 'Socola Ý với nhân hạt phỉ giòn.', 'FR-001',
 120000, 110000, 85000, 80, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456410/13_svtuxl.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='ferrero'),
 'Socola, hazelnut, wafer', '{"energy":"600kcal"}', 'Italy', 200, 'g', 'Hộp', true, true, false, true, NOW(), NOW(), 4.9, 2000),
-- 14
(uuid_generate_v4(), 'Orion Choco Pie', 'orion-choco-pie', 'Bánh marshmallow socola', 'Bánh mềm kẹp marshmallow phủ socola.', 'OR-001',
 45000, 40000, 30000, 500, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456409/14_v93asi.jpg',
 (SELECT id FROM cat WHERE slug='banh'), (SELECT id FROM brd WHERE slug='orion'),
 'Bột mì, marshmallow, socola', '{"energy":"420kcal"}', 'Korea', 360, 'g', 'Hộp', true, true, true, true, NOW(), NOW(), 4.7, 15000),
-- 15
(uuid_generate_v4(), 'Bánh Quy Danisa Butter Cookies', 'banh-quy-danisa-butter-cookies', 'Bánh quy bơ truyền thống Đan Mạch', 'Hương vị bơ thơm lừng, giòn tan trong miệng.', 'BQ-DAN-454',
 185000, 175000, 130000, 100, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456408/15_gyr7x6.jpg',
 (SELECT id FROM cat WHERE slug='banh-quy'), (SELECT id FROM brd WHERE slug='danisa'),
 'Bột mì, bơ, đường, trứng', '{"energy":"500kcal","fat":"25g"}', 'Denmark', 454, 'g', 'Hộp', true, true, false, true, NOW(), NOW(), 4.8, 1200),
-- 16
(uuid_generate_v4(), 'Bánh Oreo Kẹp Kem Sữa', 'banh-oreo-kep-kem-sua', 'Bánh quy socola kẹp kem sữa', 'Xoay bánh, liếm kem, chấm sữa.', 'BQ-OREO-133',
 18000, NULL, 12000, 500, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456407/16_kfuasu.jpg',
 (SELECT id FROM cat WHERE slug='banh-quy'), (SELECT id FROM brd WHERE slug='oreo'),
 'Bột mì, đường, dầu thực vật, bột cacao', '{"sugar":"38g"}', 'Vietnam', 133, 'g', 'Gói', true, false, true, false, NOW(), NOW(), 4.5, 3500),
-- 17
(uuid_generate_v4(), 'Bánh Que Pocky Socola', 'banh-que-pocky-socola', 'Bánh que giòn phủ lớp socola', 'Sản phẩm nổi tiếng từ Glico Nhật Bản.', 'BQ-POCKY-CHO',
 22000, 20000, 15000, 300, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456406/17_j928bb.jpg',
 (SELECT id FROM cat WHERE slug='banh'), (SELECT id FROM brd WHERE slug='pocky'),
 'Bột mì, đường, cacao', '{"length":"15cm"}', 'Japan', 40, 'g', 'Hộp', true, true, false, true, NOW(), NOW(), 4.9, 2100),
-- 18
(uuid_generate_v4(), 'Kẹo Dẻo Haribo Goldbears', 'keo-deo-haribo-goldbears', 'Kẹo dẻo hình gấu nổi tiếng thế giới', 'Hương vị trái cây tự nhiên, dai ngon.', 'KE-HARI-GOLD',
 45000, NULL, 30000, 200, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456404/19_bz0jwp.jpg',
 (SELECT id FROM cat WHERE slug='keo-deo'), (SELECT id FROM brd WHERE slug='haribo'),
 'Nước ép trái cây, gelatin, đường', '{"flavor":"Mixed Fruit"}', 'Germany', 80, 'g', 'Gói', true, true, true, false, NOW(), NOW(), 4.7, 850),
-- 19
(uuid_generate_v4(), 'Kẹo Alpenliebe Caramel', 'keo-alpenliebe-caramel', 'Kẹo sữa caramen mềm ngọt', 'Hương vị sữa và caramen hòa quyện.', 'KE-ALPEN-CARA',
 15000, 12000, 8000, 1000, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456398/26_nyj2lb.jpg',
 (SELECT id FROM cat WHERE slug='keo-caramel'), (SELECT id FROM brd WHERE slug='alpenliebe'),
 'Đường, siro glucose, sữa đặc', '{"pieces":"16 viên"}', 'Vietnam', 52, 'g', 'Thỏi', true, false, false, true, NOW(), NOW(), 4.3, 1500),
-- 20
(uuid_generate_v4(), 'Kẹo Cao Su Mentos Pure Fresh', 'keo-cao-su-mentos-pure-fresh', 'Kẹo cao su không đường hương bạc hà', 'Lõi lỏng tươi mát, sảng khoái.', 'KE-MENTOS-WHITE',
 25000, NULL, 15000, 150, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456519/5_ogne7y.jpg',
 (SELECT id FROM cat WHERE slug='keo-cao-su'), (SELECT id FROM brd WHERE slug='mentos'),
 'Xylitol, sorbitol, cốt gôm', '{"sugar_free":"Yes"}', 'Vietnam', 56, 'g', 'Hũ', true, false, true, false, NOW(), NOW(), 4.6, 920),
-- 21
(uuid_generate_v4(), 'Socola KitKat 4 Thanh', 'socola-kitkat-4-thanh', 'Bánh xốp phủ socola sữa', 'Nghỉ ngơi một chút, có ngay KitKat.', 'SO-KITKAT-4F',
 15000, 13000, 9000, 400, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456403/20_roczy4.jpg',
 (SELECT id FROM cat WHERE slug='socola-sua'), (SELECT id FROM brd WHERE slug='kitkat'),
 'Đường, sữa bột, bơ cacao', '{"energy":"210kcal"}', 'Malaysia', 38, 'g', 'Thanh', true, true, false, true, NOW(), NOW(), 4.8, 5000),
-- 22
(uuid_generate_v4(), 'Socola Snickers Nhân Đậu Phộng', 'socola-snickers-dau-phong', 'Socola nhân đậu phộng và caramel', 'Giúp bạn nạp năng lượng tức thì.', 'SO-SNICKERS-50',
 20000, NULL, 14000, 350, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456402/21_rrpy7b.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='snickers'),
 'Lạc, socola sữa, caramel', '{"protein":"4g"}', 'USA', 50, 'g', 'Thanh', true, true, false, false, NOW(), NOW(), 4.7, 3200),
-- 23
(uuid_generate_v4(), 'Socola Ferrero Rocher 16 Viên', 'socola-ferrero-rocher-16', 'Socola nhân hạt dẻ cao cấp', 'Lớp vỏ giòn bọc nhân hạt dẻ tan chảy.', 'SO-FER-16',
 250000, 235000, 180000, 50, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456400/23_c0pj8q.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='ferrero'),
 'Socola sữa, hạt dẻ, dầu thực vật', '{"box_type":"Plastic"}', 'Italy', 200, 'g', 'Hộp', true, true, true, true, NOW(), NOW(), 5.0, 1100),
-- 24
(uuid_generate_v4(), 'Snack Khoai Tây Lays Classic', 'snack-khoai-tay-lays-classic', 'Snack khoai tây vị tự nhiên', 'Khoai tây thật, giòn tan.', 'SN-LAYS-CL',
 20000, NULL, 12000, 600, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456406/17_j928bb.jpg',
 (SELECT id FROM cat WHERE slug='snack-khoai-tay'), (SELECT id FROM brd WHERE slug='lays'),
 'Khoai tây, dầu thực vật, muối', '{"fat":"10g"}', 'Vietnam', 54, 'g', 'Gói', true, false, false, false, NOW(), NOW(), 4.4, 6000),
-- 25
(uuid_generate_v4(), 'Snack Khoai Tây Pringles Original', 'snack-pringles-original', 'Snack khoai tây dạng lon', 'Thiết kế lon giúp miếng bánh luôn nguyên vẹn.', 'SN-PRING-ORI',
 55000, 49000, 35000, 200, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456599/3_eiwjpm.jpg',
 (SELECT id FROM cat WHERE slug='snack-khoai-tay'), (SELECT id FROM brd WHERE slug='pringles'),
 'Bột khoai tây, dầu, bột bắp', '{"height":"20cm"}', 'USA', 107, 'g', 'Lon', true, true, false, true, NOW(), NOW(), 4.6, 2800),
-- 26
(uuid_generate_v4(), 'Bánh Meiji Hello Panda', 'banh-meiji-hello-panda', 'Bánh quy nhân kem socola', 'Hình gấu dễ thương, nhân kem đậm đà.', 'BQ-MEIJI-PANDA',
 35000, NULL, 22000, 180, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456400/23_c0pj8q.jpg',
 (SELECT id FROM cat WHERE slug='banh'), (SELECT id FROM brd WHERE slug='meiji'),
 'Bột mì, kem socola, sữa', '{"flavor":"Chocolate"}', 'Japan', 50, 'g', 'Hộp', true, false, true, false, NOW(), NOW(), 4.8, 1400),
-- 27
(uuid_generate_v4(), 'Oreo Double Cream', 'oreo-double-cream', 'Bánh Oreo nhân kem đôi', 'Bánh quy socola với lớp kem sữa nhân đôi béo ngậy.', 'OR-DC-001',
 40000, 37000, 25000, 300, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456398/26_nyj2lb.jpg',
 (SELECT id FROM cat WHERE slug='banh-quy'), (SELECT id FROM brd WHERE slug='oreo'),
 'Bột mì, cacao, kem sữa', '{"energy":"500kcal"}', 'USA', 150, 'g', 'Gói', true, true, true, false, NOW(), NOW(), 4.8, 6000),
-- 28
(uuid_generate_v4(), 'KitKat Matcha', 'kitkat-matcha', 'KitKat vị trà xanh Nhật', 'Socola KitKat vị matcha thanh mát.', 'KK-MA-001',
 15000, 13000, 9000, 400, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456401/22_nouywr.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='kitkat'),
 'Matcha, socola, bột mì', '{"energy":"510kcal"}', 'Japan', 45, 'g', 'Thanh', true, false, true, true, NOW(), NOW(), 4.7, 9000),
-- 29
(uuid_generate_v4(), 'Snickers Almond', 'snickers-almond', 'Snickers hạnh nhân', 'Socola Snickers kết hợp hạnh nhân giòn.', 'SN-AL-001',
 20000, 18000, 13000, 280, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456405/18_j1cwok.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='snickers'),
 'Hạnh nhân, socola, caramel', '{"energy":"540kcal"}', 'USA', 52, 'g', 'Thanh', true, true, false, false, NOW(), NOW(), 4.6, 3000),
-- 30
(uuid_generate_v4(), 'Haribo Sour Worms', 'haribo-sour-worms', 'Kẹo dẻo chua Haribo', 'Kẹo dẻo hình giun vị chua ngọt.', 'HB-SW-001',
 48000, 45000, 32000, 200, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456406/17_j928bb.jpg',
 (SELECT id FROM cat WHERE slug='keo-deo'), (SELECT id FROM brd WHERE slug='haribo'),
 'Gelatin, đường, acid citric', '{"energy":"360kcal"}', 'Germany', 200, 'g', 'Gói', true, true, true, false, NOW(), NOW(), 4.7, 4000),
-- 31
(uuid_generate_v4(), 'Pringles BBQ', 'pringles-bbq', 'Snack khoai tây vị BBQ', 'Khoai tây chiên vị thịt nướng BBQ.', 'PR-BBQ-001',
 70000, 65000, 50000, 150, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456519/5_ogne7y.jpg',
 (SELECT id FROM cat WHERE slug='snack-khoai-tay'), (SELECT id FROM brd WHERE slug='pringles'),
 'Khoai tây, BBQ seasoning', '{"energy":"550kcal"}', 'USA', 165, 'g', 'Lon', true, true, true, true, NOW(), NOW(), 4.5, 3500),
-- 32
(uuid_generate_v4(), 'Pocky Strawberry', 'pocky-strawberry', 'Bánh que vị dâu', 'Bánh que phủ socola dâu ngọt dịu.', 'PK-ST-001',
 30000, 27000, 19000, 220, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456407/16_kfuasu.jpg',
 (SELECT id FROM cat WHERE slug='snack'), (SELECT id FROM brd WHERE slug='pocky'),
 'Bột mì, dâu, đường', '{"energy":"420kcal"}', 'Japan', 40, 'g', 'Hộp', true, true, false, false, NOW(), NOW(), 4.6, 7000),
-- 33
(uuid_generate_v4(), 'M&M Peanut', 'mm-peanut', 'Kẹo socola đậu phộng', 'M&M nhân đậu phộng giòn.', 'MM-PN-001',
 32000, 29000, 21000, 260, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456399/24_yvhtzt.jpg',
 (SELECT id FROM cat WHERE slug='keo'), (SELECT id FROM brd WHERE slug='mms'),
 'Đậu phộng, socola', '{"energy":"500kcal"}', 'USA', 100, 'g', 'Gói', true, false, true, true, NOW(), NOW(), 4.7, 8000),
-- 34
(uuid_generate_v4(), 'Toblerone Dark', 'toblerone-dark', 'Socola đen Thụy Sĩ', 'Socola đen hạnh nhân mật ong.', 'TBL-DK-001',
 95000, 90000, 70000, 90, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456404/19_bz0jwp.jpg',
 (SELECT id FROM cat WHERE slug='socola-den'), (SELECT id FROM brd WHERE slug='toblerone'),
 'Cacao, mật ong, hạnh nhân', '{"energy":"570kcal"}', 'Switzerland', 100, 'g', 'Thanh', true, true, false, true, NOW(), NOW(), 4.8, 2000),
-- 35
(uuid_generate_v4(), 'Lotte Choco Pie Strawberry', 'lotte-choco-pie-strawberry', 'Choco Pie dâu', 'Bánh marshmallow vị dâu phủ socola.', 'LT-CP-002',
 45000, 40000, 30000, 500, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456401/22_nouywr.jpg',
 (SELECT id FROM cat WHERE slug='banh-kem'), (SELECT id FROM brd WHERE slug='lotte'),
 'Bột mì, dâu, marshmallow', '{"energy":"430kcal"}', 'Korea', 360, 'g', 'Hộp', true, true, true, false, NOW(), NOW(), 4.6, 12000),
-- 36
(uuid_generate_v4(), 'Mentos Fruit', 'mentos-fruit', 'Kẹo trái cây Mentos', 'Kẹo ngậm nhiều vị trái cây.', 'MT-FR-001',
 16000, 14000, 10000, 600, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776455334/1_gtgszz.jpg',
 (SELECT id FROM cat WHERE slug='keo-cao-su'), (SELECT id FROM brd WHERE slug='mentos'),
 'Đường, hương trái cây', '{"energy":"390kcal"}', 'Netherlands', 50, 'g', 'Gói', true, false, false, false, NOW(), NOW(), 4.3, 9000),
-- 37
(uuid_generate_v4(), 'Alpenliebe Strawberry', 'alpenliebe-strawberry', 'Kẹo caramel dâu', 'Kẹo caramel vị dâu ngọt dịu.', 'AL-ST-001',
 12000, 10000, 7000, 700, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456413/10_yyiunw.jpg',
 (SELECT id FROM cat WHERE slug='keo-caramel'), (SELECT id FROM brd WHERE slug='alpenliebe'),
 'Đường, sữa, dâu', '{"energy":"410kcal"}', 'Germany', 40, 'g', 'Gói', true, false, true, false, NOW(), NOW(), 4.4, 8500),
-- 38
(uuid_generate_v4(), 'Kinh Đô Bánh Quy Bơ', 'kinh-do-banh-quy-bo', 'Bánh quy Việt Nam', 'Bánh quy bơ giòn truyền thống.', 'KD-BQ-002',
 30000, 27000, 20000, 400, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456398/26_nyj2lb.jpg',
 (SELECT id FROM cat WHERE slug='banh-quy'), (SELECT id FROM brd WHERE slug='kinh-do'),
 'Bột mì, bơ, trứng', '{"energy":"460kcal"}', 'Vietnam', 120, 'g', 'Gói', true, true, false, false, NOW(), NOW(), 4.2, 10000),
-- 39
(uuid_generate_v4(), 'Ferrero Rondnoir', 'ferrero-rondnoir', 'Socola Ferrero đen', 'Socola đen nhân kem cacao.', 'FR-RD-001',
 130000, 120000, 90000, 70, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456397/27_rumfzd.jpg',
 (SELECT id FROM cat WHERE slug='socola-den'), (SELECT id FROM brd WHERE slug='ferrero'),
 'Cacao, socola đen', '{"energy":"610kcal"}', 'Italy', 200, 'g', 'Hộp', true, true, false, true, NOW(), NOW(), 4.9, 1800),
-- 40
(uuid_generate_v4(), 'Orion Custard Cake', 'orion-custard-cake', 'Bánh custard mềm', 'Bánh mềm nhân custard thơm béo.', 'OR-CC-001',
 50000, 45000, 32000, 450, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456406/17_j928bb.jpg',
 (SELECT id FROM cat WHERE slug='banh'), (SELECT id FROM brd WHERE slug='orion'),
 'Bột mì, trứng, custard', '{"energy":"420kcal"}', 'Korea', 300, 'g', 'Hộp', true, true, true, false, NOW(), NOW(), 4.5, 11000),
-- 41
(uuid_generate_v4(), 'Pringles Sour Cream', 'pringles-sour-cream', 'Snack vị kem chua', 'Khoai tây vị sour cream thơm béo.', 'PR-SC-001',
 68000, 63000, 48000, 140, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456407/16_kfuasu.jpg',
 (SELECT id FROM cat WHERE slug='snack-khoai-tay'), (SELECT id FROM brd WHERE slug='pringles'),
 'Khoai tây, kem chua', '{"energy":"530kcal"}', 'USA', 165, 'g', 'Lon', true, true, false, true, NOW(), NOW(), 4.6, 3200),
-- 42
(uuid_generate_v4(), 'Snickers Mini Pack', 'snickers-mini-pack', 'Gói Snickers mini', 'Nhiều thanh Snickers nhỏ tiện lợi.', 'SN-MN-001',
 45000, 42000, 30000, 300, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456599/3_eiwjpm.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='snickers'),
 'Socola, đậu phộng', '{"energy":"520kcal"}', 'USA', 150, 'g', 'Gói', true, true, true, false, NOW(), NOW(), 4.5, 5000),
-- 43
(uuid_generate_v4(), 'Haribo Cola Candy', 'haribo-cola-candy', 'Kẹo dẻo vị cola', 'Kẹo dẻo hình chai cola.', 'HB-CL-001',
 46000, 43000, 31000, 220, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456580/4_g368f4.jpg',
 (SELECT id FROM cat WHERE slug='keo-deo'), (SELECT id FROM brd WHERE slug='haribo'),
 'Gelatin, cola flavor', '{"energy":"355kcal"}', 'Germany', 200, 'g', 'Gói', true, true, false, false, NOW(), NOW(), 4.6, 3500),
-- 44
(uuid_generate_v4(), 'Pocky Cookies Cream', 'pocky-cookies-cream', 'Pocky cookies & cream', 'Bánh que vị cookies & cream.', 'PK-CC-001',
 32000, 29000, 20000, 230, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456414/9_ndpuko.jpg',
 (SELECT id FROM cat WHERE slug='snack'), (SELECT id FROM brd WHERE slug='pocky'),
 'Bột mì, cream', '{"energy":"440kcal"}', 'Japan', 40, 'g', 'Hộp', true, true, true, true, NOW(), NOW(), 4.7, 6500),
-- 45
(uuid_generate_v4(), 'M&M Crispy', 'mm-crispy', 'Kẹo M&M giòn', 'Socola giòn bên trong.', 'MM-CR-001',
 33000, 30000, 22000, 240, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456413/10_yyiunw.jpg',
 (SELECT id FROM cat WHERE slug='keo'), (SELECT id FROM brd WHERE slug='mms'),
 'Socola, gạo giòn', '{"energy":"495kcal"}', 'USA', 100, 'g', 'Gói', true, true, false, false, NOW(), NOW(), 4.6, 7200),
-- 46
(uuid_generate_v4(), 'Toblerone White', 'toblerone-white', 'Socola trắng Thụy Sĩ', 'Socola trắng mật ong hạnh nhân.', 'TBL-WH-001',
 92000, 87000, 66000, 85, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456519/5_ogne7y.jpg',
 (SELECT id FROM cat WHERE slug='socola-sua'), (SELECT id FROM brd WHERE slug='toblerone'),
 'Socola trắng, mật ong', '{"energy":"550kcal"}', 'Switzerland', 100, 'g', 'Thanh', true, true, true, false, NOW(), NOW(), 4.8, 1900),
-- 47
(uuid_generate_v4(), 'Lotte Choco Pie Banana', 'lotte-choco-pie-banana', 'Choco Pie vị chuối', 'Bánh marshmallow vị chuối.', 'LT-CP-003',
 45000, 40000, 30000, 500, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776455334/1_gtgszz.jpg',
 (SELECT id FROM cat WHERE slug='banh-kem'), (SELECT id FROM brd WHERE slug='lotte'),
 'Bột mì, chuối, marshmallow', '{"energy":"425kcal"}', 'Korea', 360, 'g', 'Hộp', true, true, false, false, NOW(), NOW(), 4.5, 10000),
-- 48
(uuid_generate_v4(), 'Mentos Tropical', 'mentos-tropical', 'Kẹo nhiệt đới', 'Kẹo vị trái cây nhiệt đới.', 'MT-TR-001',
 16000, 14000, 10000, 600, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456399/24_yvhtzt.jpg',
 (SELECT id FROM cat WHERE slug='keo-cao-su'), (SELECT id FROM brd WHERE slug='mentos'),
 'Đường, tropical flavor', '{"energy":"395kcal"}', 'Netherlands', 50, 'g', 'Gói', true, false, true, false, NOW(), NOW(), 4.4, 8800),
-- 49
(uuid_generate_v4(), 'Alpenliebe Coffee Candy', 'alpenliebe-coffee', 'Kẹo caramel cà phê', 'Kẹo vị cà phê đậm đà.', 'AL-CF-001',
 13000, 11000, 8000, 650, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456400/23_c0pj8q.jpg',
 (SELECT id FROM cat WHERE slug='keo-caramel'), (SELECT id FROM brd WHERE slug='alpenliebe'),
 'Đường, cà phê, sữa', '{"energy":"405kcal"}', 'Germany', 40, 'g', 'Gói', true, false, false, true, NOW(), NOW(), 4.5, 7800),
-- 50
(uuid_generate_v4(), 'Ferrero Collection', 'ferrero-collection', 'Hộp socola tổng hợp', 'Ferrero mix nhiều loại socola.', 'FR-CL-001',
 140000, 130000, 100000, 60, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456405/18_j1cwok.jpg',
 (SELECT id FROM cat WHERE slug='socola'), (SELECT id FROM brd WHERE slug='ferrero'),
 'Socola, hazelnut', '{"energy":"620kcal"}', 'Italy', 300, 'g', 'Hộp', true, true, false, true, NOW(), NOW(), 4.9, 2500),
-- 51
(uuid_generate_v4(), 'Orion Pie Mini', 'orion-pie-mini', 'Choco Pie mini', 'Bánh pie nhỏ tiện lợi.', 'OR-PM-001',
 30000, 27000, 20000, 500, 'https://res.cloudinary.com/dmp8j2ai5/image/upload/v1776456406/17_j928bb.jpg',
 (SELECT id FROM cat WHERE slug='banh'), (SELECT id FROM brd WHERE slug='orion'),
 'Bột mì, marshmallow', '{"energy":"410kcal"}', 'Korea', 180, 'g', 'Gói', true, true, true, false, NOW(), NOW(), 4.4, 13000);

-- ================= PRODUCT IMAGES =================
INSERT INTO product_images (id, product_id, image_url, sort_order, is_main, created_at)
SELECT
  uuid_generate_v4(),
  p.id,
  img,
  (row_number() OVER (PARTITION BY p.id ORDER BY img)) - 1,
  (row_number() OVER (PARTITION BY p.id ORDER BY img) = 1),
  NOW()
FROM products p,
LATERAL unnest(ARRAY[
  p.image_url,
  'https://picsum.photos/id/' || (200 + (abs(('x'||substr(md5(p.id::text),1,8))::bit(32)::int) % 100)) || '/600/600',
  'https://picsum.photos/id/' || (300 + (abs(('x'||substr(md5(p.id::text),1,8))::bit(32)::int) % 100)) || '/600/600',
  'https://picsum.photos/id/' || (400 + (abs(('x'||substr(md5(p.id::text),1,8))::bit(32)::int) % 100)) || '/600/600'
]) AS img;

-- ================= CARTS =================
INSERT INTO carts (id, user_id, created_at, updated_at)
SELECT uuid_generate_v4(), id, NOW(), NOW() FROM users;

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
  SELECT id, row_number() OVER (ORDER BY email) AS rn
  FROM users
  WHERE role = 'user'
)
INSERT INTO orders (
  id, user_id, coupon_id, total_amount, shipping_fee, discount_amount, final_amount,
  status, payment_status, receiver_name, receiver_phone,
  shipping_address, ward, city, note, created_at, updated_at
)
SELECT
  uuid_generate_v4(),
  ou.id,
  CASE WHEN ou.rn % 3 = 0 THEN (SELECT id FROM coupons LIMIT 1) ELSE NULL END,
  (random() * 400000 + 80000)::numeric(12,2),
  20000.00,
  CASE WHEN ou.rn % 3 = 0 THEN 50000.00 ELSE 0.00 END,
  ((random() * 400000 + 80000)::numeric(12,2) + 20000.00 - CASE WHEN ou.rn % 3 = 0 THEN 50000.00 ELSE 0.00 END),
  CASE WHEN ou.rn % 4 = 0 THEN 'CONFIRMED'::"OrderStatus" ELSE 'PENDING'::"OrderStatus" END,
  CASE WHEN ou.rn % 4 = 0 THEN 'PAID'::"PaymentStatus"    ELSE 'PENDING'::"PaymentStatus" END,
  'Nguyen Van ' || ou.rn,
  '09000000' || ou.rn,
  '123 Nguyen Trai', 'Hồ Chí Minh',
  'Giao giờ hành chính.',
  NOW() - ((ou.rn * 2) || ' days')::interval,
  NOW() - ((ou.rn * 2) || ' days')::interval
FROM order_users ou;

-- ================= ORDER ITEMS =================
INSERT INTO order_items (
  id, order_id, product_id, product_name_at_time, product_image_at_time,
  quantity, price, sale_price
)
SELECT
  uuid_generate_v4(),
  o.id, p.id, p.name, p.image_url,
  (random() * 3 + 1)::int,
  COALESCE(p.sale_price, p.price),
  p.sale_price
FROM orders o
JOIN products p ON random() < 0.25;

-- ================= PAYMENTS =================
INSERT INTO payments (
  id, order_id, payment_method, payment_status,
  transaction_code, amount, paid_at, created_at
)
SELECT
  uuid_generate_v4(),
  o.id,
  CASE WHEN o.payment_status = 'PAID' THEN 'BANKING' ELSE 'COD' END,
  o.payment_status,
  CASE WHEN o.payment_status = 'PAID' THEN 'TXN-' || substring(o.id::text FROM 1 FOR 8) ELSE NULL END,
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
  u.id, p.id, NULL,
  (floor(random() * 5) + 1)::int,
  (ARRAY[
    'Sản phẩm tuyệt vời, giao hàng nhanh!',
    'Chất lượng rất tốt, sẽ mua lại.',
    'Ngon và tươi, rất đáng khuyên dùng.',
    'Đóng gói đẹp và an toàn.',
    'Đáng tiền, rất hài lòng!',
    'Không tệ, nhưng có thể tốt hơn.',
    'Hương vị và kết cấu tuyệt vời!',
    'Giao hàng siêu nhanh, rất thích!',
    'Sản phẩm đúng như mô tả.',
    'Tốt nhưng giao hàng hơi chậm.',
    'Hương vị rất ngon, đúng chuẩn mình mong đợi.',
    'Đóng gói chắc chắn, không bị móp méo khi nhận hàng.',
    'Chất lượng ổn định, mua nhiều lần vẫn hài lòng.',
    'Ăn rất vừa miệng, không quá ngọt.',
    'Giá hợp lý so với chất lượng sản phẩm.',
    'Mùi vị thơm, ăn rất cuốn.',
    'Hàng mới, hạn sử dụng xa nên rất yên tâm.',
    'Sẽ giới thiệu cho bạn bè mua.',
    'Trải nghiệm tốt từ đặt hàng đến nhận hàng.',
    'Sản phẩm đáng tiền trong tầm giá.'
  ])[floor(random() * 20 + 1)],
  true,
  NOW() - (floor(random() * 20) || ' days')::interval
FROM products p
CROSS JOIN LATERAL (
  SELECT u.id FROM users u ORDER BY random() LIMIT (floor(random() * 2) + 2)
) u;

-- ================= BANNERS =================
INSERT INTO banners (id, description, image_url, product_id, is_active, sort_order, created_at, updated_at)
SELECT
  uuid_generate_v4(),
  'Featured banner for ' || p.name,
  p.image_url,
  p.id,
  true,
  (row_number() OVER (ORDER BY p.created_at)) - 1,
  NOW(),
  NOW()
FROM products p
ORDER BY p.created_at
LIMIT 5;