import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import fs from 'fs';
import path from 'path';

// Check if certificates exist for local HTTPS
const certsPath = './certs';
const keyPath = path.join(certsPath, 'cieasesoria.test+3-key.pem');
const certPath = path.join(certsPath, 'cieasesoria.test+3.pem');
const hasLocalCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

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

  // i18n configuration
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'de'],
    routing: {
      prefixDefaultLocale: false
    }
  },

  build: {
    // Genera carpetas tipo: /noticias/index.html en lugar de /noticias.html
    // Esto es ideal para "pretty URLs" en Nginx sin configuración extra.
    format: 'directory',
    // Inline small CSS to reduce render-blocking requests
    inlineStylesheets: 'auto',
  },

  // Configuración de servidor de desarrollo
  server: {
    port: 4321,
    host: true
  },

  // Vite config for HTTPS and custom allowed hosts
  vite: {
    server: {
      allowedHosts: ['cieasesoria.test', 'www.cieasesoria.test', 'localhost'],
      // Enable HTTPS if certificates are available
      ...(hasLocalCerts && {
        https: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        }
      })
    }
  },

  integrations: [
    tailwind(),
    sitemap()
  ]
});