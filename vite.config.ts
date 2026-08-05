import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // NOTE: viteSingleFile removed — it prevented code splitting and
    // bundled everything into one massive file, severely hurting performance.
    // Standard Vite chunked output is used instead.
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    // Minify with esbuild (fast and effective)
    minify: "esbuild",

    // Enable CSS code splitting for better caching
    cssCodeSplit: true,

    // Target modern browsers that support ES modules
    target: "es2020",

    // Improve tree-shaking
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching:
        // - react & react-dom rarely change → long-lived cache
        // - framer-motion is large → separate chunk
        // - other vendor code in its own chunk
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "motion-vendor": ["framer-motion"],
          "ui-vendor": ["lucide-react", "clsx", "tailwind-merge"],
          "supabase-vendor": ["@supabase/supabase-js", "react-router-dom"],
        },
        // Readable chunk names in production
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    // Report compressed size (set false for faster CI builds if needed)
    reportCompressedSize: true,

    // Chunk size warning threshold (increased from default 500kb since we split)
    chunkSizeWarningLimit: 600,
  },

  // Pre-bundle these for faster dev server startup
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "react-helmet-async"],
  },

  // Enable source maps in production for debugging (optional: set to false for smaller builds)
  // sourcemap: false,
});
