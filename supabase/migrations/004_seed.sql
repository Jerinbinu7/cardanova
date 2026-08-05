-- ============================================================
-- Cardanova Spices — Seed Data (004)
-- Run AFTER 001_schema.sql, 002_rls.sql, 003_storage.sql
-- ============================================================

-- ============================================================
-- CATEGORIES seed
-- ============================================================
INSERT INTO public.categories (id, name, slug, description, display_order) VALUES
  (uuid_generate_v4(), 'Green Cardamom', 'green-cardamom', 'Premium single-origin green cardamom from Idukki, Kerala. Available in multiple grades.', 1),
  (uuid_generate_v4(), 'Black Pepper', 'black-pepper', 'Malabar and Tellicherry black pepper with high piperine content.', 2),
  (uuid_generate_v4(), 'Turmeric', 'turmeric', 'High-curcumin Alleppey turmeric fingers and powder.', 3)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- PRODUCTS seed (using category subquery for FK)
-- ============================================================
WITH cat_cardamom AS (SELECT id FROM public.categories WHERE slug = 'green-cardamom' LIMIT 1),
     cat_pepper   AS (SELECT id FROM public.categories WHERE slug = 'black-pepper'   LIMIT 1),
     cat_turmeric AS (SELECT id FROM public.categories WHERE slug = 'turmeric'       LIMIT 1)
INSERT INTO public.products (id, name, slug, short_description, long_description, origin, category_id, featured, published, display_order, export_grade, hs_code, packaging_info, seo_title, seo_description, main_image_url)
VALUES
  (
    uuid_generate_v4(),
    'Kerala Green Cardamom (AGEB Grade)',
    'kerala-green-cardamom-ageb',
    'Aleppey Green Extra Bold — 8mm+ pod diameter, vivid jade green, intense essential oil content.',
    'Harvested from the lush high-altitude plantations of Idukki, Western Ghats at 1200–1600m elevation. Hand-picked at optimal maturity, then sun-dried and machine-sorted to international export standards. Each batch undergoes rigorous quality control including moisture testing, volatile oil content analysis, and extraneous matter inspection.',
    'Idukki, Kerala, India',
    (SELECT id FROM cat_cardamom),
    TRUE, TRUE, 1,
    'AGEB — Aleppey Green Extra Bold',
    '0908.31',
    '5kg Vacuum Foil Pack inside 25kg Master Carton; 10kg Jute Sack with PE Liner; Custom Private Label Packaging',
    'Buy Premium AGEB Green Cardamom Wholesale | Cardanova Spices',
    'Direct from Idukki, Kerala. Premium 8mm+ Extra Bold Green Cardamom for B2B global export. FOB/CIF pricing available.',
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80'
  ),
  (
    uuid_generate_v4(),
    'Malabar Black Pepper (Tellicherry Garbled Special)',
    'malabar-black-pepper-tgseb',
    'TGSEB Grade — Extra Bold 4.75mm berries, deep black hue, pungent piperine richness.',
    'Selected from native Malabar pepper vines cultivated in the Western Ghats of Kerala. Retains high natural essential oils and characteristic warmth. Machine-cleaned, sun-dried and hand-sorted to TGSEB specifications for premium markets worldwide.',
    'Wayanad & Idukki, Kerala, India',
    (SELECT id FROM cat_pepper),
    TRUE, TRUE, 2,
    'TGSEB — Tellicherry Garbled Special Extra Bold',
    '0904.11',
    '25kg Multi-layer Kraft Paper Bags; 50kg PP Bags with Liner',
    'Tellicherry Black Pepper Bulk Exporter | Cardanova',
    'Exporting premium Malabar Black Pepper worldwide. TGSEB grade, direct from Kerala.',
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
  ),
  (
    uuid_generate_v4(),
    'High-Curcumin Alleppey Turmeric',
    'alleppey-turmeric-high-curcumin',
    '5.5%+ Curcumin content, deep orange core, aromatic and therapeutic quality.',
    'Cleaned, polished, and steam-sterilized whole fingers sourced from sustainable Kerala farms. Uniform size, rich in curcumin, suitable for pharmaceutical, food, and cosmetic industries.',
    'Ernakulam & Idukki, Kerala, India',
    (SELECT id FROM cat_turmeric),
    FALSE, TRUE, 3,
    'Finger Grade A1',
    '0910.30',
    '25kg Jute Bag; Bulk Container Bags',
    'Alleppey Turmeric Bulk Export | High Curcumin | Cardanova',
    'High-curcumin Alleppey turmeric fingers for B2B export. Pharmaceutical and food-grade quality.',
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
  )
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- PRODUCT SPECIFICATIONS seed
-- ============================================================
INSERT INTO public.product_specifications (product_id, label, value, sort_order)
SELECT p.id, s.label, s.value, s.sort_order
FROM public.products p,
LATERAL (VALUES
  ('Origin',            'Idukki, Kerala, India',   1),
  ('Moisture',          '< 10.5%',                 2),
  ('Volatile Oil',      '> 7.5% v/w',              3),
  ('Extraneous Matter', '< 0.5%',                  4),
  ('Bold Count',        '< 8 pods/gram',            5)
) AS s(label, value, sort_order)
WHERE p.slug = 'kerala-green-cardamom-ageb'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_specifications (product_id, label, value, sort_order)
SELECT p.id, s.label, s.value, s.sort_order
FROM public.products p,
LATERAL (VALUES
  ('Origin',           'Wayanad & Idukki, Kerala', 1),
  ('Piperine Content', '> 5.8%',                   2),
  ('Moisture',         '< 11%',                    3),
  ('Bulk Density',     '570 g/L',                  4)
) AS s(label, value, sort_order)
WHERE p.slug = 'malabar-black-pepper-tgseb'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_specifications (product_id, label, value, sort_order)
SELECT p.id, s.label, s.value, s.sort_order
FROM public.products p,
LATERAL (VALUES
  ('Curcumin Content', '5.2% - 6.0%', 1),
  ('Moisture',         '< 9%',        2),
  ('Volatile Oil',     '> 3.5%',      3)
) AS s(label, value, sort_order)
WHERE p.slug = 'alleppey-turmeric-high-curcumin'
ON CONFLICT DO NOTHING;


-- ============================================================
-- PRODUCT GRADES seed
-- ============================================================
INSERT INTO public.product_grades (product_id, grade_name, size_mm, density, description, sort_order)
SELECT p.id, g.grade_name, g.size_mm, g.density, g.description, g.sort_order
FROM public.products p,
LATERAL (VALUES
  ('AGEB (Aleppey Green Extra Bold)', '8.0mm+',          '435 g/L', 'Premium grade for luxury re-packers & tea blending.',                1),
  ('AGB (Aleppey Green Bold)',        '7.5mm - 8.0mm',   '415 g/L', 'High demand for Middle Eastern wholesale markets.',                 2),
  ('AGS (Aleppey Green Superior)',    '7.0mm - 7.5mm',   '385 g/L', 'Standard commercial export grade for food manufacturers.',          3)
) AS g(grade_name, size_mm, density, description, sort_order)
WHERE p.slug = 'kerala-green-cardamom-ageb'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_grades (product_id, grade_name, size_mm, density, description, sort_order)
SELECT p.id, g.grade_name, g.size_mm, g.density, g.description, g.sort_order
FROM public.products p,
LATERAL (VALUES
  ('TGSEB (Tellicherry Garbled Special Extra Bold)', '4.75mm+', '570 g/L', 'World-renowned spice trade premium grade.',          1),
  ('TGB (Tellicherry Garbled Bold)',                 '4.25mm',  '550 g/L', 'Gourmet restaurant supply and food service sector.', 2)
) AS g(grade_name, size_mm, density, description, sort_order)
WHERE p.slug = 'malabar-black-pepper-tgseb'
ON CONFLICT DO NOTHING;


-- ============================================================
-- CERTIFICATIONS seed
-- ============================================================
INSERT INTO public.certifications (title, issuing_body, description, is_active, display_order) VALUES
  ('Spices Board of India Registered Exporter', 'Ministry of Commerce & Industry, Govt of India', 'Authorized CRES (Certificate of Registration as Exporter of Spices) holder. Ref: CRES-KRL-2026/8942', TRUE, 1),
  ('FSSAI Central License (Food Safety Standard)', 'Food Safety and Standards Authority of India', 'Central License for spice processing, sorting & export packaging. Lic No: 11324007000189', TRUE, 2),
  ('ISO 22000:2018 Food Safety Management', 'TÜV SÜD International', 'Certified processing facility hygiene and traceability standard. Valid through 2028.', TRUE, 3),
  ('USDA & EU Organic Certified Estate', 'Control Union Certifications', 'Pesticide-free chemical analysis certified for European & North American imports. Ref: CU-892401', TRUE, 4)
ON CONFLICT DO NOTHING;


-- ============================================================
-- TESTIMONIALS seed
-- ============================================================
INSERT INTO public.testimonials (customer_name, company, country, review, rating, featured, published, display_order) VALUES
  ('Tariq Al-Mansoor', 'Al-Mansoor Commodity Traders', 'Saudi Arabia', 'Cardanova provides the cleanest, greenest cardamom pods we have received from India in 15 years. Moisture level was perfectly controlled and the aroma is unmatched.', 5, TRUE, TRUE, 1),
  ('Elena Rostova', 'Baltic Spice Co.', 'Latvia', 'Prompt shipment documentation, vacuum seal intact upon arrival in Riga port. Outstanding aroma. We will continue sourcing exclusively from Cardanova.', 5, TRUE, TRUE, 2),
  ('Hans Mueller', 'Gewürze Europa GmbH', 'Germany', 'The COA and pesticide analysis reports were thorough and EU-compliant. Excellent B2B communication throughout the process.', 5, FALSE, TRUE, 3)
ON CONFLICT DO NOTHING;


-- ============================================================
-- GALLERY ITEMS seed
-- ============================================================
INSERT INTO public.gallery_items (title, folder, image_url, display_order) VALUES
  ('High Altitude Plantation in Vandanmedu, Idukki',  'factory',    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',   1),
  ('Controlled Temperature Flue Drying Chambers',      'factory',    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',   2),
  ('Laser Sorting & Size Grading Machine',              'warehouse',  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',   1),
  ('Air-tight Nitrogen Flushed Vacuum Packaging',      'packaging',  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',   1)
ON CONFLICT DO NOTHING;


-- ============================================================
-- FAQs seed
-- ============================================================
INSERT INTO public.faqs (question, answer, display_order, published) VALUES
  ('What is your minimum order quantity (MOQ)?', 'Our standard MOQ is 500 kg per grade. For mixed consignments, minimum 200 kg per grade applies. We accommodate trial orders for first-time buyers subject to prior discussion.', 1, TRUE),
  ('Do you provide samples before bulk orders?', 'Yes. We provide 100–200g complimentary samples for qualified buyers. Courier charges apply for international shipments. Samples include COA (Certificate of Analysis) and origin documentation.', 2, TRUE),
  ('What shipping terms do you offer?', 'We export on FOB Cochin Port, CIF, and CNF terms. Door-to-door shipments can be arranged for select destinations in the Middle East and Europe.', 3, TRUE),
  ('Are your products certified organic?', 'Our estate is EU & USDA Organic certified through Control Union Certifications. Certified organic shipments are available upon request with a corresponding price premium.', 4, TRUE),
  ('What are your payment terms?', 'Standard terms: 30% advance TT + 70% against Bill of Lading (B/L). LC (Letter of Credit) at sight is accepted for orders above USD 25,000. Rates on request.', 5, TRUE)
ON CONFLICT DO NOTHING;


-- ============================================================
-- HOMEPAGE CONTENT seed (update the single row)
-- ============================================================
UPDATE public.homepage_content SET
  hero_title              = 'Single-Origin Cardamom & Premium Spices From Idukki',
  hero_subtitle           = 'Cultivated in high-altitude estates of Kerala. Processed to European & Middle Eastern export standards.',
  hero_cta_primary_text   = 'Request B2B Export Quote',
  hero_cta_secondary_text = 'Explore Spice Catalog',
  stats = '[
    {"value": "30+", "label": "Export Destinations"},
    {"value": "8.5mm+", "label": "AGEB Extra Bold Pod Size"},
    {"value": "100%", "label": "Traceable Single Origin"},
    {"value": "15+", "label": "Years of Export Expertise"}
  ]'::jsonb,
  why_choose_us_title = 'Why Choose Cardanova',
  why_choose_us_features = '[
    {"icon": "leaf", "title": "Single-Origin Guarantee", "description": "Every consignment is 100% traceable to our own partner estates in Idukki, Kerala."},
    {"icon": "award", "title": "Export Certified", "description": "APEDA-registered, FSSAI licensed, ISO 22000:2018 certified processing facility."},
    {"icon": "globe", "title": "30+ Countries Served", "description": "Active export relationships across the Middle East, Europe, North America and Southeast Asia."},
    {"icon": "shield", "title": "Quality Assurance", "description": "Third-party lab analysis (COA) provided with every shipment for buyer confidence."}
  ]'::jsonb
WHERE TRUE;


-- ============================================================
-- CONTACT INFO seed (update the single row)
-- ============================================================
UPDATE public.contact_info SET
  email          = 'trade@cardanovaspices.com',
  phone          = '+91 9876543210',
  whatsapp       = '+91 9876543210',
  address        = 'Cardanova Spices LLP, Vandanmedu, Idukki District, Kerala — 685 533, India',
  business_hours = 'Monday to Saturday: 9:00 AM – 6:00 PM IST',
  inquiry_email  = 'trade@cardanovaspices.com'
WHERE TRUE;


-- ============================================================
-- ABOUT CONTENT seed (update the single row)
-- ============================================================
UPDATE public.about_content SET
  company_story = 'Founded in the mist-covered highlands of Idukki, Kerala, Cardanova Spices LLP was born from a passion for authenticity and global trade. Our founders grew up surrounded by cardamom estates and saw an opportunity to bring the world''s finest spices directly to international buyers without intermediaries.',
  mission       = 'To deliver the purest, most traceable single-origin spices from Kerala to global buyers with complete transparency, quality assurance, and competitive pricing.',
  vision        = 'To be the most trusted name in Indian spice exports — known for integrity, quality, and sustainable sourcing practices that benefit both growers and buyers.',
  core_values   = '[
    {"title": "Authenticity", "description": "Every product is exactly what it claims to be — no blending, no adulteration."},
    {"title": "Traceability", "description": "Farm-to-freight documentation for every shipment."},
    {"title": "Partnership", "description": "Long-term relationships built on transparency and trust."},
    {"title": "Sustainability", "description": "Supporting eco-friendly farming practices across our partner estates."}
  ]'::jsonb,
  ceo_name    = 'Akhilkumar K A',
  ceo_title   = 'Co-Founder & Managing Director',
  ceo_message = 'When we started Cardanova, we wanted to change how Indian spices reach the world. Not through layers of middlemen, but directly — with full traceability, quality documentation, and the pride of authentic Kerala origin. Every kilogram we export carries the fragrance of Idukki and the commitment of our team.'
WHERE TRUE;


-- ============================================================
-- SITE SETTINGS seed (update the single row)
-- ============================================================
UPDATE public.site_settings SET
  company_name        = 'Cardanova Spices LLP',
  tagline             = 'Exporting Nature''s Finest',
  copyright_text      = '© 2026 Cardanova Spices LLP. All rights reserved.',
  default_currency    = 'USD',
  supported_languages = ARRAY['en'],
  inquiry_email       = 'trade@cardanovaspices.com'
WHERE TRUE;


-- ============================================================
-- NOTE: To create your first admin user:
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
-- 2. Enter your admin email and a strong password
-- 3. Copy the user's UUID from the Users table
-- 4. Run: INSERT INTO public.user_roles (user_id, role) VALUES ('<uuid>', 'owner');
-- ============================================================
