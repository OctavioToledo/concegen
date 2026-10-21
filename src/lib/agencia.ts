// Config de la agencia validada contra el esquema, más el tema derivado.
// Corre en el build: si algo no cierra, el build falla o avisa.

import { agencia as config } from '../config/agencia';
import { AgenciaSchema, type Agencia } from '../schema/agencia';
import { chequearContraste, derivarTema, temaACss } from './tema';

function validar(): Agencia {
  const r = AgenciaSchema.safeParse(config);
  if (!r.success) {
    const detalle = r.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`La config de la agencia (src/config/agencia.ts) tiene errores:\n${detalle}`);
  }
  return r.data;
}

export const agencia = validar();

export const tema = derivarTema(agencia.colores);
export const temaCss = temaACss(tema);

for (const aviso of chequearContraste(tema)) {
  console.warn(`[tema] Contraste bajo: ${aviso.par} da ${aviso.valor}:1 (mínimo ${aviso.minimo}:1)`);
}

/** URL absoluta dentro del sitio. */
export const absoluta = (ruta: string) => new URL(ruta, agencia.sitio.url).href;

/** Destinos del menú, según las secciones activas. */
export function destinos() {
  return [
    { href: '/stock', texto: 'Stock' },
    agencia.secciones.financiacion && { href: '/financiacion', texto: 'Financiación' },
    agencia.secciones.tomaUsados && { href: '/tomamos-tu-usado', texto: 'Tomamos tu usado' },
    { href: '/la-agencia', texto: 'La agencia' },
    { href: '/contacto', texto: 'Contacto' },
  ].filter(Boolean) as { href: string; texto: string }[];
}
