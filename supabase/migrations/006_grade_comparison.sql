-- ============================================================
-- Cardanova Spices — Grade Comparison Table (006)
-- Run AFTER 001_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.grade_comparison (
  id              SERIAL PRIMARY KEY,
  grade           TEXT NOT NULL,           -- e.g. "8.5mm"
  grade_name      TEXT NOT NULL,           -- e.g. "Extra Bold"
  pod_size        TEXT NOT NULL,           -- e.g. "8.5 mm+"
  color           TEXT,
  applications    TEXT,
  moq             TEXT,
  availability    TEXT NOT NULL DEFAULT 'In Stock',
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.grade_comparison ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "grade_comparison_public_read" ON public.grade_comparison
  FOR SELECT TO public USING (true);

-- Authenticated write access (admins)
CREATE POLICY "grade_comparison_authenticated_write" ON public.grade_comparison
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed with initial grade data
INSERT INTO public.grade_comparison (grade, grade_name, pod_size, color, applications, moq, availability, display_order)
VALUES
  ('8.5mm', 'Extra Bold',      '8.5 mm+',             'Deep Natural Emerald Green',       'Luxury Retail, High-End Gourmet, Middle East Coffee Blends, Premium Export', '500 kg',        'Year-Round',    1),
  ('8.0mm', 'Premium Bold',    '8.0 mm – 8.4 mm',     'Vibrant Forest Green',             'Premium Wholesale, Supermarket Labels, Confectionery & Beverage',            '1 Metric Ton',  'In Stock',      2),
  ('7.5mm', 'Export Grade',    '7.5 mm – 7.9 mm',     'Rich Emerald Green',               'Export Wholesalers, Culinary Repackers, Bakery & Spice Blenders',             '1 Metric Ton',  'In Stock',      3),
  ('7.0mm', 'Commercial Grade','7.0 mm – 7.4 mm',     'Medium Light Green',               'Commercial Kitchens, Institutional Foodservice, Catering Supply',             '2 Metric Tons', 'In Stock',      4),
  ('MIX',   'AGEB / LGB Blend','Assorted 6.5 – 8.0mm','Natural Harvest Green Blend',      'Spice Powder Milling, Garam Masala, Tea & Chai Premixes',                     '3 Metric Tons', 'In Stock',      5),
  ('OIL',   'Extraction Grade','Pods, Seeds & Husks',  'Natural Pale / Yellowish Green',  'Essential Oil Distillation, Oleoresin Extraction, Pharmaceutical Processing', '5 Metric Tons', 'Contract Basis',6)
ON CONFLICT DO NOTHING;
