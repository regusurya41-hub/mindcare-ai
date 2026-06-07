import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite configuration — MindCare AI
 *
 * Env-aware: reads .env, .env.local, .env.[mode], .env.[mode].local
 * Run modes:
 *   dev  → vite
 *   prod → vite build
 *   preview → vite preview
 */
export default defineConfig(({ mode }) => {
  // Expose all VITE_* variables to this config file
  const env = loadEnv(mode, process.cwd(), '');
  const isDev  = mode === 'development';
  const isProd = mode === 'production';

  return {

    /* ──────────────────────────────────────────
       Plugins
    ────────────────────────────────────────── */
    plugins: [
      react({
        // Babel fast-refresh is on by default in dev.
        // In prod, remove prop-types to shrink bundle.
        babel: isProd
          ? { plugins: ['transform-react-remove-prop-types'] }
          : undefined,
      }),
    ],

    /* ──────────────────────────────────────────
       Path aliases
       Import '@/components/Foo' instead of
       '../../components/Foo' anywhere in the tree.
    ────────────────────────────────────────── */
    resolve: {
      alias: {
        '@':         resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages':    resolve(__dirname, 'src/pages'),
        '@context':  resolve(__dirname, 'src/context'),
        '@hooks':    resolve(__dirname, 'src/hooks'),
        '@utils':    resolve(__dirname, 'src/utils'),
        '@assets':   resolve(__dirname, 'src/assets'),
        '@styles':   resolve(__dirname, 'src/styles'),
      },
    },

    /* ──────────────────────────────────────────
       Dev server
    ────────────────────────────────────────── */
    server: {
      port:        5173,
      strictPort:  false,   // try next free port if 5173 is taken
      open:        false,   // set true to auto-open browser
      cors:        true,

      // Proxy API calls in dev so you never hard-code the backend URL
      proxy: env.VITE_API_URL
        ? {
            '/api': {
              target:      env.VITE_API_URL,
              changeOrigin: true,
              secure:      false,
              rewrite:     (path) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },

    /* ──────────────────────────────────────────
       Preview server (vite preview)
    ────────────────────────────────────────── */
    preview: {
      port:       4173,
      strictPort: false,
    },

    /* ──────────────────────────────────────────
       Build
    ────────────────────────────────────────── */
    build: {
      target:         'es2020',     // modern browsers — no legacy polyfills
      outDir:         'dist',
      assetsDir:      'assets',
      sourcemap:      isDev,        // source maps in dev; skip in prod for smaller output
      minify:         'esbuild',    // fastest; swap to 'terser' for max compression
      cssMinify:      true,
      reportCompressedSize: false,  // disable gzip reporting — speeds up build ~15 %

      // Warn when any single chunk exceeds 600 kB (gzipped it'll be ~200 kB)
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {

          // Fine-grained manual chunks — each loaded only when needed
          manualChunks(id) {
            // ── Vendor: React core ──
            if (id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/scheduler/')) {
              return 'vendor-react';
            }

            // ── Vendor: Routing ──
            if (id.includes('node_modules/react-router') ||
                id.includes('node_modules/@remix-run/')) {
              return 'vendor-router';
            }

            // ── Vendor: Animation ──
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }

            // ── Vendor: Charts ──
            if (id.includes('node_modules/recharts') ||
                id.includes('node_modules/d3-') ||
                id.includes('node_modules/victory')) {
              return 'vendor-charts';
            }

            // ── Vendor: Markdown / editor ──
            if (id.includes('node_modules/react-markdown') ||
                id.includes('node_modules/remark') ||
                id.includes('node_modules/rehype') ||
                id.includes('node_modules/unified') ||
                id.includes('node_modules/micromark')) {
              return 'vendor-markdown';
            }

            // ── Vendor: UI utilities ──
            if (id.includes('node_modules/react-hot-toast') ||
                id.includes('node_modules/@radix-ui') ||
                id.includes('node_modules/lucide-react') ||
                id.includes('node_modules/clsx') ||
                id.includes('node_modules/tailwind-merge')) {
              return 'vendor-ui';
            }

            // ── Vendor: Remaining node_modules ──
            // Everything else in node_modules goes into a shared vendor chunk
            // so it's cached separately from your own code.
            if (id.includes('node_modules/')) {
              return 'vendor-misc';
            }

            // App code splits automatically by Rollup (no return → default)
          },

          // Stable, human-readable filenames for long-term caching
          chunkFileNames:  'assets/js/[name]-[hash].js',
          entryFileNames:  'assets/js/[name]-[hash].js',
          assetFileNames:  ({ name = '' }) => {
            if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
              return 'assets/img/[name]-[hash][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            if (/\.css$/i.test(name)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },

    /* ──────────────────────────────────────────
       CSS
    ────────────────────────────────────────── */
    css: {
      devSourcemap: isDev,
      modules: {
        // CSS Modules (*.module.css) use camelCase class names
        localsConvention: 'camelCaseOnly',
      },
    },

    /* ──────────────────────────────────────────
       Static asset inlining threshold
       Files ≤ 4 kB are inlined as base64 data URLs.
       Files > 4 kB are emitted as separate files (cache-friendly).
    ────────────────────────────────────────── */
    assetsInlineLimit: 4096,

    /* ──────────────────────────────────────────
       Env variable prefix
       Only VITE_* vars are exposed to client code.
    ────────────────────────────────────────── */
    envPrefix: 'VITE_',

    /* ──────────────────────────────────────────
       Dependency pre-bundling
       Explicitly listed deps are pre-bundled on first dev
       server start for instant HMR warm-up.
    ────────────────────────────────────────── */
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'framer-motion',
        'react-hot-toast',
      ],
      // Force re-bundle if you add monorepo/linked packages
      // exclude: [],
    },

    /* ──────────────────────────────────────────
       esbuild transform options
    ────────────────────────────────────────── */
    esbuild: {
      // Strip console.* and debugger in production
      drop: isProd ? ['console', 'debugger'] : [],
      // Legal comments: none in prod (saves a few bytes)
      legalComments: isProd ? 'none' : 'inline',
    },
  };
});