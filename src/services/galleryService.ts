import { supabase } from '../lib/supabase';
import type { GalleryItemRow, GalleryFolder } from '../types/database';
import { uploadFile, deleteFile } from './storageService';

const SUBSECTION_FOLDER_MAP: Record<string, GalleryFolder> = {
  homepage_hero: 'events',
  homepage_why_us: 'events',
  about_hero: 'factory',
  about_beginning: 'factory',
  about_founders: 'factory',
  factory: 'factory',
  warehouse: 'warehouse',
  origin_hero: 'factory',
  origin_step_1: 'factory',
  origin_step_2: 'factory',
  origin_step_3: 'factory',
  origin_step_4: 'factory',
  origin_step_5: 'packaging',
  origin_step_6: 'events',
  products_hero: 'products',
  products: 'products',
  packaging: 'packaging',
  certificates: 'certificates',
  events: 'events',
};

export async function getGalleryItems(folderOrSubkey?: string): Promise<GalleryItemRow[]> {
  let query = supabase
    .from('gallery_items')
    .select('*')
    .order('display_order', { ascending: true });

  if (!folderOrSubkey) {
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  const targetFolder = SUBSECTION_FOLDER_MAP[folderOrSubkey] || (folderOrSubkey as GalleryFolder);
  query = query.eq('folder', targetFolder);

  const { data, error } = await query;
  if (error) throw error;
  const rows = data ?? [];

  if (folderOrSubkey.startsWith('origin_step_')) {
    const stepNum = folderOrSubkey.replace('origin_step_', '');
    const filtered = rows.filter(
      (r) => r.title?.includes(`[${folderOrSubkey}]`) || r.title?.toLowerCase().includes(`step ${stepNum}`)
    );
    return filtered;
  }

  if (folderOrSubkey.endsWith('_hero')) {
    const exactTagged = rows.filter((r) => r.title?.includes(`[${folderOrSubkey}]`));
    if (exactTagged.length > 0) return exactTagged;
    const nameMatch = rows.filter((r) => r.title?.toLowerCase().includes(folderOrSubkey.replace('_', ' ')));
    if (nameMatch.length > 0) return nameMatch;
    return [];
  }

  if (folderOrSubkey.startsWith('about_') || folderOrSubkey.startsWith('origin_') || folderOrSubkey.startsWith('homepage_') || folderOrSubkey.startsWith('products_')) {
    const exactTagged = rows.filter((r) => r.title?.includes(`[${folderOrSubkey}]`));
    if (exactTagged.length > 0) return exactTagged;
  }

  return rows;
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
