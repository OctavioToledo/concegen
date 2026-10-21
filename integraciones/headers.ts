// Genera dist/_headers (y dist/_redirects) para Cloudflare Pages desde la config.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { agencia } from '../src/config/agencia';

export default function headers(): AstroIntegration {
  return {
    name: 'devott-headers',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const global = [
          'X-Content-Type-Options: nosniff',
          'Referrer-Policy: strict-origin-when-cross-origin',
          'X-Frame-Options: SAMEORIGIN',
          'Permissions-Policy: camera=(), microphone=(), geolocation=()',
        ];
        if (!agencia.sitio.indexar) global.push('X-Robots-Tag: noindex');

        const reglas = [
          ['/*', global],
          ['/_astro/*', ['Cache-Control: public, max-age=31536000, immutable']],
          ['/og/*', ['Cache-Control: public, max-age=31536000, immutable']],
          ['/fonts/*', ['Cache-Control: public, max-age=31536000, immutable']],
        ] as const;
        const texto = reglas.map(([ruta, lineas]) => `${ruta}\n${lineas.map((l) => `  ${l}`).join('\n')}`).join('\n\n');
        writeFileSync(fileURLToPath(new URL('_headers', dir)), `${texto}\n`);

        // Una sección apagada redirige a la home.
        const apagadas = [
          !agencia.secciones.financiacion && '/financiacion',
          !agencia.secciones.tomaUsados && '/tomamos-tu-usado',
        ].filter(Boolean);
        if (apagadas.length) {
          writeFileSync(fileURLToPath(new URL('_redirects', dir)), apagadas.map((r) => `${r} / 302`).join('\n') + '\n');
        }
        logger.info(`_headers generado (indexar: ${agencia.sitio.indexar})`);
      },
    },
  };
}
