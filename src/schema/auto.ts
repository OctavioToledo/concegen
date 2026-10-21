import { z } from 'astro/zod';

export const COMBUSTIBLES = ['nafta', 'diesel', 'hibrido', 'electrico', 'gnc'] as const;
export const TRANSMISIONES = ['manual', 'automatica'] as const;
export const CARROCERIAS = [
  'sedan', 'hatchback', 'suv', 'pickup', 'utilitario', 'coupe', 'monovolumen',
] as const;
export const CONDICIONES = ['0km', 'usado'] as const;
export const MONEDAS = ['ARS', 'USD'] as const;
export const ESTADOS = ['disponible', 'reservado', 'vendido'] as const;

export const FotoSchema = z.object({
  src: z.string(),        // 'toyota-hilux-srx-2022-h7k2/01.jpg' (relativo a src/assets/autos/) o URL https
  alt: z.string().min(5), // 'Toyota Hilux SRX 2022 gris, vista delantera'
});

export const AutoSchema = z.object({
  id: z.string().min(1),                       // estable para siempre; futura clave primaria
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  marca: z.string().min(1),                    // 'Volkswagen', nunca 'VW'
  modelo: z.string().min(1),
  version: z.string(),
  anio: z.number().int().min(1950).max(2100),
  km: z.number().int().min(0),
  combustible: z.enum(COMBUSTIBLES),
  transmision: z.enum(TRANSMISIONES),
  carroceria: z.enum(CARROCERIAS),
  color: z.string(),
  condicion: z.enum(CONDICIONES),
  precio: z.number().positive().nullable(),    // null = «Consultar precio»
  moneda: z.enum(MONEDAS),
  estado: z.enum(ESTADOS),
  destacado: z.boolean(),
  fotos: z.array(FotoSchema).min(1),           // la primera es la portada
  descripcion: z.string(),
  equipamiento: z.array(z.string()),
  fechaIngreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // 'AAAA-MM-DD'
});

export type Foto = z.infer<typeof FotoSchema>;
export type Auto = z.infer<typeof AutoSchema>;
export type Combustible = (typeof COMBUSTIBLES)[number];
export type Transmision = (typeof TRANSMISIONES)[number];
export type Carroceria = (typeof CARROCERIAS)[number];
export type Moneda = (typeof MONEDAS)[number];
