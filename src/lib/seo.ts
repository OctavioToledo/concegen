// Meta, canonical, Open Graph y JSON-LD. Solo con datos de la config y del stock.

import { createHash } from 'node:crypto';
import type { Auto } from '../schema/auto';
import { agencia, absoluta } from './agencia';
import { autoHero } from './stock';
import { combustibles, nombreCompleto, transmisiones } from './etiquetas';
import { km, precio } from './formato';

const hash = (datos: unknown) => createHash('sha1').update(JSON.stringify(datos)).digest('hex').slice(0, 8);

/** El nombre incluye un hash de precio, estado y foto: WhatsApp no reutiliza una imagen vieja. */
export const archivoOgAuto = (a: Auto) =>
  `${a.slug}-${hash([a.precio, a.moneda, a.estado, a.fotos[0].src, a.anio, a.km])}`;

export function archivoOgGeneral() {
  const hero = autoHero();
  return `agencia-${hash([agencia.nombre, agencia.colores, agencia.hero, hero?.fotos[0].src])}`;
}

export const ogImagenAuto = (a: Auto) => absoluta(`/og/${archivoOgAuto(a)}.jpg`);
export const ogImagenGeneral = () => absoluta(`/og/${archivoOgGeneral()}.jpg`);

/** «Toyota Hilux 2.8 TDI SRX 2022, US$ 42.900» */
export function tituloAuto(a: Auto): string {
  const base = nombreCompleto(a);
  if (a.estado === 'vendido') return `${base}, vendido`;
  return a.precio === null ? base : `${base}, ${precio(a.precio, a.moneda)}`;
}

/** «52.000 km, diésel, automática. Andino Autos, San Martín, Mendoza.» */
export function descripcionAuto(a: Auto): string {
  const partes = [
    a.condicion === '0km' ? '0 km' : km(a.km),
    combustibles[a.combustible].toLowerCase(),
    transmisiones[a.transmision].toLowerCase(),
  ];
  return `${partes.join(', ')}. ${agencia.nombre}, ${agencia.ciudad}.`;
}

export function jsonLdAuto(a: Auto, url: string, imagen: string) {
  const datos: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: nombreCompleto(a),
    brand: { '@type': 'Brand', name: a.marca },
    model: a.modelo,
    vehicleModelDate: String(a.anio),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: a.km, unitCode: 'KMT' },
    fuelType: combustibles[a.combustible],
    vehicleTransmission: transmisiones[a.transmision],
    color: a.color,
    itemCondition: a.condicion === '0km' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
    image: imagen,
    url,
    description: a.descripcion,
  };
  if (a.precio !== null && a.estado !== 'vendido') {
    datos.offers = {
      '@type': 'Offer',
      price: a.precio,
      priceCurrency: a.moneda,
      availability: a.estado === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability',
      seller: { '@type': 'AutoDealer', name: agencia.nombre },
    };
  }
  return datos;
}

const DIAS_SCHEMA = { lun: 'Monday', mar: 'Tuesday', mie: 'Wednesday', jue: 'Thursday', vie: 'Friday', sab: 'Saturday', dom: 'Sunday' } as const;

export function jsonLdAgencia() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: agencia.nombre,
    url: agencia.sitio.url,
    telephone: `+${agencia.contacto.whatsapp}`,
    email: agencia.contacto.email ?? undefined,
    address: { '@type': 'PostalAddress', streetAddress: agencia.contacto.direccion, addressCountry: 'AR' },
    image: ogImagenGeneral(),
    openingHoursSpecification: agencia.horarios.flatMap((h) =>
      h.franjas.map(([opens, closes]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.dias.map((d) => DIAS_SCHEMA[d]),
        opens,
        closes,
      })),
    ),
    sameAs: Object.values(agencia.redes).filter(Boolean),
  };
}
