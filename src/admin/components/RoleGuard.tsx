import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/database';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  /** Minimum role required. Hierarchy: owner > admin > editor */
  requires: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ROLE_WEIGHT: Record<UserRole, number> = { owner: 3, admin: 2, editor: 1 };

export default function RoleGuard({ requires, children, fallback }: RoleGuardProps) {
  const { role } = useAuth();

  const allowed = Array.isArray(requires)
    ? requires.some((r) => role && ROLE_WEIGHT[role] >= ROLE_WEIGHT[r])
    : role && ROLE_WEIGHT[role] >= ROLE_WEIGHT[requires];

  if (!allowed) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 bg-red-950/40 rounded-2xl border border-red-500/30">
            <ShieldX className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#FAF8F5]">Access Restricted</h3>
            <p className="text-xs text-gray-400 mt-1">
              You don't have permission to view this section.
              <br />Required role: <span className="text-[#C5A046]">{Array.isArray(requires) ? requires.join(' or ') : requires}</span>
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
