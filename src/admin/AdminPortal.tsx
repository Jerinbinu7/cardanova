import { useEffect, useState } from 'react';
import { adminAuth } from '../services/adminAuth';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

interface AdminPortalProps {
  onReturnToSite: () => void;
}

export default function AdminPortal({ onReturnToSite }: AdminPortalProps) {
  const [authenticated, setAuthenticated] = useState<boolean>(adminAuth.isAuthenticated());

  useEffect(() => {
    // Explicitly restore standard browser cursor for admin portal interactions
    document.body.style.cursor = 'auto';
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  const handleLogout = () => {
    adminAuth.logout();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <AdminLogin
        onSuccess={() => setAuthenticated(true)}
        onReturnToSite={onReturnToSite}
      />
    );
  }

  return (
    <AdminLayout
      onLogout={handleLogout}
      onReturnToSite={onReturnToSite}
    />
  );
}
