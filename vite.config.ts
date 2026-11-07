import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

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

function devApiEmailPlugin(env: Record<string, string>) {
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
            // Ensure RESEND_API_KEY from .env is available in process.env and payload for dev handler
            process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || env.RESEND_API_KEY || env.VITE_RESEND_API_KEY;
            process.env.VITE_ADMIN_NOTIFICATION_EMAIL = process.env.VITE_ADMIN_NOTIFICATION_EMAIL || env.VITE_ADMIN_NOTIFICATION_EMAIL;

            const fakeReq = {
              method: 'POST',
              body: {
                ...json,
                resendApiKey: json.resendApiKey || process.env.RESEND_API_KEY,
                adminEmail: json.adminEmail || process.env.VITE_ADMIN_NOTIFICATION_EMAIL || 'zentra.techofficial@gmail.com',
              },
              headers: req.headers,
            };
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      devApiEmailPlugin(env),
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
  };
});
