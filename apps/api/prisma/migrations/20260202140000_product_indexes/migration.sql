-- Improve list/filter performance for products (name search, category filter, sort by createdAt)
CREATE INDEX IF NOT EXISTS "products_name_idx" ON "products" ("name");

CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" ("category_id");

CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products" ("created_at" DESC);
