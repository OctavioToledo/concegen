# Demo para concesionarias

Sitio estático en Astro para agencias de autos. La estructura y las funciones están en `design (1).md`; el lenguaje visual (blanco y carbón, cero radios, títulos en peso 300) sigue `idea.md`.

```sh
npm install
npm run dev          # desarrollo en http://localhost:4321
npm run build        # genera dist/ para Cloudflare Pages
npm test             # plantillas de WhatsApp y chequeo de contraste
npm run check        # tipos
```

## Para una agencia nueva

Se tocan cuatro lugares, ningún componente:

1. `src/config/agencia.ts`: identidad, contacto, colores, horarios y switches de secciones.
2. `src/config/mensajes.ts`: plantillas de WhatsApp (si hace falta).
3. `src/data/autos.ts`: el stock. El slug se arma una vez y no se cambia nunca.
4. `src/assets/`: fotos en `autos/<slug>/01.jpg, 02.jpg…` (la 01 es la portada), más el logo y la foto del local en `agencia/`.

El build valida la config y el stock contra los esquemas Zod (`src/schema/`) y avisa si algún color no llega al contraste mínimo.

Para fotos que todavía no están, `npm run placeholders` genera la silueta de la carrocería. Solo crea las que faltan: nunca pisa una foto real.

## Indexación

`sitio.indexar` controla todo. Con `false` (la demo): `noindex` en cada página y en `_headers`, `robots.txt` sin `Disallow` y sin sitemap. Lighthouse SEO se mide con un build en `true`.

## Pendiente antes de mostrar la demo

- Calibrar los precios de `src/data/autos.ts` (son estimados a octubre de 2026).
- Las fotos actuales son de Wikimedia Commons (licencias CC, créditos en `src/data/creditos.json` y en `/creditos`). Para cada agencia, reemplazarlas por las fotos de su stock real.
- Cargar el ID de Umami en `analitica` cuando exista la cuenta.
