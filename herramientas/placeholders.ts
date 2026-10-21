// Genera fotos placeholder: la silueta de la carrocería sobre superficie.
// Uso: node herramientas/placeholders.ts
// Solo escribe las fotos que faltan, así que nunca pisa una foto real.

import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { autos } from '../src/data/autos.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANCHO = 1600;
const ALTO = 1200;

type Silueta = { cuerpo: string; vidrio: string; ruedas: [number, number]; r: number; extra?: string };

const siluetas: Record<string, Silueta> = {
  sedan: {
    cuerpo: 'M18 128 L18 104 Q20 92 38 89 L112 80 L152 56 Q162 50 178 50 L262 50 Q278 50 290 58 L326 82 L372 88 Q384 91 384 104 L384 128 Z',
    vidrio: 'M122 80 L156 59 Q164 55 176 55 L258 55 Q270 55 280 62 L308 82 Z',
    ruedas: [92, 312], r: 22,
  },
  hatchback: {
    cuerpo: 'M30 128 L30 102 Q32 90 50 87 L118 78 L158 52 Q166 47 180 47 L300 47 Q316 47 326 60 L352 92 Q362 98 362 110 L362 128 Z',
    vidrio: 'M128 79 L162 56 Q168 52 180 52 L296 52 Q308 52 316 62 L334 84 Z',
    ruedas: [98, 302], r: 22,
  },
  suv: {
    cuerpo: 'M16 128 L16 96 Q18 84 36 80 L100 72 L138 40 Q146 34 160 34 L330 34 Q348 34 356 46 L376 74 Q386 80 386 96 L386 128 Z',
    vidrio: 'M110 72 L142 43 Q148 39 160 39 L326 39 Q340 39 346 48 L362 72 Z',
    ruedas: [92, 318], r: 24,
  },
  pickup: {
    cuerpo: 'M12 128 L12 98 Q14 86 32 82 L96 74 L130 44 Q138 38 152 38 L232 38 Q242 38 246 48 L250 74 L388 74 L390 128 Z',
    vidrio: 'M106 74 L134 47 Q140 43 152 43 L228 43 Q236 43 238 50 L241 74 Z',
    ruedas: [84, 322], r: 24,
    extra: 'M252 78 L386 78',
  },
  utilitario: {
    cuerpo: 'M20 128 L20 92 Q22 80 40 76 L84 70 L118 36 Q124 28 138 28 L370 28 Q384 28 384 42 L384 128 Z',
    vidrio: 'M94 70 L122 39 Q126 34 136 34 L170 34 L170 70 Z',
    ruedas: [90, 320], r: 22,
    extra: 'M250 40 L250 118',
  },
};
siluetas.coupe = siluetas.sedan;
siluetas.monovolumen = siluetas.suv;

// Tono de la silueta según el color de la unidad, siempre apagado.
const tonos: [RegExp, string][] = [
  [/negr/i, '#5B636C'],
  [/gris oscuro/i, '#7A838C'],
  [/gris|plata/i, '#A3ABB4'],
  [/blanc/i, '#C9CFD6'],
  [/azul/i, '#7F93A8'],
  [/roj/i, '#B08A88'],
  [/naranja/i, '#BE9F86'],
];
const tono = (color: string) => tonos.find(([re]) => re.test(color))?.[1] ?? '#A3ABB4';

function svg(carroceria: string, color: string, indice: number) {
  const s = siluetas[carroceria];
  const espejo = indice % 2 === 1;
  const escala = indice === 0 ? 3.3 : indice % 3 === 2 ? 3.7 : 3.1;
  const cx = ANCHO / 2;
  const cy = ALTO * 0.56;
  const transformar = `translate(${cx} ${cy}) scale(${espejo ? -escala : escala} ${escala}) translate(-200 -90)`;
  const fondoAlto = indice % 2 === 0 ? '#EEF1F4' : '#E9EDF1';
  const rueda = (x: number) =>
    `<circle cx="${x}" cy="128" r="${s.r}" fill="#6B747E"/><circle cx="${x}" cy="128" r="${s.r * 0.45}" fill="#D3D9DF"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${fondoAlto}"/><stop offset="0.68" stop-color="#E2E6EA"/><stop offset="1" stop-color="#D8DDE2"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#f)"/>
  <ellipse cx="${cx}" cy="${cy + 152 * escala - 90 * escala + 2}" rx="${190 * escala}" ry="${9 * escala}" fill="#C3CAD1" opacity="0.7"/>
  <g transform="${transformar}">
    <path d="${s.cuerpo}" fill="${tono(color)}"/>
    <path d="${s.vidrio}" fill="#E4E8EC" opacity="0.85"/>
    ${s.extra ? `<path d="${s.extra}" stroke="#00000022" stroke-width="2" fill="none"/>` : ''}
    ${s.ruedas.map(rueda).join('')}
  </g>
</svg>`;
}

function svgLocal() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#E6EAEE"/>
  <rect y="230" width="400" height="70" fill="#D5DBE0"/>
  <rect x="40" y="90" width="320" height="140" fill="#C3CAD2"/>
  <rect x="40" y="78" width="320" height="16" fill="#0F3B57"/>
  <rect x="62" y="112" width="120" height="96" fill="#E4E8EC"/>
  <rect x="200" y="112" width="138" height="96" fill="#E4E8EC"/>
  <rect x="200" y="160" width="138" height="2" fill="#C3CAD2"/>
  <rect x="62" y="160" width="120" height="2" fill="#C3CAD2"/>
</svg>`;
}

async function escribir(ruta: string, contenido: string) {
  if (existsSync(ruta)) return false;
  mkdirSync(dirname(ruta), { recursive: true });
  await sharp(Buffer.from(contenido)).jpeg({ quality: 82, mozjpeg: true }).toFile(ruta);
  return true;
}

let creadas = 0;
for (const auto of autos) {
  for (const [i, foto] of auto.fotos.entries()) {
    if (/^https?:/.test(foto.src)) continue;
    const ruta = join(raiz, 'src/assets/autos', foto.src);
    if (await escribir(ruta, svg(auto.carroceria, auto.color, i))) creadas++;
  }
}
if (await escribir(join(raiz, 'src/assets/agencia/local.jpg'), svgLocal())) creadas++;
console.log(`Placeholders creados: ${creadas}`);
