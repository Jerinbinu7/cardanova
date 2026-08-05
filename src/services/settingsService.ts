import { supabase } from '../lib/supabase';
import type { SiteSettingsRow } from '../types/database';
import { uploadFile, deleteFile } from './storageService';

export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function updateSiteSettings(updates: Partial<SiteSettingsRow>): Promise<SiteSettingsRow> {
  const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single();
  if (!existing) throw new Error('Site settings row not found. Run seed migration.');

  const { data, error } = await supabase
    .from('site_settings')
    .update(updates)
    .eq('id', existing.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadLogo(file: File, onProgress?: (pct: number) => void): Promise<string> {
  return uploadFile('logos', 'company', file, onProgress);
}

export async function uploadFavicon(file: File, onProgress?: (pct: number) => void): Promise<string> {
  return uploadFile('logos', 'favicon', file, onProgress);
}

export async function deleteLogo(url: string): Promise<void> {
  await deleteFile('logos', url);
}
