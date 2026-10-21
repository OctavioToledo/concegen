// Contador «3 de 8», miniaturas y visor a pantalla completa.

function indiceVisible(pista: HTMLElement): number {
  return Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth));
}

function irA(pista: HTMLElement, i: number, suave = true) {
  pista.scrollTo({ left: i * pista.clientWidth, behavior: suave ? 'smooth' : 'instant' });
}

export function iniciarGaleria() {
  const galeria = document.querySelector<HTMLElement>('[data-galeria]');
  const pista = galeria?.querySelector<HTMLElement>('[data-pista]');
  if (!galeria || !pista) return;

  const total = pista.children.length;
  const contador = galeria.querySelector('[data-contador]');
  const miniaturas = document.querySelectorAll<HTMLButtonElement>('[data-miniaturas] [data-ir]');
  const visor = document.querySelector<HTMLDialogElement>('[data-visor]');
  const visorPista = visor?.querySelector<HTMLElement>('[data-visor-pista]');
  const visorContador = visor?.querySelector('[data-visor-contador]');

  let actual = 0;
  const marcar = (i: number) => {
    actual = i;
    if (contador) contador.textContent = `${i + 1} de ${total}`;
    miniaturas.forEach((m, j) => m.setAttribute('aria-current', String(j === i)));
  };

  let espera = 0;
  pista.addEventListener('scroll', () => {
    cancelAnimationFrame(espera);
    espera = requestAnimationFrame(() => marcar(indiceVisible(pista)));
  }, { passive: true });

  miniaturas.forEach((m) => m.addEventListener('click', () => irA(pista, Number(m.dataset.ir))));

  pista.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') irA(pista, Math.min(total - 1, actual + 1));
    if (e.key === 'ArrowLeft') irA(pista, Math.max(0, actual - 1));
  });

  if (!visor || !visorPista) return;

  let visorActual = 0;
  const marcarVisor = (i: number) => {
    visorActual = i;
    if (visorContador) visorContador.textContent = `${i + 1} de ${total}`;
  };
  visorPista.addEventListener('scroll', () => marcarVisor(indiceVisible(visorPista)), { passive: true });

  pista.querySelectorAll<HTMLButtonElement>('[data-abrir-visor]').forEach((b) => {
    b.addEventListener('click', () => {
      const i = Number(b.dataset.abrirVisor);
      visor.showModal();
      irA(visorPista, i, false);
      marcarVisor(i);
    });
  });

  const mover = (paso: number) => irA(visorPista, Math.min(total - 1, Math.max(0, visorActual + paso)));
  visor.querySelector('[data-visor-ant]')?.addEventListener('click', () => mover(-1));
  visor.querySelector('[data-visor-sig]')?.addEventListener('click', () => mover(1));
  visor.querySelector('[data-cerrar]')?.addEventListener('click', () => visor.close());
  visor.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
  });
  // Al cerrar, la galería queda en la foto que se estaba viendo.
  visor.addEventListener('close', () => irA(pista, visorActual, false));
}
