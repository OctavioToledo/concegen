// Precios, kilómetros y fechas en es-AR. Corre en el build y en el navegador.

import type { Moneda } from '../schema/auto';

const entero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

export const numero = (n: number) => entero.format(n);

/** `US$ 42.900`, `$ 41.200.000` */
export function precio(valor: number, moneda: Moneda): string {
  return `${moneda === 'USD' ? 'US$' : '$'} ${entero.format(valor)}`;
}

/** `52.000 km` */
export const km = (n: number) => `${entero.format(n)} km`;

/** Abreviado para escalones de filtros: `$ 15 M`, `US$ 30.000`. */
export function precioCorto(valor: number, moneda: Moneda): string {
  if (moneda === 'ARS' && valor >= 1_000_000) {
    const millones = valor / 1_000_000;
    return `$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(millones)} M`;
  }
  return precio(valor, moneda);
}
