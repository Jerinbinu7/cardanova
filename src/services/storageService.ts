/**
 * Storage Service — handles all Supabase Storage file operations.
 * Includes client-side image compression before upload.
 */
import { supabase } from '../lib/supabase';

export type StorageBucket = 'products' | 'gallery' | 'homepage' | 'certificates' | 'logos' | 'about' | 'testimonials';

// ─── Compress image using canvas API ─────────────────────────────────────────
async function compressImage(file: File, maxWidth = 1920, quality = 0.82): Promise<File> {
  // Only compress images (skip PDFs)
  if (!file.type.startsWith('image/')) return file;
  // Skip SVG
  if (file.type === 'image/svg+xml') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const ext = file.type === 'image/png' ? 'png' : 'jpg';
          const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), {
            type: blob.type,
            lastModified: Date.now(),
          });
          // Only use compressed if actually smaller
          resolve(compressedFile.size < file.size ? compressedFile : file);
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

// ─── Upload file ──────────────────────────────────────────────────────────────
export async function uploadFile(
  bucket: StorageBucket,
  folder: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const compressed = await compressImage(file);
  const ext = compressed.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Supabase JS v2 doesn't natively support upload progress via the standard API.
  // We simulate it via two stages: start (10%) → done (100%).
  onProgress?.(10);

  const { error } = await supabase.storage.from(bucket).upload(fileName, compressed, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  onProgress?.(100);

  return getPublicUrl(bucket, fileName);
}

// ─── Get public URL ───────────────────────────────────────────────────────────
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Delete file (path = everything after bucket name) ───────────────────────
export async function deleteFile(bucket: StorageBucket, fileUrl: string): Promise<void> {
  // Extract the path from the full URL
  // URL format: https://xxxx.supabase.co/storage/v1/object/public/{bucket}/{path}
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return; // Not a Supabase URL — skip

  const filePath = fileUrl.slice(idx + marker.length);
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

// ─── List files in a folder ───────────────────────────────────────────────────
export async function listFiles(bucket: StorageBucket, folder: string) {
  const { data, error } = await supabase.storage.from(bucket).list(folder);
  if (error) throw error;
  return data ?? [];
}
