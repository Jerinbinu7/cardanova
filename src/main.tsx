import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
     * HelmetProvider is required by react-helmet-async.
     * BrowserRouter enables real URL routing for /admin/* paths.
     * AuthProvider supplies Supabase session context throughout the tree.
     * Toaster renders react-hot-toast notifications globally.
     */}
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0D2012',
                color: '#FAF8F5',
                border: '1px solid rgba(197,160,70,0.35)',
                borderRadius: '12px',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#C5A046', secondary: '#071309' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
