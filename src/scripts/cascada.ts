// Las tarjetas que vuelven a aparecer (al cambiar de pestaña o de filtro) entran en cascada, apenas.
// Con «reducir movimiento» no se anima nada.

const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function cascada(elementos: Element[], maximo = 12) {
  if (quieto() || !('animate' in Element.prototype)) return;
  elementos.slice(0, maximo).forEach((el, i) => {
    el.animate(
      [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: i * 45, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' },
    );
  });
}
