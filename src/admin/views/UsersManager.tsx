import { useEffect, useState } from 'react';
import { Shield, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminUsers, updateUserRole, removeAdminAccess, grantAdminAccess } from '../../services/usersService';
import type { UserRole } from '../../types/database';
import type { AdminUser } from '../../services/usersService';
import ConfirmDialog from '../components/ConfirmDialog';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_COLORS: Record<UserRole, string> = {
  owner:  'bg-amber-950/60 text-amber-300 border-amber-500/40',
  admin:  'bg-blue-950/60 text-blue-300 border-blue-500/40',
  editor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
};

export default function UsersManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [removeTarget, setRemoveTarget] = useState<AdminUser | null>(null);
  const [showGrant, setShowGrant]   = useState(false);
  const [grantUserId, setGrantUserId] = useState('');
  const [grantRole, setGrantRole]   = useState<UserRole>('editor');

  const load = async () => {
    setLoading(true);
    try { setUsers(await getAdminUsers()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try { await updateUserRole(userId, role); toast.success('Role updated!'); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try { await removeAdminAccess(removeTarget.id); toast.success('Access revoked.'); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setRemoveTarget(null); }
  };

  const handleGrant = async () => {
    if (!grantUserId.trim()) { toast.error('Enter a valid User UUID.'); return; }
    try {
      await grantAdminAccess(grantUserId.trim(), grantRole);
      toast.success(`Access granted as ${grantRole}!`);
      setShowGrant(false); setGrantUserId('');
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <RoleGuard requires="owner">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
          <div>
            <h2 className="text-xl font-light text-[#FAF8F5]">Admin Users</h2>
            <p className="text-xs text-gray-400 mt-1">Manage admin access and role assignments (Owner only)</p>
          </div>
          <button onClick={() => setShowGrant((s) => !s)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg">
            <UserPlus className="w-4 h-4" /> Grant Access
          </button>
        </div>

        {showGrant && (
          <div className="bg-[#0D2012]/80 border border-[#C5A046]/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-[#C5A046] font-medium">Grant Admin Access</h3>
              <button onClick={() => setShowGrant(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-300 mb-1.5">User UUID (from Supabase Dashboard → Auth → Users)</label>
                <input value={grantUserId} onChange={(e) => setGrantUserId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#C5A046]" />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1.5">Role</label>
                <select value={grantRole} onChange={(e) => setGrantRole(e.target.value as UserRole)}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046]">
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleGrant} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider">
                Grant Access
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-[#FAF8F5]">
            <thead className="bg-[#071309]/80 text-[#C5A046] uppercase text-[11px] tracking-wider border-b border-[#C5A046]/20">
              <tr>
                <th className="p-4">User ID</th>
                <th className="p-4">Role</th>
                <th className="p-4 hidden md:table-cell">Granted On</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A046]/10">
              {loading
                ? <tr><td colSpan={4} className="p-6 text-center text-gray-400">Loading...</td></tr>
                : users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#C5A046]/5">
                    <td className="p-4">
                      <p className="text-xs font-mono text-gray-300 truncate max-w-[180px]">{u.id}</p>
                      {u.id === currentUser?.id && <span className="text-[10px] text-[#C5A046] bg-[#C5A046]/10 px-2 py-0.5 rounded-full">You</span>}
                    </td>
                    <td className="p-4">
                      {u.id === currentUser?.id ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border font-semibold uppercase ${ROLE_COLORS[u.role!]}`}>
                          <Shield className="w-3 h-3" />{u.role}
                        </span>
                      ) : (
                        <select value={u.role ?? 'editor'} onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold uppercase cursor-pointer bg-transparent ${u.role ? ROLE_COLORS[u.role] : 'text-gray-400'}`}>
                          <option value="editor" className="bg-[#0D2012] text-white">Editor</option>
                          <option value="admin" className="bg-[#0D2012] text-white">Admin</option>
                          <option value="owner" className="bg-[#0D2012] text-white">Owner</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      {u.id !== currentUser?.id && (
                        <button onClick={() => setRemoveTarget(u)} className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60" title="Revoke access">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        <ConfirmDialog isOpen={!!removeTarget} title="Revoke Admin Access" message={`Revoke admin access for user "${removeTarget?.id}"? They will no longer be able to access the admin panel.`} onConfirm={handleRemove} onCancel={() => setRemoveTarget(null)} />
      </div>
    </RoleGuard>
  );
}
