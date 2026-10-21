import { z } from 'astro/zod';

export const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color en formato #RRGGBB');
const hora = z.string().regex(/^\d{2}:\d{2}$/, 'Hora en formato HH:MM');

export const AgenciaSchema = z.object({
  nombre: z.string().min(1),
  eslogan: z.string().min(1),
  ciudad: z.string().min(1),                       // 'San Martín, Mendoza'
  logo: z.object({ src: z.string(), alt: z.string() }).nullable(), // null: el nombre se compone con la tipografía
  colores: z.object({ primario: hex, acento: hex, fondo: hex }),
  contacto: z.object({
    whatsapp: z.string().regex(/^549\d{8,11}$/, 'Solo dígitos: 54 9 + área + número'),
    telefono: z.string(),                          // como se muestra
    email: z.email().nullable(),
    direccion: z.string(),
    mapsUrl: z.url(),
  }),
  horarios: z.array(z.object({
    dias: z.array(z.enum(DIAS)).min(1),
    franjas: z.array(z.tuple([hora, hora])).min(1), // admite horario cortado
  })),
  zonaHoraria: z.string(),                         // 'America/Argentina/Mendoza'
  redes: z.object({
    instagram: z.url().optional(),
    facebook: z.url().optional(),
    tiktok: z.url().optional(),
  }),
  moneda: z.object({
    porDefecto: z.enum(['ARS', 'USD']),
    cotizacionReferencia: z.number().positive(),   // ARS por 1 USD; solo para filtrar y ordenar
  }),
  secciones: z.object({
    financiacion: z.boolean(),
    tomaUsados: z.boolean(),
    ceroKm: z.boolean(),
    testimonios: z.boolean(),                      // false en la demo
  }),
  hero: z.union([
    z.object({ tipo: z.literal('auto'), autoId: z.string() }),
    z.object({ tipo: z.literal('foto'), src: z.string(), alt: z.string() }),
  ]),
  financiacion: z.object({ cuotas: z.array(z.number().int().positive()), requisitos: z.array(z.string()) }),
  laAgencia: z.object({
    historia: z.array(z.string()),                 // párrafos
    fotoLocal: z.string().nullable(),
    fundacion: z.number().int().nullable(),        // null en la demo: no inventamos trayectoria
  }),
  testimonios: z.array(z.object({ nombre: z.string(), texto: z.string() })), // vacío en la demo
  sitio: z.object({ url: z.url(), indexar: z.boolean(), creditoDevott: z.boolean() }),
  analitica: z.object({
    proveedor: z.enum(['umami', 'plausible', 'ga4', 'ninguno']),
    id: z.string(),
  }),
});

export type Agencia = z.infer<typeof AgenciaSchema>;
export type Dia = (typeof DIAS)[number];
