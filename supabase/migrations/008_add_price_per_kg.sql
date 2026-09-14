-- ============================================================
-- Cardanova Spices — Add price_per_kg columns (008)
-- Run AFTER 006_grade_comparison.sql
-- ============================================================

-- Add price_per_kg to products table (nullable numeric, INR per kg)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC DEFAULT NULL;

COMMENT ON COLUMN public.products.price_per_kg IS 'Admin-set price in INR per kg. When set, overrides live auction-derived prices on the website.';

-- Add price_per_kg to grade_comparison table (nullable text, e.g. "₹2,850/kg")
ALTER TABLE public.grade_comparison
  ADD COLUMN IF NOT EXISTS price_per_kg TEXT DEFAULT NULL;

COMMENT ON COLUMN public.grade_comparison.price_per_kg IS 'Estimated price per kg displayed in the grade comparison table (free-form text, e.g. ₹2,850/kg).';
