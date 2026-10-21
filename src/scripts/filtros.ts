// Filtros, orden, URL y contador del stock.
// Filtra sobre el HTML que ya está en la página: cada tarjeta lleva sus datos en atributos data-*.

import { precio as formatoPrecio, precioCorto, numero } from '../lib/formato';
import { mensajes } from '../config/mensajes';
import { whatsappUrl } from '../lib/whatsapp';

type Moneda = 'ARS' | 'USD';
type Orden = '' | 'precio-asc' | 'precio-desc' | 'nuevos' | 'km';

type Estado = {
  marca: string;
  modelo: string;
  anioDesde: number | null;
  anioHasta: number | null;
  moneda: Moneda;
  precioDesde: number | null;
  precioHasta: number | null;
  km: number | null;
  comb: string[];
  caja: string;
  carr: string[];
  cond: string;
  orden: Orden;
};

const $ = <T extends Element>(sel: string, raiz: ParentNode = document) => raiz.querySelector<T>(sel);
const $$ = <T extends Element>(sel: string, raiz: ParentNode = document) => [...raiz.querySelectorAll<T>(sel)];

const form = $<HTMLFormElement>('#filtros-form')!;
const grilla = $<HTMLElement>('#grilla-stock')!;
const tarjetas = $$<HTMLElement>('[data-auto]', grilla);
const config = JSON.parse(form.dataset.config ?? '{}') as {
  monedaDefecto: Moneda;
  cotizacion: number;
  escalones: Record<Moneda, number[]>;
  modelos: { marca: string; slug: string; nombre: string }[];
  numero: string;
  agencia: string;
};

const campo = <T extends Element>(nombre: string) => form.elements.namedItem(nombre) as T | null;
const selMarca = campo<HTMLSelectElement>('marca')!;
const selModelo = campo<HTMLSelectElement>('modelo')!;
const selAnioDesde = campo<HTMLSelectElement>('anio-desde')!;
const selAnioHasta = campo<HTMLSelectElement>('anio-hasta')!;
const selPrecioDesde = campo<HTMLSelectElement>('precio-desde')!;
const selPrecioHasta = campo<HTMLSelectElement>('precio-hasta')!;
const selKm = campo<HTMLSelectElement>('km')!;
const selOrden = $<HTMLSelectElement>('#f-orden')!;

const numeroONull = (v: string | null | undefined) => (v ? Number(v) || null : null);

function rango(v: string | null): [number | null, number | null] {
  if (!v) return [null, null];
  const [a, b] = v.split('-');
  return [numeroONull(a), numeroONull(b)];
}

const lista = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

// ── URL ↔ estado ────────────────────────────────────────

function desdeUrl(): Estado {
  const p = new URLSearchParams(location.search);
  const [anioDesde, anioHasta] = rango(p.get('anio'));
  const [precioDesde, precioHasta] = rango(p.get('precio'));
  const moneda = (p.get('moneda') ?? '').toUpperCase();
  return {
    marca: p.get('marca') ?? '',
    modelo: p.get('marca') ? p.get('modelo') ?? '' : '',
    anioDesde,
    anioHasta,
    moneda: moneda === 'USD' || moneda === 'ARS' ? moneda : config.monedaDefecto,
    precioDesde,
    precioHasta,
    km: numeroONull(p.get('km')),
    comb: lista(p.get('comb')),
    caja: p.get('caja') ?? '',
    carr: lista(p.get('carr')),
    cond: p.get('cond') ?? '',
    orden: (p.get('orden') ?? '') as Orden,
  };
}

function aUrl(e: Estado): string {
  const p = new URLSearchParams();
  const r = (a: number | null, b: number | null) => (a || b ? `${a ?? ''}-${b ?? ''}` : '');
  const poner = (k: string, v: string) => v && p.set(k, v);
  poner('marca', e.marca);
  poner('modelo', e.marca ? e.modelo : '');
  poner('anio', r(e.anioDesde, e.anioHasta));
  poner('precio', r(e.precioDesde, e.precioHasta));
  if ((e.precioDesde || e.precioHasta) && e.moneda !== config.monedaDefecto) p.set('moneda', e.moneda.toLowerCase());
  poner('km', e.km ? String(e.km) : '');
  poner('comb', e.comb.join(','));
  poner('caja', e.caja);
  poner('carr', e.carr.join(','));
  poner('cond', e.cond);
  poner('orden', e.orden);
  // Las comas quedan legibles en el link que se comparte.
  const q = p.toString().replace(/%2C/g, ',');
  return q ? `?${q}` : '';
}

// ── Formulario ↔ estado ─────────────────────────────────

function opcionesModelo(marca: string) {
  const actual = selModelo.value;
  selModelo.replaceChildren(new Option('Todos', ''));
  for (const m of config.modelos.filter((m) => m.marca === marca)) selModelo.add(new Option(m.nombre, m.slug));
  selModelo.disabled = !marca;
  selModelo.value = [...selModelo.options].some((o) => o.value === actual) ? actual : '';
}

function opcionesPrecio(moneda: Moneda) {
  for (const [sel, vacio] of [[selPrecioDesde, 'Desde'], [selPrecioHasta, 'Hasta']] as const) {
    const actual = sel.value;
    sel.replaceChildren(new Option(vacio, ''));
    for (const v of config.escalones[moneda]) sel.add(new Option(precioCorto(v, moneda), String(v)));
    sel.value = [...sel.options].some((o) => o.value === actual) ? actual : '';
  }
}

function aFormulario(e: Estado) {
  selMarca.value = e.marca;
  if (selMarca.value !== e.marca) selMarca.value = '';
  opcionesModelo(selMarca.value);
  selModelo.value = e.modelo;
  selAnioDesde.value = e.anioDesde ? String(e.anioDesde) : '';
  selAnioHasta.value = e.anioHasta ? String(e.anioHasta) : '';
  $$<HTMLInputElement>('input[name="moneda"]', form).forEach((r) => (r.checked = r.value === e.moneda));
  opcionesPrecio(e.moneda);
  // Un valor que no está entre los escalones (por ejemplo, del buscador de la home) se suma como opción.
  for (const [sel, v] of [[selPrecioDesde, e.precioDesde], [selPrecioHasta, e.precioHasta]] as const) {
    if (v && ![...sel.options].some((o) => o.value === String(v))) sel.add(new Option(precioCorto(v, e.moneda), String(v)));
    sel.value = v ? String(v) : '';
  }
  selKm.value = e.km ? String(e.km) : '';
  $$<HTMLInputElement>('input[name="comb"]', form).forEach((c) => (c.checked = e.comb.includes(c.value)));
  $$<HTMLInputElement>('input[name="carr"]', form).forEach((c) => (c.checked = e.carr.includes(c.value)));
  $$<HTMLInputElement>('input[name="caja"]', form).forEach((r) => (r.checked = r.value === e.caja));
  $$<HTMLInputElement>('input[name="cond"]', form).forEach((r) => (r.checked = r.value === e.cond));
  selOrden.value = e.orden;
}

function desdeFormulario(): Estado {
  const marcados = (n: string) => $$<HTMLInputElement>(`input[name="${n}"]:checked`, form).map((c) => c.value);
  return {
    marca: selMarca.value,
    modelo: selMarca.value ? selModelo.value : '',
    anioDesde: numeroONull(selAnioDesde.value),
    anioHasta: numeroONull(selAnioHasta.value),
    moneda: (marcados('moneda')[0] as Moneda) ?? config.monedaDefecto,
    precioDesde: numeroONull(selPrecioDesde.value),
    precioHasta: numeroONull(selPrecioHasta.value),
    km: numeroONull(selKm.value),
    comb: marcados('comb'),
    caja: marcados('caja')[0] ?? '',
    carr: marcados('carr'),
    cond: marcados('cond')[0] ?? '',
    orden: selOrden.value as Orden,
  };
}

// ── Filtrar y ordenar ───────────────────────────────────

function coincide(t: HTMLElement, e: Estado): boolean {
  const d = t.dataset;
  const anio = Number(d.anio);
  const km = Number(d.km);
  const factor = e.moneda === 'USD' ? config.cotizacion : 1;
  if (e.marca && d.marca !== e.marca) return false;
  if (e.modelo && d.modelo !== e.modelo) return false;
  if (e.anioDesde && anio < e.anioDesde) return false;
  if (e.anioHasta && anio > e.anioHasta) return false;
  if (e.precioDesde || e.precioHasta) {
    if (!d.precio) return false;
    const p = Number(d.precio);
    if (e.precioDesde && p < e.precioDesde * factor) return false;
    if (e.precioHasta && p > e.precioHasta * factor) return false;
  }
  if (e.km && km > e.km) return false;
  if (e.comb.length && !e.comb.includes(d.comb!)) return false;
  if (e.caja && d.caja !== e.caja) return false;
  if (e.carr.length && !e.carr.includes(d.carr!)) return false;
  if (e.cond && d.cond !== e.cond) return false;
  return true;
}

const vendido = (t: HTMLElement) => (t.dataset.estado === 'vendido' ? 1 : 0);
const precioDe = (t: HTMLElement) => (t.dataset.precio ? Number(t.dataset.precio) : null);

function comparador(orden: Orden) {
  return (a: HTMLElement, b: HTMLElement): number => {
    // Los vendidos siempre al final.
    const v = vendido(a) - vendido(b);
    if (v || !orden) return v || Number(a.dataset.rec) - Number(b.dataset.rec);
    if (orden === 'precio-asc' || orden === 'precio-desc') {
      const pa = precioDe(a);
      const pb = precioDe(b);
      if (pa === null || pb === null) return (pa === null ? 1 : 0) - (pb === null ? 1 : 0);
      return orden === 'precio-asc' ? pa - pb : pb - pa;
    }
    if (orden === 'nuevos') return Number(b.dataset.anio) - Number(a.dataset.anio) || b.dataset.ingreso!.localeCompare(a.dataset.ingreso!);
    if (orden === 'km') return Number(a.dataset.km) - Number(b.dataset.km);
    return 0;
  };
}

// ── Chips activos y textos ──────────────────────────────

type Activo = { texto: string; quitar: (e: Estado) => void };

const textoOpcion = (sel: HTMLSelectElement, v: string) => [...sel.options].find((o) => o.value === v)?.text ?? v;
const textoCasilla = (nombre: string, v: string) =>
  $<HTMLInputElement>(`input[name="${nombre}"][value="${v}"]`, form)?.parentElement?.textContent?.trim() ?? v;

function activos(e: Estado): Activo[] {
  const r: Activo[] = [];
  const desdeHasta = (a: string | null, b: string | null) => (a && b ? `${a} a ${b}` : a ? `Desde ${a}` : `Hasta ${b}`);
  if (e.marca) r.push({ texto: textoOpcion(selMarca, e.marca), quitar: (s) => { s.marca = ''; s.modelo = ''; } });
  if (e.modelo) r.push({ texto: textoOpcion(selModelo, e.modelo), quitar: (s) => { s.modelo = ''; } });
  if (e.anioDesde || e.anioHasta) {
    r.push({ texto: desdeHasta(e.anioDesde ? String(e.anioDesde) : null, e.anioHasta ? String(e.anioHasta) : null), quitar: (s) => { s.anioDesde = s.anioHasta = null; } });
  }
  if (e.precioDesde || e.precioHasta) {
    const f = (v: number | null) => (v ? formatoPrecio(v, e.moneda) : null);
    r.push({ texto: desdeHasta(f(e.precioDesde), f(e.precioHasta)), quitar: (s) => { s.precioDesde = s.precioHasta = null; } });
  }
  if (e.km) r.push({ texto: `Hasta ${numero(e.km)} km`, quitar: (s) => { s.km = null; } });
  for (const c of e.comb) r.push({ texto: textoCasilla('comb', c), quitar: (s) => { s.comb = s.comb.filter((x) => x !== c); } });
  if (e.caja) r.push({ texto: textoCasilla('caja', e.caja), quitar: (s) => { s.caja = ''; } });
  for (const c of e.carr) r.push({ texto: textoCasilla('carr', c), quitar: (s) => { s.carr = s.carr.filter((x) => x !== c); } });
  if (e.cond) r.push({ texto: e.cond === '0km' ? '0 km' : 'Usados', quitar: (s) => { s.cond = ''; } });
  return r;
}

/** Grupos de filtros activos, para «Filtrar (2)». */
function gruposActivos(e: Estado): number {
  return [
    e.marca, e.anioDesde || e.anioHasta, e.precioDesde || e.precioHasta, e.km,
    e.comb.length, e.caja, e.carr.length, e.cond,
  ].filter(Boolean).length;
}

const autos = (n: number) => (n === 1 ? '1 auto' : `${n} autos`);

// ── Aplicar ─────────────────────────────────────────────

let estado = desdeUrl();

function aplicar(e: Estado, { url = true } = {}) {
  estado = e;

  let visibles = 0;
  for (const t of tarjetas) {
    const ok = coincide(t, e);
    t.hidden = !ok;
    if (ok) visibles++;
  }

  const ordenadas = [...tarjetas].sort(comparador(e.orden));
  if (ordenadas.some((t, i) => grilla.children[i] !== t)) grilla.append(...ordenadas);

  // Las dos primeras visibles cargan de inmediato.
  ordenadas.filter((t) => !t.hidden).slice(0, 2).forEach((t) => t.querySelector('img')?.setAttribute('loading', 'eager'));

  const texto = autos(visibles);
  $('#stock-cantidad')!.textContent = texto;
  $('#ver-autos')!.textContent = visibles ? `Ver ${texto}` : 'Ver 0 autos';
  $('#anuncio-cantidad')!.textContent = texto;

  const n = gruposActivos(e);
  $('#boton-filtrar-texto')!.textContent = n ? `Filtrar (${n})` : 'Filtrar';

  const chips = $<HTMLElement>('#chips-activos')!;
  const lista = activos(e);
  chips.replaceChildren(...lista.map((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip chip-quitar';
    b.setAttribute('aria-label', `Quitar filtro: ${a.texto}`);
    b.innerHTML = `<span></span><span aria-hidden="true">✕</span>`;
    b.firstElementChild!.textContent = a.texto;
    b.addEventListener('click', () => {
      const nuevo = structuredClone(estado);
      a.quitar(nuevo);
      aFormulario(nuevo);
      aplicar(nuevo);
      ($<HTMLElement>('#chips-activos button') ?? $<HTMLElement>('#stock-titulo'))?.focus();
    });
    return b;
  }));

  const vacio = $<HTMLElement>('#vacio')!;
  vacio.hidden = visibles > 0;
  grilla.hidden = visibles === 0;
  if (!visibles) {
    const buscado = lista.map((a) => a.texto).join(', ') || 'un auto';
    const wa = $<HTMLAnchorElement>('#vacio-wa')!;
    wa.href = whatsappUrl(config.numero, mensajes.stockVacio({ filtros: buscado }));
  }

  if (url) {
    const q = aUrl(e);
    history.replaceState(null, '', location.pathname + q);
    try { sessionStorage.setItem('busqueda', q); } catch { /* modo privado */ }
  }
}

// ── Eventos ─────────────────────────────────────────────

form.addEventListener('change', (ev) => {
  const t = ev.target as HTMLInputElement;
  if (t.name === 'marca') opcionesModelo(selMarca.value);
  if (t.name === 'moneda') {
    // Al cambiar de moneda se limpia el rango: los escalones no se convierten.
    selPrecioDesde.value = selPrecioHasta.value = '';
    opcionesPrecio(t.value as Moneda);
  }
  aplicar(desdeFormulario());
});

selOrden.addEventListener('change', () => aplicar(desdeFormulario()));

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  aplicar(desdeFormulario());
  ($<HTMLDialogElement>('#panel-filtros'))?.close();
  grilla.scrollIntoView?.({ block: 'start' });
});

const limpiar = () => {
  const vacio = { ...desdeUrl(), marca: '', modelo: '', anioDesde: null, anioHasta: null, precioDesde: null, precioHasta: null, km: null, comb: [], caja: '', carr: [], cond: '', moneda: config.monedaDefecto, orden: estado.orden };
  aFormulario(vacio);
  aplicar(vacio);
};
$$('[data-limpiar]').forEach((b) => b.addEventListener('click', limpiar));

// Primera pasada: aplica los filtros de la URL antes de mostrar el stock.
aFormulario(estado);
aplicar(estado, { url: false });
try { sessionStorage.setItem('busqueda', location.search); } catch { /* modo privado */ }
document.documentElement.classList.remove('filtrando');
