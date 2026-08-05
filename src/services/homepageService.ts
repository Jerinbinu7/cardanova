import { supabase } from '../lib/supabase';
import type { HomepageContentRow } from '../types/database';
import { uploadFile } from './storageService';

export async function getHomepageContent(): Promise<HomepageContentRow | null> {
  const { data, error } = await supabase
    .from('homepage_content')
    .select('*')
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function updateHomepageContent(updates: Partial<HomepageContentRow>): Promise<HomepageContentRow> {
  // Get the single row id first
  const { data: existing } = await supabase.from('homepage_content').select('id').limit(1).single();
  if (!existing) throw new Error('Homepage content row not found. Run seed migration.');

  const { data, error } = await supabase
    .from('homepage_content')
    .update(updates)
    .eq('id', existing.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadHeroBgImage(file: File, onProgress?: (pct: number) => void): Promise<string> {
  return uploadFile('homepage', 'hero', file, onProgress);
}
