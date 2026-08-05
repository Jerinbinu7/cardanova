import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wraps admin routes — redirects to /admin/login if not authenticated.
 * Also restores normal cursor for admin interactions.
 */
export default function AdminPortal() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Restore default cursor inside admin portal
    document.body.style.cursor = 'auto';
    return () => { document.body.style.cursor = ''; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071309] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/images/cardanova-emblem.png" alt="Cardanova" className="h-14 w-auto animate-pulse" />
          <div className="w-32 h-0.5 bg-[#C5A046]/20 overflow-hidden rounded-full">
            <div className="h-full bg-[#C5A046] animate-[slide_1.2s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
