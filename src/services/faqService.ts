import { supabase } from '../lib/supabase';
import type { FaqRow } from '../types/database';

export async function getFaqs(publishedOnly = true): Promise<FaqRow[]> {
  let query = supabase
    .from('faqs')
    .select('*')
    .order('display_order', { ascending: true });

  if (publishedOnly) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createFaq(faq: Omit<FaqRow, 'id' | 'created_at' | 'updated_at'>): Promise<FaqRow> {
  const { data, error } = await supabase.from('faqs').insert(faq).select().single();
  if (error) throw error;
  return data;
}

export async function updateFaq(id: string, updates: Partial<FaqRow>): Promise<FaqRow> {
  const { data, error } = await supabase.from('faqs').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFaq(id: string): Promise<void> {
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderFaqs(faqs: { id: string; display_order: number }[]): Promise<void> {
  await Promise.all(
    faqs.map(({ id, display_order }) =>
      supabase.from('faqs').update({ display_order }).eq('id', id)
    )
  );
}
