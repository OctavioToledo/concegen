// Valores de los datos → texto para mostrar.

import type { Auto, Carroceria, Combustible, Transmision } from '../schema/auto';

export const combustibles: Record<Combustible, string> = {
  nafta: 'Nafta',
  diesel: 'Diésel',
  hibrido: 'Híbrido',
  electrico: 'Eléctrico',
  gnc: 'GNC',
};

export const transmisiones: Record<Transmision, string> = {
  manual: 'Manual',
  automatica: 'Automática',
};

export const carrocerias: Record<Carroceria, string> = {
  sedan: 'Sedán',
  hatchback: 'Hatchback',
  suv: 'SUV',
  pickup: 'Pick-up',
  utilitario: 'Utilitario',
  coupe: 'Coupé',
  monovolumen: 'Monovolumen',
};

/** Plural para «Por tipo»: `Pick-ups`, `SUV`, `Sedanes`. */
export const carroceriasPlural: Record<Carroceria, string> = {
  sedan: 'Sedanes',
  hatchback: 'Hatchbacks',
  suv: 'SUV',
  pickup: 'Pick-ups',
  utilitario: 'Utilitarios',
  coupe: 'Coupés',
  monovolumen: 'Monovolúmenes',
};

export const condiciones = { '0km': '0 km', usado: 'Usado' } as const;
export const estados = { disponible: 'Disponible', reservado: 'Reservado', vendido: 'Vendido' } as const;

/** «Diésel, automática» */
export const resumenMecanico = (a: Pick<Auto, 'combustible' | 'transmision'>) =>
  `${combustibles[a.combustible]}, ${transmisiones[a.transmision].toLowerCase()}`;

/** «Toyota Hilux» */
export const nombre = (a: Pick<Auto, 'marca' | 'modelo'>) => `${a.marca} ${a.modelo}`;

/** «Toyota Hilux 2.8 TDI SRX 4x4 AT 2022», como se nombra en los mensajes. */
export const nombreCompleto = (a: Pick<Auto, 'marca' | 'modelo' | 'version' | 'anio'>) =>
  [a.marca, a.modelo, a.version, String(a.anio)].filter(Boolean).join(' ');

/** Slug para marcas y modelos en la URL de filtros. */
export const slugTexto = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
