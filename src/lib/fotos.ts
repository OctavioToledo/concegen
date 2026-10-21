// Rutas del stock y de la agencia → imágenes que optimiza Astro.

import type { ImageMetadata } from 'astro';

const deAutos = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/autos/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);
const deAgencia = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/agencia/**/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true },
);

/** Una foto del stock: ruta relativa a src/assets/autos/ o URL https. */
export function fotoAuto(src: string): ImageMetadata | string | undefined {
  if (/^https:\/\//.test(src)) return src;
  return deAutos[`/src/assets/autos/${src}`]?.default;
}

/** Una imagen de la agencia: ruta relativa a src/assets/. */
export function fotoAgencia(src: string): ImageMetadata | string | undefined {
  if (/^https:\/\//.test(src)) return src;
  return deAgencia[`/src/assets/${src}`]?.default;
}

/** Ruta en disco, para el armado de las imágenes Open Graph. */
export const rutaDiscoAuto = (src: string) => `src/assets/autos/${src}`;

/** Anchos y `sizes` comunes. */
export const ANCHOS = [360, 540, 720, 960, 1200, 1440];
export const SIZES = {
  tarjeta: '(min-width: 1200px) 380px, (min-width: 900px) 30vw, (min-width: 600px) 45vw, 100vw',
  ficha: '(min-width: 900px) 58vw, 100vw',
  hero: '(min-width: 900px) 60vw, 100vw',
  carrusel: '(min-width: 900px) 300px, 78vw',
};
