// «Abierto ahora, cierra a las 13» o «Cerrado, abre a las 17», con la zona horaria de la agencia.
// Contempla el horario cortado.

type Horarios = { dias: string[]; franjas: [string, string][] }[];

const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const NOMBRES: Record<string, string> = {
  lun: 'el lunes', mar: 'el martes', mie: 'el miércoles', jue: 'el jueves', vie: 'el viernes', sab: 'el sábado', dom: 'el domingo',
};

const minutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const hora = (h: string) => (h.endsWith(':00') ? String(Number(h.slice(0, 2))) : `${Number(h.slice(0, 2))}:${h.slice(3)}`);

function ahoraEn(zona: string): { dia: number; min: number } {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: zona, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date());
  const valor = (t: string) => partes.find((p) => p.type === t)?.value ?? '';
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday'));
  return { dia, min: Number(valor('hour')) * 60 + Number(valor('minute')) };
}

function franjasDel(horarios: Horarios, dia: number): [string, string][] {
  const clave = DIAS[dia];
  return horarios.filter((h) => h.dias.includes(clave)).flatMap((h) => h.franjas)
    .sort((a, b) => minutos(a[0]) - minutos(b[0]));
}

export function estadoHorario(horarios: Horarios, zona: string): { abierto: boolean; texto: string } {
  const { dia, min } = ahoraEn(zona);
  const hoy = franjasDel(horarios, dia);

  const actual = hoy.find(([a, c]) => min >= minutos(a) && min < minutos(c));
  if (actual) return { abierto: true, texto: `Abierto ahora, cierra a las ${hora(actual[1])}` };

  const luegoHoy = hoy.find(([a]) => minutos(a) > min);
  if (luegoHoy) return { abierto: false, texto: `Cerrado, abre a las ${hora(luegoHoy[0])}` };

  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7;
    const franjas = franjasDel(horarios, d);
    if (franjas.length) {
      const cuando = i === 1 ? 'mañana' : NOMBRES[DIAS[d]];
      return { abierto: false, texto: `Cerrado, abre ${cuando} a las ${hora(franjas[0][0])}` };
    }
  }
  return { abierto: false, texto: 'Cerrado' };
}

export function iniciarHorario() {
  document.querySelectorAll<HTMLElement>('[data-horario]').forEach((el) => {
    const horarios = JSON.parse(el.dataset.horario ?? '[]') as Horarios;
    const { abierto, texto } = estadoHorario(horarios, el.dataset.zona ?? 'America/Argentina/Buenos_Aires');
    el.textContent = texto;
    el.dataset.abierto = String(abierto);
    el.hidden = false;
  });
}
