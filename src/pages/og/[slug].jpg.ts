// Imagen Open Graph por auto, más una general, generadas en el build.
import type { APIRoute, GetStaticPaths } from 'astro';
import { todos, autoHero } from '../../lib/stock';
import { agencia } from '../../lib/agencia';
import { rutaDiscoAuto } from '../../lib/fotos';
import { archivoOgAuto, archivoOgGeneral } from '../../lib/seo';
import { ogAuto, ogGeneral } from '../../lib/og';

export const getStaticPaths = (() => [
  ...todos().map((auto) => ({ params: { slug: archivoOgAuto(auto) }, props: { slug: auto.slug } })),
  { params: { slug: archivoOgGeneral() }, props: { slug: null } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  let imagen: Buffer;
  if (props.slug) {
    imagen = await ogAuto(todos().find((a) => a.slug === props.slug)!);
  } else {
    const hero = autoHero();
    const ruta = hero
      ? rutaDiscoAuto(hero.fotos[0].src)
      : agencia.hero.tipo === 'foto' ? `src/assets/${agencia.hero.src}` : null;
    imagen = await ogGeneral(ruta);
  }
  return new Response(new Uint8Array(imagen), { headers: { 'Content-Type': 'image/jpeg' } });
};
