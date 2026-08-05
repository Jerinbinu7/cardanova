/**
 * Deprecated Sanity client stub.
 * Cardanova now uses Supabase (src/lib/supabase.ts).
 */
export const getSanityConfig = () => ({ projectId: '', dataset: '', apiVersion: '', token: '', isConfigured: false });
export const createSanityClient = () => null;
export const sanityClient = null;
export const urlFor = (source: any) => (typeof source === 'string' ? source : '');
