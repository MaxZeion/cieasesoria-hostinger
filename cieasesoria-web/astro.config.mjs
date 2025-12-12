import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // Required for Sitemap generation
  site: 'https://cieasesoria.com',

  // Hybrid: Static pages + SSR for API routes
  output: 'hybrid',

  // Node adapter for SSR
  adapter: node({
    mode: 'standalone'
  }),

  build: {
    // Genera carpetas tipo: /noticias/index.html en lugar de /noticias.html
    // Esto es ideal para "pretty URLs" en Nginx sin configuración extra.
    format: 'directory',
    // Inline small CSS to reduce render-blocking requests
    inlineStylesheets: 'auto',
  },

  // Configuración de servidor de desarrollo (opcional)
  server: {
    port: 4321,
    host: true
  },

  // Vite config for custom allowed hosts
  vite: {
    server: {
      allowedHosts: ['cieasesoria.test', 'www.cieasesoria.test']
    }
  },

  integrations: [
    tailwind(),
    sitemap()
  ]
});