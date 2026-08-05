-- ============================================================
-- Cardanova Spices — Row Level Security Policies (002)
-- Run AFTER 001_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_grades       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: check if the caller is an authenticated admin/owner/editor
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_owner_or_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
$$;


-- ============================================================
-- USER ROLES policies
-- ============================================================
CREATE POLICY "user_roles_select_self" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_roles_insert_owner" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_owner());

CREATE POLICY "user_roles_update_owner" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

CREATE POLICY "user_roles_delete_owner" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.is_owner());


-- ============================================================
-- SITE SETTINGS policies
-- ============================================================
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "site_settings_admin_write" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- SEO SETTINGS policies
-- ============================================================
CREATE POLICY "seo_settings_public_read" ON public.seo_settings
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "seo_settings_admin_write" ON public.seo_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- CATEGORIES policies
-- ============================================================
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "categories_admin_write" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- PRODUCTS policies
-- ============================================================
-- Public can only read published products
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT TO anon
  USING (published = TRUE);

-- Authenticated admins see all
CREATE POLICY "products_admin_read_all" ON public.products
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "products_admin_write" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- PRODUCT IMAGES, SPECIFICATIONS, GRADES policies
-- ============================================================
CREATE POLICY "product_images_public_read" ON public.product_images
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "product_images_admin_write" ON public.product_images
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_specs_public_read" ON public.product_specifications
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "product_specs_admin_write" ON public.product_specifications
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_grades_public_read" ON public.product_grades
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "product_grades_admin_write" ON public.product_grades
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- HOMEPAGE / ABOUT CONTENT policies
-- ============================================================
CREATE POLICY "homepage_content_public_read" ON public.homepage_content
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "homepage_content_admin_write" ON public.homepage_content
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "about_content_public_read" ON public.about_content
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "about_content_admin_write" ON public.about_content
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- GALLERY ITEMS policies
-- ============================================================
CREATE POLICY "gallery_items_public_read" ON public.gallery_items
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "gallery_items_admin_write" ON public.gallery_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- CERTIFICATIONS policies
-- ============================================================
CREATE POLICY "certifications_public_read" ON public.certifications
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY "certifications_admin_read_all" ON public.certifications
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "certifications_admin_write" ON public.certifications
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- TESTIMONIALS policies
-- ============================================================
CREATE POLICY "testimonials_public_read" ON public.testimonials
  FOR SELECT TO anon USING (published = TRUE);

CREATE POLICY "testimonials_admin_read_all" ON public.testimonials
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "testimonials_admin_write" ON public.testimonials
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- FAQS policies
-- ============================================================
CREATE POLICY "faqs_public_read" ON public.faqs
  FOR SELECT TO anon USING (published = TRUE);

CREATE POLICY "faqs_admin_read_all" ON public.faqs
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "faqs_admin_write" ON public.faqs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- CONTACT INFO policies
-- ============================================================
CREATE POLICY "contact_info_public_read" ON public.contact_info
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "contact_info_admin_write" ON public.contact_info
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- QUOTE REQUESTS policies
-- ============================================================
-- Anyone can submit a quote
CREATE POLICY "quote_requests_public_insert" ON public.quote_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Only admins can read all quotes
CREATE POLICY "quote_requests_admin_read" ON public.quote_requests
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Only admins can update quote status
CREATE POLICY "quote_requests_admin_update" ON public.quote_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "quote_requests_admin_delete" ON public.quote_requests
  FOR DELETE TO authenticated
  USING (public.is_owner_or_admin());
