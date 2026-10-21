// Links de WhatsApp. `whatsappUrl` también se usa en el navegador (formularios y stock vacío).

import { mensajes } from '../config/mensajes';
import type { Auto } from '../schema/auto';
import { nombreCompleto } from './etiquetas';

export function whatsappUrl(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export type MotivoFicha = 'consulta' | 'financiacion' | 'test_drive' | 'similar';

/** Mensajes de la ficha, armados en el build con la URL absoluta del auto. */
export function mensajeFicha(auto: Auto, link: string, motivo: MotivoFicha): string {
  const d = { auto: nombreCompleto(auto), link };
  switch (motivo) {
    case 'consulta': return mensajes.fichaConsulta(d);
    case 'financiacion': return mensajes.fichaFinanciacion(d);
    case 'test_drive': return mensajes.fichaTestDrive(d);
    case 'similar': return mensajes.fichaVendida(d);
  }
}
