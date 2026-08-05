import { supabase } from '../lib/supabase';
import type { UserRole } from '../types/database';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: UserRole | null;
}

// Owner-only: list all admin users with their roles
export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at');

  if (error) throw error;

  // We don't have direct access to auth.users from the client,
  // so we return user_id as id and omit email (requires server-side or service role)
  return (data ?? []).map((r) => ({
    id: r.user_id,
    email: '(email visible in Supabase dashboard)',
    created_at: r.created_at,
    role: r.role as UserRole,
  }));
}

// Update a user's role
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' });
  if (error) throw error;
}

// Remove a user's admin access (delete from user_roles)
export async function removeAdminAccess(userId: string): Promise<void> {
  const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
  if (error) throw error;
}

// Add role for a new user (after they sign up via Supabase invite)
export async function grantAdminAccess(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role });
  if (error) throw error;
}
