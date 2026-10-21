// «Compartir»: Web Share si está disponible; si no, copia el link y avisa «Link copiado».
import { avisar } from './aviso';

export function iniciarCompartir() {
  document.querySelectorAll<HTMLButtonElement>('[data-compartir]').forEach((boton) => {
    boton.hidden = false;
    boton.addEventListener('click', async () => {
      const url = boton.dataset.url ?? location.href;
      const title = boton.dataset.titulo ?? document.title;
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
          return;
        } catch (e) {
          if ((e as DOMException).name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        avisar('Link copiado');
      } catch {
        prompt('Copiá el link', url);
      }
    });
  });
}
