import { supabase } from '../lib/supabase';
import type { GradeComparisonRow } from '../types/database';

export async function getGradeComparison(): Promise<GradeComparisonRow[]> {
  const { data, error } = await supabase
    .from('grade_comparison')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createGradeComparisonRow(
  payload: Omit<GradeComparisonRow, 'id' | 'created_at' | 'updated_at'>
): Promise<GradeComparisonRow> {
  const { data, error } = await supabase
    .from('grade_comparison')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateGradeComparisonRow(
  id: number,
  payload: Partial<Omit<GradeComparisonRow, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('grade_comparison')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteGradeComparisonRow(id: number): Promise<void> {
  const { error } = await supabase
    .from('grade_comparison')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderGradeComparison(rows: GradeComparisonRow[]): Promise<void> {
  const updates = rows.map((r, i) => ({ id: r.id, display_order: i + 1 }));
  for (const u of updates) {
    const { error } = await supabase
      .from('grade_comparison')
      .update({ display_order: u.display_order })
      .eq('id', u.id);
    if (error) throw new Error(error.message);
  }
}
