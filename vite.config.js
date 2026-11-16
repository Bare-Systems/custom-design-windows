import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// GitHub Pages project preview: /custom-design-windows/
// Custom domain cutover: set SITE_BASE=/ in the Pages workflow.
const paths = [
  '', 'about', 'window-treatments', 'gallery', 'reviews',
  'custom-window-treatments-faq-fort-lauderdale-', 'contact',
];

export default defineConfig({
  base: process.env.SITE_BASE || '/custom-design-windows/',
  build: {
    rollupOptions: {
      input: Object.fromEntries(paths.map(path => [
        path || 'home', resolve(process.cwd(), path, 'index.html'),
      ])),
    },
  },
});
