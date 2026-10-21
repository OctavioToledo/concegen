// Única puerta a los datos del stock. Los componentes nunca importan data/autos.ts.
// El día que llegue el panel con base de datos, cambia el interior de estas funciones.

import { autos as datos } from '../data/autos';
import { AutoSchema, type Auto, type Carroceria, type Moneda } from '../schema/auto';
import { agencia } from './agencia';
import { fotoAuto } from './fotos';
import { slugTexto } from './etiquetas';

function validar(): Auto[] {
  const errores: string[] = [];
  const avisos: string[] = [];
  const autos: Auto[] = [];

  for (const [i, crudo] of datos.entries()) {
    const r = AutoSchema.safeParse(crudo);
    if (!r.success) {
      const id = (crudo as { id?: string }).id ?? `posición ${i}`;
      for (const issue of r.error.issues) errores.push(`${id}: ${issue.path.join('.')}: ${issue.message}`);
      continue;
    }
    autos.push(r.data);
  }

  const vistos = { id: new Set<string>(), slug: new Set<string>() };
  for (const a of autos) {
    if (vistos.id.has(a.id)) errores.push(`id repetido: ${a.id}`);
    if (vistos.slug.has(a.slug)) errores.push(`slug repetido: ${a.slug}`);
    vistos.id.add(a.id);
    vistos.slug.add(a.slug);

    if (a.condicion === '0km' && a.km > 100) avisos.push(`${a.id}: es 0 km y tiene ${a.km} km`);
    if (a.estado === 'vendido' && a.destacado) errores.push(`${a.id}: está vendido y destacado a la vez`);
    if (a.condicion === '0km' && !agencia.secciones.ceroKm) avisos.push(`${a.id}: es 0 km y el switch ceroKm está apagado`);
    for (const f of a.fotos) {
      if (!fotoAuto(f.src)) errores.push(`${a.id}: no existe la foto src/assets/autos/${f.src}`);
    }
  }

  for (const aviso of avisos) console.warn(`[stock] ${aviso}`);
  if (errores.length) throw new Error(`El stock (src/data/autos.ts) tiene errores:\n  - ${errores.join('\n  - ')}`);
  return autos;
}

const stock = validar();

const ORDEN_ESTADO = { disponible: 0, reservado: 1, vendido: 2 } as const;

/** Recomendados: disponibles, reservados y vendidos; dentro de cada grupo, destacados y más recientes primero. */
export function compararRecomendados(a: Auto, b: Auto): number {
  return (
    ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado] ||
    Number(b.destacado) - Number(a.destacado) ||
    b.fechaIngreso.localeCompare(a.fechaIngreso)
  );
}

/** El stock visible, en orden Recomendados. Sin 0 km si la sección está apagada. */
export function todos(): Auto[] {
  return stock
    .filter((a) => agencia.secciones.ceroKm || a.condicion !== '0km')
    .sort(compararRecomendados);
}

export const porSlug = (slug: string) => todos().find((a) => a.slug === slug);
export const porId = (id: string) => todos().find((a) => a.id === id);

export const disponibles = () => todos().filter((a) => a.estado !== 'vendido');

export function destacados(): Auto[] {
  return todos().filter((a) => a.destacado && a.estado !== 'vendido');
}

/** El auto del hero; si está vendido o no existe, el primer destacado disponible. */
export function autoHero(): Auto | undefined {
  if (agencia.hero.tipo !== 'auto') return undefined;
  const elegido = porId(agencia.hero.autoId);
  if (elegido && elegido.estado !== 'vendido') return elegido;
  const reemplazo = destacados().find((a) => a.estado === 'disponible') ?? disponibles()[0];
  console.warn(`[stock] El auto del hero (${agencia.hero.autoId}) no está disponible. Se usa ${reemplazo?.id ?? 'ninguno'}.`);
  return reemplazo;
}

/** Precio llevado a pesos con la cotización de referencia. Solo para filtrar y ordenar. */
export function precioComparable(a: Pick<Auto, 'precio' | 'moneda'>): number | null {
  if (a.precio === null) return null;
  return a.moneda === 'USD' ? a.precio * agencia.moneda.cotizacionReferencia : a.precio;
}

/** Autos parecidos: carrocería (2), precio ±20 % (2), marca (1). Sin el propio ni vendidos. */
export function parecidos(auto: Auto, cantidad = 4): Auto[] {
  const base = precioComparable(auto);
  return disponibles()
    .filter((a) => a.id !== auto.id)
    .map((a) => {
      const p = precioComparable(a);
      let puntos = 0;
      if (a.carroceria === auto.carroceria) puntos += 2;
      if (base !== null && p !== null && Math.abs(p - base) <= base * 0.2) puntos += 2;
      if (a.marca === auto.marca) puntos += 1;
      return { a, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((x, y) => y.puntos - x.puntos || compararRecomendados(x.a, y.a))
    .slice(0, cantidad)
    .map((x) => x.a);
}

/** Cantidad de autos no vendidos por carrocería, solo las que tienen alguno. */
export function conteoPorCarroceria(): { carroceria: Carroceria; cantidad: number }[] {
  const conteo = new Map<Carroceria, number>();
  for (const a of disponibles()) conteo.set(a.carroceria, (conteo.get(a.carroceria) ?? 0) + 1);
  return [...conteo].map(([carroceria, cantidad]) => ({ carroceria, cantidad })).sort((x, y) => y.cantidad - x.cantidad);
}

/** Marcas con sus modelos, para los selects. */
export function marcasYModelos() {
  const marcas = new Map<string, { slug: string; nombre: string; modelos: Map<string, string> }>();
  for (const a of todos()) {
    const slug = slugTexto(a.marca);
    if (!marcas.has(slug)) marcas.set(slug, { slug, nombre: a.marca, modelos: new Map() });
    marcas.get(slug)!.modelos.set(slugTexto(a.modelo), a.modelo);
  }
  return [...marcas.values()]
    .sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'))
    .map((m) => ({
      slug: m.slug,
      nombre: m.nombre,
      modelos: [...m.modelos].map(([slug, nombre]) => ({ slug, nombre })).sort((x, y) => x.nombre.localeCompare(y.nombre, 'es')),
    }));
}

export function rangoAnios(): [number, number] {
  const anios = todos().map((a) => a.anio);
  return [Math.min(...anios), Math.max(...anios)];
}

/** Escalones redondos de precio en la moneda pedida, calculados del stock. */
export function escalonesPrecio(moneda: Moneda): number[] {
  const cot = agencia.moneda.cotizacionReferencia;
  const valores = todos()
    .map(precioComparable)
    .filter((p): p is number => p !== null)
    .map((p) => (moneda === 'USD' ? p / cot : p));
  if (!valores.length) return [];
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const paso = pasoRedondo((max - min) / 6);
  const escalones: number[] = [];
  for (let v = Math.floor(min / paso) * paso; v <= max + paso; v += paso) if (v > 0) escalones.push(v);
  return escalones;
}

function pasoRedondo(bruto: number): number {
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const n = bruto / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

export const ESCALONES_KM = [10000, 30000, 50000, 80000, 100000, 150000];
