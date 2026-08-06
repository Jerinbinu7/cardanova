import { supabase } from '../lib/supabase';
import type { QuoteRequestRow, QuoteStatus } from '../types/database';

// Public — anyone can submit (no .select() so anonymous visitors bypass RLS SELECT restriction)
export async function submitQuoteRequest(
  data: Omit<QuoteRequestRow, 'id' | 'status' | 'submitted_at' | 'updated_at' | 'internal_notes'>
): Promise<void> {
  const { error } = await supabase
    .from('quote_requests')
    .insert({ ...data, status: 'pending' });
  if (error) throw error;
}

// Admin — paginated list
export async function getQuoteRequests(options?: {
  status?: QuoteStatus;
  page?: number;
  pageSize?: number;
}): Promise<{ data: QuoteRequestRow[]; count: number }> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('quote_requests')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(from, to);

  if (options?.status) query = query.eq('status', options.status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

// Admin — update status
export async function updateQuoteStatus(id: string, status: QuoteStatus, notes?: string): Promise<void> {
  const updates: Partial<QuoteRequestRow> = { status };
  if (notes !== undefined) updates.internal_notes = notes;
  const { error } = await supabase.from('quote_requests').update(updates).eq('id', id);
  if (error) throw error;
}

// Admin — delete
export async function deleteQuoteRequest(id: string): Promise<void> {
  const { error } = await supabase.from('quote_requests').delete().eq('id', id);
  if (error) throw error;
}

// Admin — count pending quote requests for red alert badge
export async function getPendingQuotesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('quote_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (error) return 0;
  return count ?? 0;
}
