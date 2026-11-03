/**
 * AdminApp — standalone router for the admin portal when deployed
 * on its own domain (e.g. admin.cardanovaspices.com).
 *
 * On the main site (cardanovaspices.com), the admin is still accessible
 * at the secret path via App.tsx routing. On the admin domain, this is
 * the root router — no public site routes exist.
 *
 * Both connect to the same Supabase project.
 * Any save in the admin portal is immediately live on the public website.
 */
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminPortal         = lazy(() => import('./AdminPortal'));
const AdminLayout         = lazy(() => import('./AdminLayout'));
const AdminLogin          = lazy(() => import('./AdminLogin'));
const AdminForgotPassword = lazy(() => import('./AdminForgotPassword'));
const AdminResetPassword  = lazy(() => import('./AdminResetPassword'));

function AdminLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-[#071309]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-5">
        <img
          src="/images/cardanova-emblem.png"
          alt="Cardanova"
          className="h-16 w-auto animate-pulse"
        />
        <div className="w-36 h-0.5 bg-[#C5A046]/20 overflow-hidden rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C5A046] to-[#E2BF63]"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#C5A046]/60">Loading CMS</p>
      </div>
    </motion.div>
  );
}

export default function AdminApp() {
  return (
    <Routes>
      {/* ── Protected admin routes ── */}
      <Route
        path="/"
        element={
          <Suspense fallback={<AdminLoader />}>
            <AdminPortal />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminLayout />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminLayout />
            </Suspense>
          }
        />
      </Route>

      {/* ── Auth routes ── */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<AdminLoader />}>
            <AdminLogin />
          </Suspense>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<AdminLoader />}>
            <AdminForgotPassword />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<AdminLoader />}>
            <AdminResetPassword />
          </Suspense>
        }
      />

      {/* Catch-all → redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
