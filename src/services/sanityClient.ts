import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const getSanityConfig = () => {
  const env = (import.meta as any).env || {};
  const projectId = env.VITE_SANITY_PROJECT_ID || localStorage.getItem('sanity_project_id') || '';
  const dataset = env.VITE_SANITY_DATASET || localStorage.getItem('sanity_dataset') || 'production';
  const apiVersion = '2024-03-01';
  const token = env.VITE_SANITY_TOKEN || localStorage.getItem('sanity_token') || '';

  const isConfigured = Boolean(projectId && projectId.trim() !== '');

  return { projectId, dataset, apiVersion, token, isConfigured };
};

export const createSanityClient = () => {
  const config = getSanityConfig();
  if (!config.isConfigured) return null;

  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token: config.token || undefined,
    useCdn: false, // false for real-time admin updates
  });
};

export const sanityClient = createSanityClient();

export const urlFor = (source: any) => {
  const client = createSanityClient();
  if (!client || !source) return '';
  try {
    const builder = imageUrlBuilder(client);
    return builder.image(source).url();
  } catch {
    return typeof source === 'string' ? source : '';
  }
};
