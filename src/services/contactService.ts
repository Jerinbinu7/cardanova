import { supabase } from '../lib/supabase';
import type { ContactInfoRow } from '../types/database';

export async function getContactInfo(): Promise<ContactInfoRow | null> {
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function updateContactInfo(updates: Partial<ContactInfoRow>): Promise<ContactInfoRow> {
  const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
  if (!existing) throw new Error('Contact info row not found. Run seed migration.');

  const { data, error } = await supabase
    .from('contact_info')
    .update(updates)
    .eq('id', existing.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
