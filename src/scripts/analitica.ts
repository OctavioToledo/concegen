// Un solo listener para todos los WhatsApp. Ningún componente tiene código de medición.

type Props = Record<string, string>;
type Proveedor = 'umami' | 'plausible' | 'ga4' | 'ninguno';

declare global {
  interface Window {
    umami?: { track: (evento: string, datos?: Props) => void };
    plausible?: (evento: string, opciones?: { props: Props }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(evento: string, datos: Props) {
  const proveedor = (document.documentElement.dataset.analitica ?? 'ninguno') as Proveedor;
  try {
    if (proveedor === 'umami') window.umami?.track(evento, datos);
    else if (proveedor === 'plausible') window.plausible?.(evento, { props: datos });
    else if (proveedor === 'ga4') window.gtag?.('event', evento, datos);
  } catch {
    // La medición nunca rompe un clic.
  }
}

function datosDe(el: HTMLElement): Props {
  const datos: Props = { origen: el.dataset.waOrigen ?? '', pagina: location.pathname };
  if (el.dataset.waMotivo) datos.motivo = el.dataset.waMotivo;
  if (el.dataset.waAuto) datos.auto = el.dataset.waAuto;
  return datos;
}

export function iniciarAnalitica() {
  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('a[data-wa-origen]');
    if (el) track('whatsapp_click', datosDe(el));
  }, { capture: true });

  // Los formularios avisan cuando abren WhatsApp (ver formularios.ts).
  document.addEventListener('whatsapp:enviado', (e) => {
    const el = e.target as HTMLElement;
    if (el.dataset.waOrigen) track('whatsapp_click', datosDe(el));
  });
}
