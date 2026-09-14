/**
 * Database type definitions for Cardanova Supabase schema.
 * Update this file if you add new columns/tables.
 */

export type UserRole = 'owner' | 'admin' | 'editor';

export type ProductAvailability = 'in_stock' | 'seasonal' | 'on_request' | 'out_of_stock';

export type GalleryFolder = 'factory' | 'warehouse' | 'products' | 'packaging' | 'certificates' | 'events' | 'homepage_hero';

export type QuoteStatus = 'pending' | 'contacted' | 'closed';

export interface GradeComparisonRow {
  id: number;
  grade: string;
  grade_name: string;
  pod_size: string;
  color: string | null;
  applications: string | null;
  moq: string | null;
  price_per_kg: string | null;
  availability: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Table Row Types ───────────────────────────────────────────────────────────

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsRow {
  id: string;
  company_name: string;
  tagline: string | null;
  logo_url: string | null;
  emblem_url: string | null;
  favicon_url: string | null;
  copyright_text: string | null;
  business_reg_number: string | null;
  gst_number: string | null;
  export_license: string | null;
  default_currency: string;
  supported_languages: string[];
  whatsapp_number: string | null;
  inquiry_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeoSettingsRow {
  id: string;
  page: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  twitter_card: string | null;
  canonical_url: string | null;
  schema_markup: Record<string, unknown> | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  origin: string | null;
  category_id: string | null;
  availability: ProductAvailability;
  featured: boolean;
  published: boolean;
  display_order: number;
  export_grade: string | null;
  price_per_kg: number | null;
  hs_code: string | null;
  packaging_info: string | null;
  main_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

export interface ProductSpecificationRow {
  id: string;
  product_id: string;
  label: string;
  value: string;
  sort_order: number;
}

export interface ProductGradeRow {
  id: string;
  product_id: string;
  grade_name: string;
  size_mm: string | null;
  density: string | null;
  description: string | null;
  sort_order: number;
}

export interface HomepageContentRow {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_bg_image_url: string | null;
  hero_cta_primary_text: string | null;
  hero_cta_primary_url: string | null;
  hero_cta_secondary_text: string | null;
  hero_cta_secondary_url: string | null;
  stats: StatItem[] | null;
  why_choose_us_title: string | null;
  why_choose_us_features: WhyChooseUsFeature[] | null;
  about_preview_title: string | null;
  about_preview_text: string | null;
  footer_tagline: string | null;
  farm_to_export_steps: FarmToExportStep[] | null;
  created_at: string;
  updated_at: string;
}

export interface FarmToExportStep {
  step: number;
  title: string;
  loc: string;
  desc: string;
  phase?: string;
  body?: string;
  detail?: string;
  image?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface WhyChooseUsFeature {
  icon?: string;
  tag?: string;
  title: string;
  stat?: string;
  statLabel?: string;
  description: string;
}

export interface AboutContentRow {
  id: string;
  company_story: string | null;
  mission: string | null;
  vision: string | null;
  core_values: CoreValue[] | null;
  history: string | null;
  ceo_name: string | null;
  ceo_title: string | null;
  ceo_message: string | null;
  ceo_image_url: string | null;
  factory_images: string[] | null;
  warehouse_images: string[] | null;
  founders: Founder[] | null;
  timeline: TimelineItem[] | null;
  created_at: string;
  updated_at: string;
}

export interface Founder {
  name: string;
  position: string;
  photo: string;
  intro: string;
  quote: string;
  linkedin: string;
  facebook: string;
  email: string;
}

export interface CoreValue {
  title: string;
  description: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface GalleryItemRow {
  id: string;
  title: string;
  folder: GalleryFolder;
  image_url: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CertificationRow {
  id: string;
  title: string;
  issuing_body: string | null;
  description: string | null;
  image_url: string | null;
  pdf_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialRow {
  id: string;
  customer_name: string;
  country: string | null;
  company: string | null;
  review: string;
  rating: number;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactInfoRow {
  id: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  google_maps_url: string | null;
  google_maps_embed: string | null;
  business_hours: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  inquiry_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequestRow {
  id: string;
  full_name: string;
  company_name: string | null;
  country: string | null;
  email: string;
  phone: string | null;
  selected_products: string | null;
  quantity_kg: string | null;
  message: string | null;
  status: QuoteStatus;
  internal_notes: string | null;
  submitted_at: string;
  updated_at: string;
}

// ─── Minimal Database interface for createClient<Database> ────────────────────
export interface Database {
  public: {
    Tables: {
      user_roles:              { Row: UserRoleRow; Insert: any; Update: any };
      site_settings:           { Row: SiteSettingsRow; Insert: any; Update: any };
      seo_settings:            { Row: SeoSettingsRow; Insert: any; Update: any };
      categories:              { Row: CategoryRow; Insert: any; Update: any };
      products:                { Row: ProductRow; Insert: any; Update: any };
      product_images:          { Row: ProductImageRow; Insert: any; Update: any };
      product_specifications:  { Row: ProductSpecificationRow; Insert: any; Update: any };
      product_grades:          { Row: ProductGradeRow; Insert: any; Update: any };
      homepage_content:        { Row: HomepageContentRow; Insert: any; Update: any };
      about_content:           { Row: AboutContentRow; Insert: any; Update: any };
      gallery_items:           { Row: GalleryItemRow; Insert: any; Update: any };
      certifications:          { Row: CertificationRow; Insert: any; Update: any };
      testimonials:            { Row: TestimonialRow; Insert: any; Update: any };
      faqs:                    { Row: FaqRow; Insert: any; Update: any };
      contact_info:            { Row: ContactInfoRow; Insert: any; Update: any };
      quote_requests:          { Row: QuoteRequestRow; Insert: any; Update: any };
      grade_comparison:        { Row: GradeComparisonRow; Insert: any; Update: any };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
