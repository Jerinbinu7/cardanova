import { supabase } from '../lib/supabase';
import type { TestimonialRow } from '../types/database';
import { uploadFile, deleteFile } from './storageService';

export async function getTestimonials(featuredOnly = false): Promise<TestimonialRow[]> {
  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true });

  if (featuredOnly) query = query.eq('featured', true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAllTestimonials(): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTestimonial(t: Omit<TestimonialRow, 'id' | 'created_at' | 'updated_at'>): Promise<TestimonialRow> {
  const { data, error } = await supabase.from('testimonials').insert(t).select().single();
  if (error) throw error;
  return data;
}

export async function updateTestimonial(id: string, updates: Partial<TestimonialRow>): Promise<TestimonialRow> {
  const { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTestimonial(t: TestimonialRow): Promise<void> {
  if (t.image_url) await deleteFile('testimonials', t.image_url).catch(() => {});
  const { error } = await supabase.from('testimonials').delete().eq('id', t.id);
  if (error) throw error;
}

export async function uploadTestimonialImage(testimonialId: string, file: File, onProgress?: (pct: number) => void): Promise<string> {
  return uploadFile('testimonials', testimonialId, file, onProgress);
}
