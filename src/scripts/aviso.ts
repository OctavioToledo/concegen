// «Link copiado» y otros mensajes cortos: 2,5 s abajo de la pantalla.

let temporizador = 0;

export function avisar(texto: string) {
  const aviso = document.getElementById('aviso');
  if (!aviso) return;
  aviso.textContent = texto;
  requestAnimationFrame(() => aviso.classList.add('visible'));
  clearTimeout(temporizador);
  temporizador = window.setTimeout(() => {
    aviso.classList.remove('visible');
    window.setTimeout(() => { aviso.textContent = ''; }, 300);
  }, 2500);
}
