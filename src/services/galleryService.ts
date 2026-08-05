import { supabase } from '../lib/supabase';
import type { GalleryItemRow, GalleryFolder } from '../types/database';
import { uploadFile, deleteFile } from './storageService';

export async function getGalleryItems(folder?: GalleryFolder): Promise<GalleryItemRow[]> {
  let query = supabase
    .from('gallery_items')
    .select('*')
    .order('display_order', { ascending: true });

  if (folder) query = query.eq('folder', folder);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createGalleryItem(item: Omit<GalleryItemRow, 'id' | 'created_at' | 'updated_at'>): Promise<GalleryItemRow> {
  const { data, error } = await supabase.from('gallery_items').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItemRow>): Promise<GalleryItemRow> {
  const { data, error } = await supabase.from('gallery_items').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGalleryItem(item: GalleryItemRow): Promise<void> {
  await deleteFile('gallery', item.image_url);
  const { error } = await supabase.from('gallery_items').delete().eq('id', item.id);
  if (error) throw error;
}

export async function uploadGalleryImage(folder: GalleryFolder, file: File, onProgress?: (pct: number) => void): Promise<string> {
  return uploadFile('gallery', folder, file, onProgress);
}

export async function reorderGalleryItems(items: { id: string; display_order: number }[]): Promise<void> {
  const updates = items.map(({ id, display_order }) =>
    supabase.from('gallery_items').update({ display_order }).eq('id', id)
  );
  await Promise.all(updates);
}
