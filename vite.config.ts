import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig(({ command, mode }) => {
  const isAnalyze = process.env.ANALYZE === 'true';
  const isProduction = mode === 'production';

  const plugins = [dyadComponentTagger(), react()];

  // Add bundle analysis plugins when needed
  if (isAnalyze) {
    plugins.push(
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // 'treemap', 'sunburst', 'network'
      }),
      analyzer({
        analyzerMode: 'server',
        openAnalyzer: true,
      })
    );
  }

  return {
    server: {
      host: "::",
      port: 8000, // Updated to match project memory
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Enhanced build configuration for better analysis
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better analysis
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
            'query-vendor': ['@tanstack/react-query'],
            'animation-vendor': ['react-spring', '@use-gesture/react'],
            'supabase-vendor': ['@supabase/supabase-js'],
          },
        },
      },
      // Target bundle size thresholds
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true,
    },
    // Performance optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'react-spring',
        '@use-gesture/react',
      ],
    },
  };
});
