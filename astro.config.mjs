// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import headers from './integraciones/headers';
import { agencia } from './src/config/agencia';

export default defineConfig({
  site: agencia.sitio.url,
  trailingSlash: 'never',
  build: {
    format: 'file',
    // Un solo archivo de CSS para todo el sitio.
    inlineStylesheets: 'never',
  },
  integrations: [
    headers(),
    // Sin sitemap cuando la demo no se indexa.
    ...(agencia.sitio.indexar ? [sitemap({ filter: (url) => !url.includes('/og/') })] : []),
  ],
  image: {
    responsiveStyles: false,
  },
  devToolbar: { enabled: false },
});
