-- ============================================================
-- Cardanova Spices — Supabase Schema Migration 001
-- Run this in the Supabase SQL Editor (project → SQL Editor)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search


-- ============================================================
-- 1. USER ROLES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);


-- ============================================================
-- 2. SITE SETTINGS (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name          TEXT NOT NULL DEFAULT 'Cardanova Spices LLP',
  tagline               TEXT DEFAULT 'Exporting Nature''s Finest',
  logo_url              TEXT,
  emblem_url            TEXT,
  favicon_url           TEXT,
  copyright_text        TEXT DEFAULT '© 2026 Cardanova Spices LLP. All rights reserved.',
  business_reg_number   TEXT DEFAULT '',
  gst_number            TEXT DEFAULT '',
  export_license        TEXT DEFAULT '',
  default_currency      TEXT DEFAULT 'USD',
  supported_languages   TEXT[] DEFAULT ARRAY['en'],
  whatsapp_number       TEXT DEFAULT '',
  inquiry_email         TEXT DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default row
INSERT INTO public.site_settings (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. SEO SETTINGS (global + per-page)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page              TEXT NOT NULL UNIQUE, -- 'global', 'home', 'about', 'products', 'origin', 'contact'
  meta_title        TEXT,
  meta_description  TEXT,
  og_image_url      TEXT,
  twitter_card      TEXT DEFAULT 'summary_large_image',
  canonical_url     TEXT,
  schema_markup     JSONB,
  meta_keywords     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_settings_page ON public.seo_settings(page);

-- Seed default pages
INSERT INTO public.seo_settings (page, meta_title, meta_description) VALUES
  ('global',   'Cardanova Spices — Premium Cardamom Export from Kerala, India', 'B2B spice exporter specialising in single-origin cardamom, pepper and turmeric from Idukki, Kerala.'),
  ('home',     'Cardanova Spices — Premium Cardamom from Idukki, Kerala | B2B Export', 'Single-origin premium green cardamom, pepper & turmeric from Idukki. APEDA-certified B2B spice exporter to 30+ countries.'),
  ('about',    'About Cardanova Spices — Our Story, Mission & Founders', 'Learn about Cardanova Spices LLP — founded in Idukki, Kerala. Our mission to deliver authentic premium spices to global buyers.'),
  ('products', 'Spice Catalogue — Export Grades & Specifications | Cardanova', 'Complete B2B trade catalogue: cardamom, black pepper, turmeric. MOQ 500kg. FOB/CIF pricing available.'),
  ('origin',   'Our Origin — Farm to Freight Process | Idukki Cardamom | Cardanova', 'Discover how Cardanova spices travel from mist-covered Idukki estates to global markets.'),
  ('contact',  'Contact Cardanova Spices — B2B Export Inquiries', 'Get in touch with Cardanova Spices for B2B export inquiries, pricing, and samples.')
ON CONFLICT (page) DO NOTHING;


-- ============================================================
-- 4. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_order ON public.categories(display_order);


-- ============================================================
-- 5. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  short_description   TEXT,
  long_description    TEXT,
  origin              TEXT DEFAULT 'Idukki, Kerala, India',
  category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  availability        TEXT DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'seasonal', 'on_request', 'out_of_stock')),
  featured            BOOLEAN NOT NULL DEFAULT FALSE,
  published           BOOLEAN NOT NULL DEFAULT TRUE,
  display_order       INT NOT NULL DEFAULT 0,
  export_grade        TEXT,
  hs_code             TEXT,
  packaging_info      TEXT,
  main_image_url      TEXT,
  seo_title           TEXT,
  seo_description     TEXT,
  meta_keywords       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug        ON public.products(slug);
CREATE INDEX idx_products_featured    ON public.products(featured) WHERE featured = TRUE;
CREATE INDEX idx_products_published   ON public.products(published) WHERE published = TRUE;
CREATE INDEX idx_products_category    ON public.products(category_id);
CREATE INDEX idx_products_order       ON public.products(display_order);
CREATE INDEX idx_products_name_trgm   ON public.products USING gin(name gin_trgm_ops);


-- ============================================================
-- 6. PRODUCT IMAGES (gallery per product)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  alt_text      TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_images_order   ON public.product_images(product_id, display_order);


-- ============================================================
-- 7. PRODUCT SPECIFICATIONS (key-value pairs)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_specifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  value       TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_specs_product ON public.product_specifications(product_id);


-- ============================================================
-- 8. PRODUCT GRADES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_grades (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  grade_name    TEXT NOT NULL,
  size_mm       TEXT,
  density       TEXT,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_grades_product ON public.product_grades(product_id);


-- ============================================================
-- 9. HOMEPAGE CONTENT (single row CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Hero
  hero_title              TEXT DEFAULT 'Single-Origin Cardamom & Premium Spices From Idukki',
  hero_subtitle           TEXT DEFAULT 'Cultivated in high-altitude estates of Kerala. Processed to European & Middle Eastern export standards.',
  hero_bg_image_url       TEXT,
  hero_cta_primary_text   TEXT DEFAULT 'Request B2B Export Quote',
  hero_cta_primary_url    TEXT DEFAULT '#contact',
  hero_cta_secondary_text TEXT DEFAULT 'Explore Spice Catalog',
  hero_cta_secondary_url  TEXT DEFAULT '#products',
  -- Stats
  stats                   JSONB DEFAULT '[
    {"value": "30+", "label": "Export Destinations"},
    {"value": "8.5mm+", "label": "AGEB Extra Bold Pod Size"},
    {"value": "100%", "label": "Traceable Single Origin"}
  ]'::jsonb,
  -- Why Choose Us
  why_choose_us_title     TEXT DEFAULT 'Why Choose Cardanova',
  why_choose_us_features  JSONB DEFAULT '[]'::jsonb,
  -- About preview
  about_preview_title     TEXT DEFAULT 'Our Story',
  about_preview_text      TEXT,
  -- Footer tagline
  footer_tagline          TEXT DEFAULT 'Exporting Nature''s Finest',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.homepage_content (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;


-- ============================================================
-- 10. ABOUT PAGE CONTENT (single row CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.about_content (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_story     TEXT,
  mission           TEXT,
  vision            TEXT,
  core_values       JSONB DEFAULT '[]'::jsonb,
  history           TEXT,
  ceo_name          TEXT,
  ceo_title         TEXT,
  ceo_message       TEXT,
  ceo_image_url     TEXT,
  factory_images    TEXT[] DEFAULT ARRAY[]::TEXT[],
  warehouse_images  TEXT[] DEFAULT ARRAY[]::TEXT[],
  timeline          JSONB DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.about_content (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;


-- ============================================================
-- 11. GALLERY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  folder        TEXT NOT NULL DEFAULT 'factory' CHECK (folder IN ('factory','warehouse','products','packaging','certificates','events')),
  image_url     TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_folder ON public.gallery_items(folder);
CREATE INDEX idx_gallery_order  ON public.gallery_items(display_order);


-- ============================================================
-- 12. CERTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  issuing_body  TEXT,
  description   TEXT,
  image_url     TEXT,
  pdf_url       TEXT,
  issue_date    DATE,
  expiry_date   DATE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certifications_active ON public.certifications(is_active);


-- ============================================================
-- 13. TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name   TEXT NOT NULL,
  country         TEXT,
  company         TEXT,
  review          TEXT NOT NULL,
  rating          INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  image_url       TEXT,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  published       BOOLEAN NOT NULL DEFAULT TRUE,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_testimonials_featured ON public.testimonials(featured) WHERE featured = TRUE;


-- ============================================================
-- 14. FAQs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faqs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_faqs_order ON public.faqs(display_order);


-- ============================================================
-- 15. CONTACT INFO (single row CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_info (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone             TEXT DEFAULT '',
  whatsapp          TEXT DEFAULT '',
  email             TEXT DEFAULT '',
  address           TEXT DEFAULT '',
  google_maps_url   TEXT DEFAULT '',
  google_maps_embed TEXT DEFAULT '',
  business_hours    TEXT DEFAULT 'Mon–Sat: 9:00 AM – 6:00 PM IST',
  instagram_url     TEXT DEFAULT '',
  linkedin_url      TEXT DEFAULT '',
  twitter_url       TEXT DEFAULT '',
  facebook_url      TEXT DEFAULT '',
  youtube_url       TEXT DEFAULT '',
  inquiry_email     TEXT DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.contact_info (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;


-- ============================================================
-- 16. QUOTE REQUESTS (B2B Inquiry Form)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name         TEXT NOT NULL,
  company_name      TEXT,
  country           TEXT,
  email             TEXT NOT NULL,
  phone             TEXT,
  selected_products TEXT,
  quantity_kg       TEXT,
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','contacted','closed')),
  internal_notes    TEXT,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_quote_requests_date   ON public.quote_requests(submitted_at DESC);


-- ============================================================
-- 17. UPDATED_AT auto-trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'user_roles','site_settings','seo_settings','categories','products',
    'homepage_content','about_content','gallery_items','certifications',
    'testimonials','faqs','contact_info','quote_requests'
  ] LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON public.%s
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    ', tbl, tbl);
  END LOOP;
END;
$$;
