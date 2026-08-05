import { supabase } from '../lib/supabase';
import type { ProductRow, ProductImageRow, ProductSpecificationRow, ProductGradeRow } from '../types/database';
import { uploadFile, deleteFile } from './storageService';

export interface ProductWithRelations extends ProductRow {
  images: ProductImageRow[];
  specifications: ProductSpecificationRow[];
  grades: ProductGradeRow[];
  category?: { id: string; name: string; slug: string } | null;
}

// ─── GET ALL PRODUCTS (admin: all, public: published only) ───────────────────
export async function getProducts(publishedOnly = false): Promise<ProductWithRelations[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(id, url, alt_text, display_order),
      specifications:product_specifications(id, label, value, sort_order),
      grades:product_grades(id, grade_name, size_mm, density, description, sort_order)
    `)
    .order('display_order', { ascending: true });

  if (publishedOnly) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
}

// ─── GET FEATURED PRODUCTS ────────────────────────────────────────────────────
export async function getFeaturedProducts(limit = 4): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(id, url, alt_text, display_order),
      specifications:product_specifications(id, label, value, sort_order),
      grades:product_grades(id, grade_name, size_mm, density, description, sort_order)
    `)
    .eq('published', true)
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
}

// ─── GET PRODUCT BY SLUG ──────────────────────────────────────────────────────
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(id, url, alt_text, display_order),
      specifications:product_specifications(id, label, value, sort_order),
      grades:product_grades(id, grade_name, size_mm, density, description, sort_order)
    `)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as unknown as ProductWithRelations;
}

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────
export async function createProduct(product: Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>): Promise<ProductRow> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
export async function updateProduct(id: string, updates: Partial<ProductRow>): Promise<ProductRow> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ─── PRODUCT IMAGES ───────────────────────────────────────────────────────────
export async function uploadProductImage(productId: string, file: File, onProgress?: (pct: number) => void): Promise<ProductImageRow> {
  const url = await uploadFile('products', productId, file, onProgress);
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, display_order: Math.floor(Date.now() / 1000) })
    .select()
    .single();

  if (error) throw error;

  // Auto-set main_image_url on products if currently null/empty
  const { data: prod } = await supabase.from('products').select('main_image_url').eq('id', productId).single();
  if (prod && !prod.main_image_url) {
    await supabase.from('products').update({ main_image_url: url }).eq('id', productId);
  }

  return data;
}

export async function deleteProductImage(image: ProductImageRow): Promise<void> {
  await deleteFile('products', image.url);
  const { error } = await supabase.from('product_images').delete().eq('id', image.id);
  if (error) throw error;
}

// ─── SPECIFICATIONS ───────────────────────────────────────────────────────────
export async function saveProductSpecifications(productId: string, specs: Array<{ label: string; value: string }>): Promise<void> {
  // Delete existing then insert fresh
  await supabase.from('product_specifications').delete().eq('product_id', productId);
  if (specs.length > 0) {
    const rows = specs.map((s, i) => ({ product_id: productId, label: s.label, value: s.value, sort_order: i }));
    const { error } = await supabase.from('product_specifications').insert(rows);
    if (error) throw error;
  }
}

// ─── GRADES ───────────────────────────────────────────────────────────────────
export async function saveProductGrades(productId: string, grades: Array<{ grade_name: string; size_mm?: string; density?: string; description?: string }>): Promise<void> {
  await supabase.from('product_grades').delete().eq('product_id', productId);
  if (grades.length > 0) {
    const rows = grades.map((g, i) => ({ product_id: productId, ...g, sort_order: i }));
    const { error } = await supabase.from('product_grades').insert(rows);
    if (error) throw error;
  }
}

// ─── SLUG helper ──────────────────────────────────────────────────────────────
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
