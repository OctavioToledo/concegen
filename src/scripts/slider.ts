// Slider de portada: flechas, puntos y avance automático cada 7 s.
// El avance se pausa al pasar el mouse, al tocar o al enfocar, y no arranca con «reducir movimiento».

export function iniciarSlider() {
  const slider = document.querySelector<HTMLElement>('[data-slider]');
  const pista = slider?.querySelector<HTMLElement>('[data-pista]');
  if (!slider || !pista) return;

  const total = pista.children.length;
  const puntos = [...slider.querySelectorAll<HTMLButtonElement>('[data-ir]')];
  const pausa = slider.querySelector<HTMLButtonElement>('[data-pausa]');
  let actual = 0;

  const indice = () => Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth));
  const irA = (i: number) => pista.scrollTo({ left: ((i + total) % total) * pista.clientWidth, behavior: 'smooth' });

  pista.addEventListener('scroll', () => {
    const i = indice();
    if (i === actual) return;
    actual = i;
    puntos.forEach((p, j) => p.setAttribute('aria-current', String(j === i)));
  }, { passive: true });

  puntos.forEach((p) => p.addEventListener('click', () => irA(Number(p.dataset.ir))));
  slider.querySelector('[data-ant]')?.addEventListener('click', () => irA(actual - 1));
  slider.querySelector('[data-sig]')?.addEventListener('click', () => irA(actual + 1));

  if (total < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let temporizador = 0;
  let detenido = false;     // lo pausó la persona con el botón
  let suspendido = false;   // mouse encima, foco adentro o toque

  const programar = () => {
    clearInterval(temporizador);
    if (!detenido && !suspendido) temporizador = window.setInterval(() => irA(actual + 1), 7000);
  };
  const suspender = (v: boolean) => { suspendido = v; programar(); };

  slider.addEventListener('mouseenter', () => suspender(true));
  slider.addEventListener('mouseleave', () => suspender(false));
  slider.addEventListener('focusin', () => suspender(true));
  slider.addEventListener('focusout', () => suspender(false));
  pista.addEventListener('touchstart', () => suspender(true), { passive: true });

  if (pausa) {
    pausa.hidden = false;
    pausa.addEventListener('click', () => {
      detenido = !detenido;
      pausa.setAttribute('aria-label', detenido ? 'Reanudar el avance automático' : 'Pausar el avance automático');
      pausa.innerHTML = detenido
        ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 5.5v13l10-6.5z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6v12M15 6v12"/></svg>';
      programar();
    });
  }
  programar();
}
