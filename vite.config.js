import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  server: { watch: { ignored: ['**/tmp/**', '**/.npm-cache/**'] } },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks(id) {
      if (id.includes('/src/data/chapters-')) return 'course-content';
      if (id.includes('/node_modules/react')) return 'react-vendor';
    } } }
  }
});
