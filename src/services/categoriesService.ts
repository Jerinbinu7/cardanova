import { supabase } from '../lib/supabase';
import type { CategoryRow } from '../types/database';
import { uploadFile, deleteFile } from './storageService';

export async function getCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(cat: Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryRow> {
  const { data, error } = await supabase.from('categories').insert(cat).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: Partial<CategoryRow>): Promise<CategoryRow> {
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadCategoryImage(categoryId: string, file: File): Promise<string> {
  return uploadFile('logos', `categories/${categoryId}`, file);
}

export async function deleteCategoryImage(imageUrl: string): Promise<void> {
  await deleteFile('logos', imageUrl);
}
