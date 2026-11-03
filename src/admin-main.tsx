/**
 * Admin-only React entry point.
 * Loaded by admin.html — only admin code is bundled here.
 * The public website code (HeroSlideshow, ProductCards, etc.) is never imported.
 *
 * When deployed to admin.cardanovaspices.com, this is the entire app.
 * Connects to the same Supabase project as the main site, so all
 * changes made here are immediately reflected on cardanovaspices.com.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AdminApp from './admin/AdminApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdminApp />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0D2012',
              color: '#FAF8F5',
              border: '1px solid rgba(197,160,70,0.3)',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#C5A046', secondary: '#071309' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
