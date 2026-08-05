-- ============================================================
-- Cardanova Spices — Storage Bucket Policies (003)
-- Run AFTER 001_schema.sql and 002_rls.sql
-- ============================================================

-- NOTE: Create the following buckets FIRST in Supabase Dashboard → Storage:
--   products, gallery, homepage, certificates, logos, about, testimonials
-- Or use the SQL below to create them programmatically.

-- ============================================================
-- Create Buckets (idempotent)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products',     'products',     TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('gallery',      'gallery',      TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('homepage',     'homepage',     TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('certificates', 'certificates', TRUE,  20971520, ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
  ('logos',        'logos',        TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('about',        'about',        TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('testimonials', 'testimonials', TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Storage Policies — PUBLIC READ (all buckets are public)
-- ============================================================
CREATE POLICY "products_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'products');

CREATE POLICY "gallery_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gallery');

CREATE POLICY "homepage_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'homepage');

CREATE POLICY "certificates_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'certificates');

CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'logos');

CREATE POLICY "about_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'about');

CREATE POLICY "testimonials_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'testimonials');


-- ============================================================
-- Storage Policies — ADMIN WRITE (upload / delete / update)
-- ============================================================
CREATE POLICY "products_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "products_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "gallery_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

CREATE POLICY "gallery_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());

CREATE POLICY "homepage_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'homepage' AND public.is_admin());

CREATE POLICY "homepage_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'homepage' AND public.is_admin());

CREATE POLICY "certificates_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND public.is_admin());

CREATE POLICY "certificates_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'certificates' AND public.is_admin());

CREATE POLICY "logos_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND public.is_admin());

CREATE POLICY "logos_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND public.is_admin());

CREATE POLICY "about_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'about' AND public.is_admin());

CREATE POLICY "about_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'about' AND public.is_admin());

CREATE POLICY "testimonials_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'testimonials' AND public.is_admin());

CREATE POLICY "testimonials_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'testimonials' AND public.is_admin());
