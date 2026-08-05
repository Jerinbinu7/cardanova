import { supabase } from '../lib/supabase';
import type { CertificationRow } from '../types/database';
import { uploadFile, deleteFile } from './storageService';

export async function getCertifications(activeOnly = false): Promise<CertificationRow[]> {
  let query = supabase
    .from('certifications')
    .select('*')
    .order('display_order', { ascending: true });

  if (activeOnly) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createCertification(cert: Omit<CertificationRow, 'id' | 'created_at' | 'updated_at'>): Promise<CertificationRow> {
  const { data, error } = await supabase.from('certifications').insert(cert).select().single();
  if (error) throw error;
  return data;
}

export async function updateCertification(id: string, updates: Partial<CertificationRow>): Promise<CertificationRow> {
  const { data, error } = await supabase.from('certifications').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCertification(cert: CertificationRow): Promise<void> {
  if (cert.image_url) await deleteFile('certificates', cert.image_url).catch(() => {});
  if (cert.pdf_url) await deleteFile('certificates', cert.pdf_url).catch(() => {});
  const { error } = await supabase.from('certifications').delete().eq('id', cert.id);
  if (error) throw error;
}

export async function uploadCertificationImage(certId: string, file: File, onProgress?: (pct: number) => void): Promise<string> {
  return uploadFile('certificates', `images/${certId}`, file, onProgress);
}

export async function uploadCertificationPdf(certId: string, file: File, onProgress?: (pct: number) => void): Promise<string> {
  return uploadFile('certificates', `pdfs/${certId}`, file, onProgress);
}
