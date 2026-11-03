import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Build targets:
 *   VITE_BUILD_TARGET=main  → builds cardanovaspices.com  (default)
 *   VITE_BUILD_TARGET=admin → builds admin.cardanovaspices.com
 *
 * Both connect to the same Supabase project.
 * Any admin save is immediately live on the public website.
 */
const buildTarget = process.env.VITE_BUILD_TARGET ?? 'main';
const isAdminBuild = buildTarget === 'admin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    minify: "esbuild",
    cssCodeSplit: true,
    target: "es2020",

    rollupOptions: {
      // Admin build uses admin.html; main build uses index.html (default)
      ...(isAdminBuild ? { input: path.resolve(__dirname, 'admin.html') } : {}),

      output: {
        manualChunks: {
          "motion-vendor":   ["framer-motion"],
          "ui-vendor":       ["lucide-react", "clsx", "tailwind-merge"],
          "supabase-vendor": ["@supabase/supabase-js", "react-router-dom"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },

  // Pre-bundle these for faster dev server startup
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "react-helmet-async"],
  },
});
