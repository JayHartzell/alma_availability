import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/alma-availability.js',
      name: 'AlmaAvailability',
      formats: ['umd'],
      fileName: () => 'alma-availability.js'
    },
    outDir: 'dist',
    minify: 'terser'
  }
});
