// Financiación y usado → WhatsApp.
// Sin JavaScript, el formulario abre WhatsApp con un mensaje genérico (campo oculto `text`).
// Con JavaScript, valida, arma el mensaje completo y lo pone en ese mismo campo antes de enviar.

import { mensajes } from '../config/mensajes';
import { numero } from '../lib/formato';

type Valores = Record<string, string>;
type Armador = (v: Valores, form: HTMLFormElement) => string;

const armadores: Record<string, Armador> = {
  financiacion: (v, form) => {
    const sel = form.querySelector<HTMLSelectElement>('#fin-auto');
    const auto = v['fin-auto'] ? sel?.selectedOptions[0]?.dataset.nombre ?? null : null;
    const anticipo = v['fin-anticipo'] ? `$ ${numero(Number(v['fin-anticipo'].replace(/\D/g, '')))}` : 'a definir';
    return mensajes.financiacion({ nombre: v['fin-nombre'], auto, anticipo, cuotas: v['fin-cuotas'] });
  },
  usado: (v) =>
    mensajes.usado({
      auto: [v['us-marca'], v['us-modelo'], v['us-version']].filter(Boolean).join(' '),
      anio: v['us-anio'],
      km: numero(Number(v['us-km'].replace(/\D/g, ''))),
      estado: v['us-estado'].toLowerCase(),
      comentario: v['us-comentario'].trim().replace(/([^.!?])$/, '$1.'),
    }),
};

function valores(form: HTMLFormElement): Valores {
  const v: Valores = {};
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-valor]').forEach((c) => {
    v[c.id] = c.value.trim();
  });
  return v;
}

function marcarError(control: HTMLElement, mensaje: string | null) {
  const campo = control.closest<HTMLElement>('.campo');
  const error = campo?.querySelector<HTMLElement>('.error');
  if (!campo || !error) return;
  campo.classList.toggle('campo-error', !!mensaje);
  error.hidden = !mensaje;
  error.textContent = mensaje ?? '';
  if (mensaje) {
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', error.id);
  } else {
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
  }
}

function validar(form: HTMLFormElement): boolean {
  let primero: HTMLElement | null = null;
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-valor]').forEach((c) => {
    const error = c.closest('.campo')?.querySelector<HTMLElement>('.error')?.dataset.error;
    let mensaje: string | null = null;
    if (c.hasAttribute('data-requerido') && !c.value.trim()) mensaje = error ?? 'Completá este dato';
    else if (c.dataset.patron && c.value.trim() && !new RegExp(c.dataset.patron).test(c.value.trim())) mensaje = c.dataset.patronError ?? error ?? 'Revisá este dato';
    marcarError(c, mensaje);
    if (mensaje && !primero) primero = c;
  });
  (primero as HTMLElement | null)?.focus();
  return !primero;
}

export function iniciarFormularios() {
  document.querySelectorAll<HTMLFormElement>('form[data-wa-form]').forEach((form) => {
    const armar = armadores[form.dataset.waForm ?? ''];
    const texto = form.querySelector<HTMLInputElement>('input[name="text"]');
    if (!armar || !texto) return;
    form.noValidate = true;

    // Preselección desde una ficha: ?auto=slug
    const slug = new URLSearchParams(location.search).get('auto');
    const sel = form.querySelector<HTMLSelectElement>('#fin-auto');
    if (slug && sel && [...sel.options].some((o) => o.value === slug)) sel.value = slug;

    form.addEventListener('input', (e) => {
      const c = e.target as HTMLElement;
      if (c.getAttribute('aria-invalid')) marcarError(c, null);
    });

    form.addEventListener('submit', (e) => {
      if (!validar(form)) {
        e.preventDefault();
        return;
      }
      texto.value = armar(valores(form), form);
      form.dispatchEvent(new CustomEvent('whatsapp:enviado', { bubbles: true }));
      // El envío sigue su curso: GET a wa.me con target _blank.
    });
  });
}
