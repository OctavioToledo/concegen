// Colores derivados de los tres de la config, calculados en el build.
// Mezclas en OKLab y chequeo de contraste WCAG.

type RGB = [number, number, number]; // 0..1, sRGB

const ASFALTO = '#1B2129';
const NIEVE = '#F3F5F7';
const BLANCO = '#FFFFFF';

export function hexARgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbAHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

const aLineal = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const aGamma = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);

function aOklab(rgb: RGB): RGB {
  const [r, g, b] = rgb.map(aLineal);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function desdeOklab([L, a, b]: RGB): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(aGamma) as RGB;
}

/** Mezcla `b` sobre `a` en la proporción `t` (0 = a, 1 = b), en OKLab. */
export function mezclar(a: string, b: string, t: number): string {
  const A = aOklab(hexARgb(a));
  const B = aOklab(hexARgb(b));
  return rgbAHex(desdeOklab([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t) as RGB));
}

export function luminancia(hex: string): number {
  const [r, g, b] = hexARgb(hex).map(aLineal);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const esClaro = (hex: string) => luminancia(hex) > 0.4;

/** El texto que más contrasta sobre `fondo`: blanco o la tinta. */
function textoSobre(fondo: string, tinta: string): string {
  return contraste(BLANCO, fondo) >= contraste(tinta, fondo) ? BLANCO : tinta;
}

export type Colores = { primario: string; acento: string; fondo: string };
export type Tema = Record<string, string>;

export function derivarTema(c: Colores): Tema {
  const claro = esClaro(c.fondo);
  // Si el primario es casi negro (o casi blanco sobre fondo oscuro), es también el color del texto.
  const tinta = contraste(c.primario, c.fondo) >= 12 ? c.primario.toUpperCase() : claro ? ASFALTO : NIEVE;
  const superficie = claro ? BLANCO : mezclar(c.fondo, BLANCO, 0.06);

  // Tinta suave: mezcla al 35 % hacia el fondo, y se acerca a la tinta hasta llegar a 4,5:1
  // contra el fondo y contra la superficie.
  let t = 0.35;
  let suave = mezclar(tinta, c.fondo, t);
  while ((contraste(suave, c.fondo) < 4.5 || contraste(suave, superficie) < 4.5) && t > 0) {
    t -= 0.01;
    suave = mezclar(tinta, c.fondo, t);
  }

  const foco = contraste(c.primario, c.fondo) >= 3 ? c.primario : tinta;

  return {
    '--c-fondo': c.fondo.toUpperCase(),
    '--c-superficie': superficie,
    '--c-tinta': tinta,
    '--c-tinta-suave': suave,
    '--c-borde': mezclar(c.fondo, tinta, 0.14),
    // Banda alternativa, un paso arriba del fondo.
    '--c-banda': mezclar(c.fondo, tinta, 0.055),
    '--c-primario': c.primario.toUpperCase(),
    '--c-primario-texto': textoSobre(c.primario, tinta === NIEVE ? ASFALTO : tinta),
    '--c-primario-suave': mezclar(c.fondo, c.primario, 0.08),
    // Para la franja superior, el footer y los velos sobre fotos.
    '--c-primario-oscuro': mezclar(c.primario, '#000000', 0.45),
    '--c-acento': c.acento.toUpperCase(),
    '--c-acento-texto': textoSobre(c.acento, tinta === NIEVE ? ASFALTO : tinta),
    '--c-foco': foco,
  };
}

export type Aviso = { par: string; valor: number; minimo: number };

/** Revisa los pares de texto (4,5:1) y de interfaz (3:1). Devuelve los que no llegan. */
export function chequearContraste(tema: Tema): Aviso[] {
  const v = (k: string) => tema[k];
  const pares: [string, string, string, number][] = [
    ['tinta sobre fondo', v('--c-tinta'), v('--c-fondo'), 4.5],
    ['tinta sobre superficie', v('--c-tinta'), v('--c-superficie'), 4.5],
    ['tinta suave sobre fondo', v('--c-tinta-suave'), v('--c-fondo'), 4.5],
    ['tinta suave sobre superficie', v('--c-tinta-suave'), v('--c-superficie'), 4.5],
    ['texto sobre primario', v('--c-primario-texto'), v('--c-primario'), 4.5],
    ['texto sobre acento', v('--c-acento-texto'), v('--c-acento'), 4.5],
    ['tinta sobre primario suave', v('--c-tinta'), v('--c-primario-suave'), 4.5],
    ['foco contra fondo', v('--c-foco'), v('--c-fondo'), 3],
    ['primario contra fondo (chips activos)', v('--c-primario'), v('--c-fondo'), 3],
    ['blanco sobre primario oscuro', '#FFFFFF', v('--c-primario-oscuro'), 4.5],
  ];
  return pares
    .map(([par, a, b, minimo]) => ({ par, valor: Math.round(contraste(a, b) * 100) / 100, minimo }))
    .filter((p) => p.valor < p.minimo);
}

export function temaACss(tema: Tema): string {
  return `:root{${Object.entries(tema).map(([k, v]) => `${k}:${v}`).join(';')}}`;
}
