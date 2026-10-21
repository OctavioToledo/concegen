// Abre y cierra los <dialog> del sitio: menú y paneles.

export function iniciarDialogos() {
  document.querySelectorAll<HTMLElement>('[data-abrir]').forEach((boton) => {
    const dialogo = document.getElementById(boton.dataset.abrir ?? '') as HTMLDialogElement | null;
    if (!dialogo) return;
    boton.addEventListener('click', () => {
      dialogo.showModal();
      boton.setAttribute('aria-expanded', 'true');
    });
    dialogo.addEventListener('close', () => {
      boton.setAttribute('aria-expanded', 'false');
      boton.focus();
    });
  });

  document.querySelectorAll<HTMLDialogElement>('dialog.panel, dialog.menu').forEach((dialogo) => {
    dialogo.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', () => dialogo.close()));
    // Tocar el fondo cierra el panel (el menú ocupa toda la pantalla).
    if (dialogo.classList.contains('panel')) {
      dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
    }
  });
}
