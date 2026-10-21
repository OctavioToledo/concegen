import type { Agencia } from '../schema/agencia';

// ── Lo que cambia por agencia ──
// Se valida contra src/schema/agencia.ts en el build.

export const agencia = {
  nombre: 'Andino Autos',
  eslogan: 'Elegí tu próximo auto y consultalo por WhatsApp.',
  ciudad: 'San Martín, Mendoza',
  logo: null,
  colores: { primario: '#0F3B57', acento: '#F0A202', fondo: '#F3F5F7' },
  contacto: {
    whatsapp: '5492634280036',
    telefono: '263 428-0036',
    email: null,
    direccion: 'Av. Boulogne Sur Mer 1250, San Martín, Mendoza',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Boulogne+Sur+Mer+1250+San+Mart%C3%ADn+Mendoza',
  },
  horarios: [
    { dias: ['lun', 'mar', 'mie', 'jue', 'vie'], franjas: [['09:00', '13:00'], ['17:00', '21:00']] },
    { dias: ['sab'], franjas: [['09:30', '13:30']] },
  ],
  zonaHoraria: 'America/Argentina/Mendoza',
  redes: { instagram: 'https://www.instagram.com/' },
  moneda: { porDefecto: 'ARS', cotizacionReferencia: 1450 },
  secciones: { financiacion: true, tomaUsados: true, ceroKm: true, testimonios: false },
  hero: { tipo: 'auto', autoId: 'a001' },
  financiacion: {
    cuotas: [12, 18, 24, 36, 48],
    requisitos: [
      'DNI vigente.',
      'Últimos tres recibos de sueldo o constancia de monotributo.',
      'Un servicio a tu nombre con el domicilio actual.',
    ],
  },
  laAgencia: {
    historia: [
      'Andino Autos es una agencia de San Martín, Mendoza, que vende autos 0 km y usados seleccionados.',
      'Cada usado pasa por una revisión mecánica antes de entrar al stock y se entrega con la documentación al día. Si querés, tomamos tu auto como parte de pago y te ayudamos con la financiación.',
      'Atendemos por WhatsApp todos los días hábiles: mandanos el auto que te interesa y coordinamos una visita o un test drive.',
    ],
    fotoLocal: 'agencia/local.jpg',
    fundacion: null,
  },
  testimonios: [],
  sitio: { url: 'https://andino.demo.devott.com.ar', indexar: false, creditoDevott: true },
  analitica: { proveedor: 'ninguno', id: '' },
} satisfies Agencia;
