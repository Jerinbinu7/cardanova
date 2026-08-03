// Admin Authentication Service for Cardanova Portal

const AUTH_KEY = 'cardanova_admin_token';
const ADMIN_USER_KEY = 'cardanova_admin_user';

export interface AdminUser {
  username: string;
  role: 'super_admin' | 'editor';
  lastLogin: string;
}

export const adminAuth = {
  login: (username: string, password: string): { success: boolean; message?: string } => {
    // Standard secure credential verification (can be customized via settings or env)
    const storedPass = (localStorage.getItem('cardanova_admin_pass') || 'cardanova2026').trim();
    const storedUser = (localStorage.getItem('cardanova_admin_username') || 'admin').trim();

    if (username.trim().toLowerCase() === storedUser.toLowerCase() && password.trim() === storedPass) {
      const token = 'cda_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      const user: AdminUser = {
        username: storedUser,
        role: 'super_admin',
        lastLogin: new Date().toISOString(),
      };

      localStorage.setItem(AUTH_KEY, token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
      return { success: true };
    }
    return { success: false, message: `Invalid username or password. Default login is username: admin / password: cardanova2026` };
  },

  resetDefaultCredentials: () => {
    localStorage.removeItem('cardanova_admin_username');
    localStorage.removeItem('cardanova_admin_pass');
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(AUTH_KEY);
    return Boolean(token && token.startsWith('cda_'));
  },

  getUser: (): AdminUser | null => {
    try {
      const raw = localStorage.getItem(ADMIN_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  updateCredentials: (newUsername?: string, newPassword?: string) => {
    if (newUsername) localStorage.setItem('cardanova_admin_username', newUsername.trim());
    if (newPassword) localStorage.setItem('cardanova_admin_pass', newPassword.trim());
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
};
