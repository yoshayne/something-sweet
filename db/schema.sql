-- Something Sweet by Erica — Postgres schema (converted from D1/SQLite)
--
-- Type-mapping decisions (see migration spec §6):
--   * Booleans  -> INTEGER (0/1)            — code writes/reads 0/1 directly
--   * Money     -> DOUBLE PRECISION         — returns JS numbers like SQLite REAL
--   * Dates     -> TEXT                     — app stores/reads ISO strings verbatim
--   * Auto-inc  -> SERIAL PRIMARY KEY       — sequences reset after seeding

CREATE TABLE orders (
  id                 SERIAL PRIMARY KEY,
  customer_name      TEXT,
  customer_email     TEXT,
  customer_phone     TEXT,
  product_type       TEXT,
  flavor             TEXT,
  size               TEXT,
  quantity           INTEGER,
  occasion           TEXT,
  pickup_date        TEXT,
  pickup_time        TEXT,
  is_delivery        INTEGER,
  delivery_address   TEXT,
  special_requests   TEXT,
  status             TEXT,
  total_amount       DOUBLE PRECISION,
  deposit_amount     DOUBLE PRECISION,
  notes              TEXT,
  inspiration_links  TEXT,
  inspiration_images TEXT,
  created_at         TEXT DEFAULT (now()::text),
  updated_at         TEXT DEFAULT (now()::text)
);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

CREATE TABLE invoices (
  id                       SERIAL PRIMARY KEY,
  order_id                 INTEGER,
  invoice_number           TEXT,
  customer_name            TEXT,
  customer_email           TEXT,
  subtotal                 DOUBLE PRECISION,
  tax                      DOUBLE PRECISION,
  total                    DOUBLE PRECISION,
  status                   TEXT,
  due_date                 TEXT,
  paid_at                  TEXT,
  stripe_payment_intent_id TEXT,
  notes                    TEXT,
  created_at               TEXT DEFAULT (now()::text),
  updated_at               TEXT DEFAULT (now()::text)
);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

CREATE TABLE invoice_items (
  id          SERIAL PRIMARY KEY,
  invoice_id  INTEGER,
  description TEXT,
  quantity    INTEGER,
  unit_price  DOUBLE PRECISION,
  amount      DOUBLE PRECISION,
  created_at  TEXT DEFAULT (now()::text),
  updated_at  TEXT DEFAULT (now()::text)
);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE TABLE gallery_images (
  id           SERIAL PRIMARY KEY,
  title        TEXT,
  category     TEXT,
  description  TEXT,
  r2_key       TEXT,
  filename     TEXT,
  content_type TEXT,
  size         INTEGER,
  is_featured  INTEGER,
  created_at   TEXT DEFAULT (now()::text),
  updated_at   TEXT DEFAULT (now()::text)
);
CREATE INDEX idx_gallery_images_category ON gallery_images(category);
CREATE INDEX idx_gallery_images_featured ON gallery_images(is_featured);

CREATE TABLE settings (
  id                    SERIAL PRIMARY KEY,
  business_name         TEXT,
  tagline               TEXT,
  owner_name            TEXT,
  email                 TEXT,
  phone                 TEXT,
  address               TEXT,
  city                  TEXT,
  state                 TEXT,
  zip                   TEXT,
  instagram_url         TEXT,
  facebook_url          TEXT,
  tiktok_url            TEXT,
  pinterest_url         TEXT,
  hours_monday          TEXT,
  hours_tuesday         TEXT,
  hours_wednesday       TEXT,
  hours_thursday        TEXT,
  hours_friday          TEXT,
  hours_saturday        TEXT,
  hours_sunday          TEXT,
  min_order_notice_days INTEGER,
  is_accepting_orders   INTEGER,
  order_message         TEXT,
  tax_rate              DOUBLE PRECISION,
  created_at            TEXT DEFAULT (now()::text),
  updated_at            TEXT DEFAULT (now()::text)
);

CREATE TABLE site_images (
  id           SERIAL PRIMARY KEY,
  location     TEXT NOT NULL,
  title        TEXT,
  description  TEXT,
  r2_key       TEXT,
  filename     TEXT,
  content_type TEXT,
  size         INTEGER,
  created_at   TEXT DEFAULT (now()::text),
  updated_at   TEXT DEFAULT (now()::text)
);
CREATE INDEX idx_site_images_location ON site_images(location);

CREATE TABLE page_content (
  id            SERIAL PRIMARY KEY,
  content_key   TEXT NOT NULL UNIQUE,
  content_value TEXT,
  created_at    TEXT DEFAULT (now()::text),
  updated_at    TEXT DEFAULT (now()::text)
);
CREATE INDEX idx_page_content_key ON page_content(content_key);

CREATE TABLE hidden_gallery_items (
  id         SERIAL PRIMARY KEY,
  item_id    TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (now()::text),
  updated_at TEXT DEFAULT (now()::text)
);

CREATE TABLE subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  is_active  INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (now()::text),
  updated_at TEXT DEFAULT (now()::text)
);
