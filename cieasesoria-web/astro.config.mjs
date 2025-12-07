import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Required for Sitemap generation
  site: 'https://cieasesoria.com',

  // Optimización para Nginx (Static)
  output: 'static',

  build: {
    // Genera carpetas tipo: /noticias/index.html en lugar de /noticias.html
    // Esto es ideal para "pretty URLs" en Nginx sin configuración extra.
    format: 'directory',
  },

  // Configuración de servidor de desarrollo (opcional)
  server: {
    port: 4321,
    host: true
  },

  integrations: [
    tailwind(),
    sitemap()
  ]
});