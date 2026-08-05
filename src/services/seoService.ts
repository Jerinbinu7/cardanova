import { supabase } from '../lib/supabase';
import type { SeoSettingsRow } from '../types/database';

export async function getAllSEOSettings(): Promise<SeoSettingsRow[]> {
  const { data, error } = await supabase.from('seo_settings').select('*').order('page');
  if (error) throw error;
  return data ?? [];
}

export async function getSEOForPage(page: string): Promise<SeoSettingsRow | null> {
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .eq('page', page)
    .single();
  if (error) return null;
  return data;
}

export async function upsertSEOSettings(page: string, updates: Partial<SeoSettingsRow>): Promise<SeoSettingsRow> {
  const { data, error } = await supabase
    .from('seo_settings')
    .upsert({ page, ...updates }, { onConflict: 'page' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
