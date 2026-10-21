// Imagen Open Graph de 1200 × 630, generada en el build: Satori arma, resvg convierte, sharp comprime.
// Satori no lee woff2 ni fuentes variables: usa las instancias estáticas de Archivo en TTF.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import type { Auto } from '../schema/auto';
import { agencia, tema } from './agencia';
import { rutaDiscoAuto } from './fotos';
import { precio, km } from './formato';
import { combustibles, transmisiones } from './etiquetas';

const ANCHO = 1200;
const ALTO = 630;
const FOTO = 740;

const fuente = (archivo: string) => readFileSync(join(process.cwd(), 'public/fonts', archivo));
let fuentes: Parameters<typeof satori>[1]['fonts'] | undefined;
function cargarFuentes() {
  fuentes ??= [
    { name: 'Archivo', data: fuente('archivo-400.ttf'), weight: 400, style: 'normal' },
    { name: 'Archivo', data: fuente('archivo-600.ttf'), weight: 600, style: 'normal' },
    { name: 'Ancho', data: fuente('archivo-ancho-700.ttf'), weight: 700, style: 'normal' },
    { name: 'Angosto', data: fuente('archivo-angosto-800.ttf'), weight: 800, style: 'normal' },
  ];
  return fuentes;
}

type Nodo = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Nodo | string | null | false)[]): Nodo => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.filter(Boolean) },
});

async function fotoDataUri(ruta: string, ancho: number, alto: number, gris = false): Promise<string> {
  let img = sharp(join(process.cwd(), ruta)).resize(ancho, alto, { fit: 'cover' });
  if (gris) img = img.grayscale();
  const buf = await img.jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const imagen = (src: string): Nodo => ({ type: 'img', props: { src, width: FOTO, height: ALTO, style: { objectFit: 'cover' } } });

async function renderizar(arbol: Nodo): Promise<Buffer> {
  const svg = await satori(arbol as never, { width: ANCHO, height: ALTO, fonts: cargarFuentes() });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: ANCHO } }).render().asPng();
  // Liviana: WhatsApp muestra sin problemas imágenes de menos de 300 KB.
  return sharp(png).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
}

function cartel(a: Auto): Nodo {
  const vendido = a.estado === 'vendido';
  const reservado = a.estado === 'reservado';
  const [fondo, texto, rotulo] = vendido
    ? ['#1B2129', '#FFFFFF', 'Vendido']
    : reservado
      ? ['#1B2129', '#FFFFFF', 'Reservado']
      : a.condicion === '0km'
        ? [tema['--c-acento'], tema['--c-acento-texto'], '0 km']
        : [tema['--c-primario'], tema['--c-primario-texto'], 'Usado'];
  const linea = vendido ? [String(a.anio)] : a.condicion === '0km' ? [`Modelo ${a.anio}`] : [String(a.anio), km(a.km)];
  const valor = vendido ? null : a.precio === null ? 'Consultar precio' : precio(a.precio, a.moneda);
  return h('div', {
    position: 'absolute', left: 40, bottom: 40, flexDirection: 'column', background: '#FFFFFF',
    borderRadius: 3, boxShadow: '0 3px 8px rgba(0,0,0,0.3)', minWidth: 340, overflow: 'hidden',
  },
    h('div', { background: fondo, color: texto, padding: '8px 22px', fontFamily: 'Archivo', fontWeight: 600, fontSize: 26 }, rotulo),
    h('div', { flexDirection: 'column', padding: '10px 22px 18px', color: '#1B2129' },
      valor && h('div', { fontFamily: 'Angosto', fontWeight: 800, fontSize: valor.length > 14 ? 56 : 76, lineHeight: 1 }, valor),
      h('div', { fontFamily: 'Archivo', fontWeight: 600, fontSize: 26, marginTop: 8, gap: 24 }, ...linea.map((t) => h('div', {}, t))),
    ),
  );
}

function panel(arriba: Nodo[], abajo: Nodo[]): Nodo {
  return h('div', {
    width: ANCHO - FOTO, height: ALTO, flexDirection: 'column', justifyContent: 'space-between',
    padding: '56px 48px', boxSizing: 'border-box', background: tema['--c-fondo'], color: tema['--c-tinta'],
  },
    h('div', { flexDirection: 'column' }, ...arriba),
    h('div', { flexDirection: 'column' }, ...abajo),
  );
}

const firma = () => [
  h('div', { width: 64, height: 8, background: tema['--c-primario'], marginBottom: 20 }),
  h('div', { fontFamily: 'Ancho', fontWeight: 700, fontSize: 34 }, agencia.nombre),
  h('div', { fontFamily: 'Archivo', fontSize: 24, color: tema['--c-tinta-suave'], marginTop: 4 }, agencia.ciudad),
];

export async function ogAuto(a: Auto): Promise<Buffer> {
  const foto = await fotoDataUri(rutaDiscoAuto(a.fotos[0].src), FOTO, ALTO, a.estado === 'vendido');
  const arbol = h('div', { width: ANCHO, height: ALTO, background: tema['--c-fondo'] },
    h('div', { position: 'relative', width: FOTO, height: ALTO },
      imagen(foto),
      cartel(a),
    ),
    panel(
      [
        h('div', { fontFamily: 'Ancho', fontWeight: 700, fontSize: 52, lineHeight: 1.05 }, `${a.marca} ${a.modelo}`),
        h('div', { fontFamily: 'Archivo', fontSize: 28, color: tema['--c-tinta-suave'], marginTop: 12, lineHeight: 1.25 }, a.version),
        h('div', { fontFamily: 'Archivo', fontWeight: 600, fontSize: 26, marginTop: 24 },
          `${combustibles[a.combustible]}, ${transmisiones[a.transmision].toLowerCase()}`),
      ],
      firma(),
    ),
  );
  return renderizar(arbol);
}

export async function ogGeneral(fotoRuta: string | null): Promise<Buffer> {
  const foto = fotoRuta ? await fotoDataUri(fotoRuta, FOTO, ALTO) : null;
  const arbol = h('div', { width: ANCHO, height: ALTO, background: tema['--c-fondo'] },
    foto
      ? imagen(foto)
      : h('div', { width: FOTO, height: ALTO, background: tema['--c-primario'] }),
    panel(
      [h('div', { fontFamily: 'Ancho', fontWeight: 700, fontSize: 46, lineHeight: 1.1 }, agencia.eslogan)],
      firma(),
    ),
  );
  return renderizar(arbol);
}
