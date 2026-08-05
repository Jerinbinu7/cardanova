import { supabase } from '../lib/supabase';
import type { AboutContentRow } from '../types/database';
import { uploadFile, deleteFile } from './storageService';

export async function getAboutContent(): Promise<AboutContentRow | null> {
  const { data, error } = await supabase
    .from('about_content')
    .select('*')
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function updateAboutContent(updates: Partial<AboutContentRow>): Promise<AboutContentRow> {
  const { data: existing } = await supabase.from('about_content').select('id').limit(1).single();
  if (!existing) throw new Error('About content row not found. Run seed migration.');

  const { data, error } = await supabase
    .from('about_content')
    .update(updates)
    .eq('id', existing.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAboutImage(folder: 'factory' | 'warehouse' | 'ceo', file: File, onProgress?: (pct: number) => void): Promise<string> {
  return uploadFile('about', folder, file, onProgress);
}

export async function deleteAboutImage(url: string): Promise<void> {
  await deleteFile('about', url);
}
