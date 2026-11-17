import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'extension-public',
  build: {
    target: 'es2022',
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'extension/popup.html',
        background: 'src/extension/background.ts',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunk-[name].js',
        assetFileNames: 'asset-[name][extname]',
      },
    },
  },
});
