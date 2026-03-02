-- ============================================================
-- Migration 002: Merch Shop Tables
-- ============================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  price_cents  integer NOT NULL CHECK (price_cents >= 0),
  image_urls   text[] NOT NULL DEFAULT '{}',
  stock_count  integer NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  is_active    boolean NOT NULL DEFAULT true,
  created_by   uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Product variants (size + color combinations per product)
CREATE TABLE IF NOT EXISTS product_variants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size         text,          -- e.g. 'S', 'M', 'L', 'XL', 'XXL', 'One Size'
  color        text,          -- e.g. 'Black', 'White', 'Red'
  stock_count  integer NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Discount codes
CREATE TABLE IF NOT EXISTS discount_codes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  value         integer NOT NULL CHECK (value > 0),
                -- for 'percent': 1-100 (percentage points)
                -- for 'fixed': amount in cents
  max_uses      integer,       -- NULL = unlimited
  uses_count    integer NOT NULL DEFAULT 0,
  expires_at    timestamptz,   -- NULL = never expires
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id  text UNIQUE,
  customer_email            text NOT NULL,
  customer_name             text NOT NULL,
  shipping_address          jsonb NOT NULL,
                            -- { line1, line2, city, state, postal_code, country }
  subtotal_cents            integer NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents            integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents               integer NOT NULL CHECK (total_cents >= 0),
  discount_code_id          uuid REFERENCES discount_codes(id) ON DELETE SET NULL,
  status                    text NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  tracking_number           text,
  admin_notes               text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id       uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity         integer NOT NULL CHECK (quantity > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  product_snapshot jsonb NOT NULL,
                   -- { name, description, price_cents, image_url, size, color }
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
