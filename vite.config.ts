import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

    return {
      plugins: [
        react(),
        nodePolyfills({
          protocolImports: true,
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
        'process.env.IS_DEV': JSON.stringify(mode === 'development'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          // This line is the explicit fix for the error
          'stream/web': 'stream-browserify',
        }
      },
      build: {
        outDir: 'dist',
      },
      server: {
        port: 5173,
      }
    };
});