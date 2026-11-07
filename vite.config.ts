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

function devApiEmailPlugin() {
  return {
    name: 'dev-api-email-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/send-order-email', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const json = JSON.parse(body || '{}');
            const fakeReq = { method: 'POST', body: json, headers: req.headers };
            const fakeRes = {
              statusCode: 200,
              setHeader(k: string, v: string) { res.setHeader(k, v); },
              status(code: number) { res.statusCode = code; return this; },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              },
              end() { res.end(); }
            };
            const { default: handler } = await import('./api/send-order-email');
            await handler(fakeReq, fakeRes);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devApiEmailPlugin(),
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
