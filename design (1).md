# design.md: demo para concesionarias

Devott. Propuesta para aprobar antes de escribir código.

---

## 1. La idea

Cada auto se presenta como en la playa de la agencia: una foto grande y su **cartel de parabrisas**, con el precio, el año y los kilómetros en números grandes.

El cartel es el único elemento audaz del sitio. Todo lo demás es silencioso, ordenado y rápido. La jerarquía de cualquier pantalla es siempre la misma: primero la foto, después el cartel y después el botón de WhatsApp. Si algo compite con esos tres, sale.

Por qué funciona para venderle a un dueño de agencia: el cartel es el lenguaje que él ya usa todos los días en su playa, así que el sitio se siente hecho para su negocio y no para «cualquier negocio». Y como el cartel toma los colores de la config, cuando personalizamos la demo para una agencia pasa a ser la suya sin rediseñar nada.

---

## 2. Tipografía

Una sola familia: **Archivo**, variable (ejes de peso y de ancho), autoalojada en woff2 con subset latino. Una familia es un solo archivo, y eso cuenta para llegar a 95 en Performance. La personalidad sale de una regla simple:

**Ancho para nombrar, angosto para contar.**

| Registro | Ejes | Para qué |
|---|---|---|
| Ancho | wdth 112, peso 700 | Marcas, modelos y títulos. Los autos se nombran con letra ancha, como las insignias de la cola. |
| Angosto | wdth 75, peso 800, cifras tabulares | Precio, año y kilómetros. Los números entran grandes en poco lugar y quedan alineados entre tarjetas. |
| Normal | wdth 100, peso 400 y 600 | Texto corrido, formularios, tablas, botones. |

### Escala

Basada en la escala clásica (13, 14, 16, 18, 21, 24, 36, 48, 60), fluida con `clamp()` entre 375 y 1240 px.

| Token | Uso | Móvil | Escritorio | Registro |
|---|---|---|---|---|
| `--t-display` | Título del hero | 36 | 60 | Ancho 700 |
| `--t-h1` | Título de página, nombre del auto en la ficha | 24 | 36 | Ancho 700 |
| `--t-h2` | Títulos de sección | 21 | 24 | Ancho 700 |
| `--t-h3` | Nombre del auto en tarjeta | 18 | 18 | Ancho 700 |
| `--t-precio-xl` | Precio en la ficha | 36 | 48 | Angosto 800 |
| `--t-precio` | Precio en el cartel de la tarjeta | 24 | 24 | Angosto 800 |
| `--t-dato` | Valores de datos clave | 21 | 21 | Angosto 700 |
| `--t-base` | Texto, campos, botones | 16 / 1,55 | 16 / 1,55 | Normal 400 |
| `--t-chico` | Versión, notas, tabla | 14 / 1,45 | 14 / 1,45 | Normal 400 |
| `--t-rotulo` | Rótulos de datos y campos | 13 | 13 | Normal 600 |

### Reglas

- Rótulos en tipo oración y color de tinta suave. Nunca en mayúsculas espaciadas.
- Todas las cifras con `font-variant-numeric: tabular-nums` y formato es-AR: `US$ 42.900`, `$ 41.200.000`, `52.000 km`.
- Texto corrido con un máximo de 68 caracteres por línea.
- Todo alineado a la izquierda.
- Ningún título con una palabra resaltada en otro color o estilo.
- Campos de formulario a 16 px como mínimo, para que el iPhone no haga zoom al tocarlos.
- Carga con `font-display: swap` y una fuente de respaldo con métricas ajustadas (`size-adjust`), para que el texto no salte al cargar la fuente. No la precargamos: el LCP es siempre una foto y no queremos que compitan.
- Para generar las imágenes Open Graph usamos instancias estáticas de Archivo en TTF, porque Satori no lee woff2 ni fuentes variables.

---

## 3. Color

### 3.1 Paleta de la demo (Andino Autos)

| Nombre | Hex | Viene de | Rol |
|---|---|---|---|
| Nieve | `#F3F5F7` | config: fondo | Fondo general. Blanco frío, para que las fotos manden. |
| Asfalto | `#1B2129` | derivado | Texto. 14,8:1 sobre nieve. |
| Petróleo | `#0F3B57` | config: primario | Banda del cartel de usados, bloque de financiación, foco, chips activos. Texto blanco a 11,8:1. |
| Ámbar de giro | `#F0A202` | config: acento | Banda del cartel 0 km y muy poco más. Texto asfalto a 7,6:1. |
| Blanco cartel | `#FFFFFF` | fijo | El cartel es papel: siempre blanco, en cualquier agencia, para que el precio se lea igual con cualquier paleta. |

### 3.2 Colores fijos (no cambian por agencia)

| Nombre | Valor | Uso |
|---|---|---|
| Verde WhatsApp | `#25D366` con texto `#052E16` (7,5:1) | Todos los botones de WhatsApp. |
| Verde WhatsApp oscuro | `#0B6B3A` (6,6:1 sobre blanco) | Borde y texto de los botones secundarios de WhatsApp. |
| Cinta de reservado | rayado diagonal de tinta y blanco | Banda del cartel de las unidades reservadas. |
| Vendido | foto en escala de grises y banda asfalto | Unidades vendidas. |

El verde de WhatsApp es fijo porque el reconocimiento es lo que genera el toque. Lleva texto oscuro porque el blanco sobre `#25D366` no llega a 2:1 de contraste y Lighthouse lo marcaría.

### 3.3 Cómo se derivan los colores

La config trae tres colores. `src/lib/tema.ts` calcula el resto en el build (mezclas en OKLab) y los escribe como variables CSS en un `<style>` del layout, junto con `<meta name="theme-color">` para que la barra del navegador del celular tome el color de la agencia. No hay JavaScript involucrado.

| Variable | Sale de | Regla |
|---|---|---|
| `--c-fondo` | fondo | Tal cual. |
| `--c-superficie` | fondo | Blanco si el fondo es claro; fondo con 6 % de blanco si es oscuro. |
| `--c-tinta` | fondo | Asfalto si el fondo es claro; nieve si es oscuro. |
| `--c-tinta-suave` | tinta y fondo | Mezcla al 35 %, oscurecida hasta llegar a 4,5:1. |
| `--c-borde` | tinta y fondo | 14 % de tinta. |
| `--c-primario`, `--c-primario-texto` | primario | El texto es blanco o tinta, el que más contraste. |
| `--c-primario-suave` | primario y fondo | 8 % de primario, para chips activos y filas resaltadas. |
| `--c-acento`, `--c-acento-texto` | acento | Igual que primario. |
| `--c-foco` | primario | Si no llega a 3:1 contra el fondo, usa tinta. |

**Chequeo de contraste en el build:** si algún par de texto queda por debajo de 4,5:1, o algún elemento de interfaz por debajo de 3:1, el build muestra un aviso con el par y el valor. Cuando carguemos los colores de una agencia real, vamos a saber en segundos si hay que ajustar algo.

Hay un solo tema por agencia, sin modo oscuro automático: la marca se tiene que ver siempre igual. Si una agencia quiere un fondo oscuro, funciona igual porque todo se deriva.

---

## 4. Espacio, grilla y forma

**Escala de espacio (base 4 px):** `--e-1` 4 · `--e-2` 8 · `--e-3` 12 · `--e-4` 16 · `--e-5` 24 · `--e-6` 32 · `--e-7` 48 · `--e-8` 64 · `--e-9` 96.
Entre secciones: `--e-8` en móvil y `--e-9` en escritorio. Margen lateral: 16, 24 y 32 px según el ancho.

**Cortes:** diseño base a 375 px. A partir de 600 px, stock en 2 columnas. A partir de 900 px, filtros en columna lateral y ficha en dos columnas. A partir de 1200 px, stock en 3 columnas. Contenedor máximo de 1240 px.

**Radios según jerarquía** (no uno para todo):

| Elemento | Radio | Por qué |
|---|---|---|
| Cartel | 2 px | Es papel. |
| Fotos | 6 px | Apenas suavizadas. |
| Botones y campos | 10 px | Se reconocen como tocables. |
| Chips | redondeados completos | Se distinguen de los botones. |
| Paneles en móvil | 16 px arriba | Suben desde abajo. |

**Elevación:** las tarjetas no llevan sombra. Solo tienen sombra el cartel (corta y dura, como papel apoyado contra el vidrio), el botón flotante y los paneles abiertos.

**Bordes:** 1 px de `--c-borde`, solo donde separan información: tabla de especificaciones, campos, secciones del panel de filtros.

**Toque:** áreas táctiles de 44 px como mínimo. El botón flotante y la barra de la ficha respetan los márgenes seguros del iPhone (`env(safe-area-inset-bottom)`).

---

## 5. Movimiento

**Un solo momento orquestado:** al tocar un auto en el stock, su foto viaja hasta la galería de la ficha. Lo hacemos con View Transitions entre páginas, solo con CSS y sin JavaScript. Chrome y Safari recientes lo muestran; el resto navega normal. Con «reducir movimiento» activado en el sistema, no se anima.

El resto del movimiento responde siempre a una acción: el panel de filtros sube, el visor de fotos se abre, aparece el aviso «Link copiado». No hay apariciones al hacer scroll ni tarjetas que se agrandan al pasar el mouse.

| Token | Valor | Uso |
|---|---|---|
| `--m-rapido` | 120 ms | Estados de botón y chip. |
| `--m-panel` | 220 ms | Panel de filtros, menú, visor. |
| `--m-curva` | `cubic-bezier(.2, .8, .2, 1)` | Todo lo que entra. |

---

## 6. Componentes

### Cartel

El componente que hace distinto al sitio. Tiene tres partes: una banda arriba con la condición o el estado, el precio grande en angosto y una línea con año y kilómetros.

| Caso | Banda | Precio | Línea inferior | Foto |
|---|---|---|---|---|
| Usado disponible | Primario, «Usado» | `US$ 42.900` | `2022  52.000 km` | Normal |
| 0 km disponible | Acento, «0 km» | `$ 41.200.000` | `Modelo 2026` | Normal |
| Reservado | Cinta rayada con el rótulo «Reservado» | Visible | Igual que su condición | Normal |
| Vendido | Asfalto, «Vendido» | Sin precio | Año | Escala de grises |
| Sin precio publicado | Según condición | «Consultar precio» | Igual | Normal |

En la tarjeta, el cartel se apoya sobre el borde inferior izquierdo de la foto, mitad adentro y mitad afuera, como un cartel en el parabrisas. En la ficha va debajo del nombre del auto, más grande. Todos los estados se leen por texto, no solo por color.

### Tarjeta de auto

Sin caja ni sombra: foto 3:2, cartel, nombre en ancho (marca y modelo), versión en tinta suave y una línea en lenguaje natural con el combustible y la caja, por ejemplo «Diésel, automática». Toda la tarjeta es un solo link: un solo foco de teclado y un solo anuncio para el lector de pantalla. Las dos primeras fotos de la grilla cargan de inmediato; el resto, de forma diferida.

### Datos clave (ficha)

Grilla de 2 × 2: Año, Kilómetros, Combustible y Caja. Rótulo chico en tinta suave y valor grande en angosto. En las fichas usamos «Caja», que es como se dice en la agencia; en los datos el campo sigue siendo `transmision`.

### Botón de WhatsApp

Verde fijo, texto oscuro, ícono a la izquierda, 52 px de alto, ancho completo en el celular.

| Variante | Aspecto | Dónde |
|---|---|---|
| Principal | Lleno | «Consultar por WhatsApp», envío de formularios. |
| Secundario | Borde y texto verde oscuro sobre superficie | «Consultar financiación», «Coordinar test drive». |
| Compacto | Solo ícono y la palabra «WhatsApp» | Header. |

Estados: normal, presionado (fondo un 8 % más oscuro), foco (anillo de 3 px con 2 px de separación). Ningún botón de WhatsApp se deshabilita: si a un formulario le falta un dato, se marca el campo.

### Botón flotante

Círculo de 56 px abajo a la derecha, verde con ícono oscuro y nombre accesible «Escribinos por WhatsApp». Se oculta en la ficha, donde lo reemplaza la barra, y mientras hay un panel abierto. El mensaje cambia según la página.

### Barra de ficha (móvil)

Fija abajo: precio en angosto a la izquierda y botón «Consultar por WhatsApp» a la derecha. Siempre visible. El contenido tiene margen inferior para que la barra no tape nada.

### Galería y visor

Se desliza con `scroll-snap` nativo, sin librerías, y muestra un contador «3 de 8». En escritorio suma miniaturas. Al tocar una foto se abre el visor: un `<dialog>` a pantalla completa, deslizable, con flechas de teclado, Esc para cerrar y zoom con dos dedos.

### Barra de stock

Fija arriba al hacer scroll, con «Filtrar (2)» y «Ordenar». Debajo, los filtros activos como chips con una ✕ para quitarlos de a uno.

### Panel de filtros

En el celular es un `<dialog>` que sube desde abajo, con «Limpiar» arriba y un botón fijo abajo, «Ver 12 autos», que cuenta en vivo y se anuncia al lector de pantalla. En escritorio es una columna lateral.

| Filtro | Control |
|---|---|
| Marca, modelo | Selects; el de modelo solo muestra los de la marca elegida. |
| Año | Dos selects: desde y hasta. |
| Precio | Dos selects con escalones redondos calculados del stock, más un conmutador ARS / USD. |
| Kilómetros | Un select: «Hasta 30.000 km», etc. |
| Combustible, carrocería | Chips, con selección múltiple. |
| Caja, condición | Control segmentado: Todas / Manual / Automática; Todos / 0 km / Usados. |

Sin sliders dobles: en el celular son imprecisos y difíciles de usar con lector de pantalla.

### Estado vacío del stock

«No hay autos con estos filtros.» Debajo, «Limpiar filtros» y un botón de WhatsApp, «Contanos qué buscás». Un auto que no está en el stock también es una consulta.

### Campos de formulario

Rótulo visible siempre arriba (nunca solo un texto de ejemplo dentro del campo), 16 px, teclado numérico en año, kilómetros y anticipo. Los errores se explican en texto debajo del campo: «Falta el año del auto».

### Horario

La lista de horarios, más un estado calculado en el navegador con la zona horaria de la agencia: «Abierto ahora, cierra a las 13» o «Cerrado, abre a las 17». Contempla el horario cortado de Mendoza.

### Header y menú

Logo (o, si la agencia no tiene un logo en buen formato, su nombre compuesto en ancho), botón compacto de WhatsApp y menú. En el celular, el menú es un panel a pantalla completa con los cinco destinos, el teléfono y el horario. El header no queda fijo: la pantalla es para las fotos.

### Bloques de servicio (home)

Financiación y Tomamos tu usado, como dos bloques distintos: uno sobre primario y otro sobre superficie, cada uno con una frase y un botón. Solo aparecen si su switch está activo.

### Aviso

Mensaje corto abajo de la pantalla durante 2,5 s, con `role="status"`. Por ejemplo, «Link copiado».

### Testimonios (listo y apagado)

Componente terminado que lee `testimonios` de la config. En la demo la lista está vacía y la sección, desactivada.

---

## 7. Pantallas a 375 px

### Home

```
┌───────────────────────────────────┐
│ [Logo]         [WhatsApp]  [Menú] │
├───────────────────────────────────┤
│                                   │
│     FOTO DEL AUTO DESTACADO       │  4:3, a sangre (LCP)
│                                   │
│  ┌───────────────┐                │
│  │▓▓ Usado ▓▓▓▓▓▓│                │  cartel apoyado sobre el borde
├──│ US$ 42.900    │────────────────┤
│  │ 2022 52.000 km│                │
│  └───────────────┘                │
│  Toyota Hilux                     │
│  2.8 TDI SRX 4x4  Ver esta unidad │
│                                   │
│  Elegí tu próximo auto            │  h1 = eslogan de la config
│  y consultalo por WhatsApp.       │
│                                   │
│  [Marca          ▾]               │  buscador rápido
│  [Modelo         ▾]               │
│  [Precio         ▾]               │
│  [        Ver 16 autos          ] │  cuenta en vivo
├───────────────────────────────────┤
│  Destacados                       │
│  ┌──────────────┐ ┌───            │  carrusel: asoma la siguiente
│  │    FOTO      │ │               │
│  └──────────────┘ └───            │
├───────────────────────────────────┤
│  Por tipo                         │
│  (Pick-ups 5) (SUV 6) (Hatch 3)   │  cantidades reales del stock
├───────────────────────────────────┤
│  ███ Financiación ███████████████ │  sobre primario
│  [ Consultar financiación ]       │
│  Tomamos tu usado                 │  sobre superficie
│  [ Cotizar mi usado ]             │
├───────────────────────────────────┤
│  FOTO DEL LOCAL                   │
│  Dirección. Abierto ahora,        │
│  cierra a las 13. [Cómo llegar]   │
├───────────────────────────────────┤
│  Footer                      (WA) │  flotante
└───────────────────────────────────┘
```

El hero tiene un modo alternativo, la foto del local, para agencias sin una unidad que sostenga la portada.

### Stock

```
┌───────────────────────────────────┐
│ Header                            │
├───────────────────────────────────┤
│ Stock                             │  h1
│ 16 autos                          │
├───────────────────────────────────┤  fija al hacer scroll
│ [ Filtrar (2) ]   [ Ordenar ▾ ]   │
│ (Toyota ✕) (Pick-up ✕)            │
├───────────────────────────────────┤
│ ┌───────────────────────────────┐ │
│ │           FOTO 3:2            │ │
│ │ ┌──────────────┐              │ │
│ └─│▓▓ 0 km ▓▓▓▓▓▓│──────────────┘ │
│   │ $ 41.200.000 │                │
│   │ Modelo 2026  │                │
│   └──────────────┘                │
│   Toyota Corolla Cross            │
│   XEI 2.0 Hybrid                  │
│   Híbrido, automática             │
│                                   │
│ (siguiente tarjeta)               │
└───────────────────────────────────┘

Panel de filtros abierto:
┌───────────────────────────────────┐
│ Filtros                  Limpiar  │
│ Marca      [Toyota          ▾]    │
│ Modelo     [Todos           ▾]    │
│ Año        [2019 ▾]  [2024 ▾]     │
│ Precio  (ARS|USD) [Desde][Hasta]  │
│ Km         [Hasta 80.000 km ▾]    │
│ Combustible (Nafta)(Diésel)(...)  │
│ Caja       [Todas|Manual|Autom.]  │
│ Carrocería (SUV)(Pick-up)(...)    │
│ Condición  [Todos|0 km|Usados]    │
├───────────────────────────────────┤
│ [          Ver 4 autos          ] │
└───────────────────────────────────┘
```

### Ficha

```
┌───────────────────────────────────┐
│ Header                            │
│ Volver a tu búsqueda   [Compartir]│
├───────────────────────────────────┤
│                                   │
│      GALERÍA 4:3 (desliza)        │
│                           3 de 8  │
├───────────────────────────────────┤
│ Toyota Hilux                      │  h1, ancho
│ 2.8 TDI SRX 4x4 AT                │
│ ┌──────────────────┐              │
│ │▓▓ Usado ▓▓▓▓▓▓▓▓▓│              │  cartel grande
│ │ US$ 42.900       │              │
│ └──────────────────┘              │
│ Año          Kilómetros           │
│ 2022         52.000               │
│ Combustible  Caja                 │
│ Diésel       Automática           │
│                                   │
│ [ Consultar financiación ]        │  secundarios
│ [ Coordinar test drive   ]        │
│                                   │
│ Especificaciones (tabla)          │
│ Equipamiento                      │
│ Descripción                       │
│ Autos parecidos (carrusel)        │
├───────────────────────────────────┤  fija
│ US$ 42.900 [Consultar por WhatsApp]│
└───────────────────────────────────┘
```

«Volver a tu búsqueda» recuerda los filtros con los que el cliente llegó (se guarda en `sessionStorage`). Si entró directo desde un link de WhatsApp, dice «Ver todo el stock».

**Ficha reservada:** aviso arriba de los datos, «Este auto está reservado. Consultanos si se libera.» Los botones siguen igual.

**Ficha vendida:** el link nunca se rompe, porque ya circuló por WhatsApp. La galería se ve en escala de grises, el aviso dice «Este auto ya se vendió. Te mostramos otros parecidos.», los autos parecidos suben al principio y el botón principal pasa a «Buscar uno similar».

### Financiación y Tomamos tu usado

Formularios de una columna, con un único botón al final. Sin JavaScript, el botón abre WhatsApp con un mensaje genérico; con JavaScript, arma el mensaje completo.

**Financiación:** cómo funciona (tres pasos numerados, porque sí son una secuencia), requisitos desde la config y el formulario: auto de interés (select con el stock disponible más «Todavía no elegí»; viene preseleccionado si se llega desde una ficha con `?auto=slug`), anticipo, cantidad de cuotas (opciones de la config) y nombre. Botón «Enviar por WhatsApp». Al pie: «Sujeto a aprobación crediticia. Las condiciones las define la agencia.» Sin tasas ni cálculo de cuotas.

**Tomamos tu usado:** marca, modelo, versión, año, kilómetros, estado general (Muy bueno / Bueno / Con detalles) y comentario. Botón «Pedir cotización por WhatsApp».

---

## 8. Redacción

Voseo, oraciones cortas, tipo oración, sin emojis. En la interfaz no usamos signos de exclamación; en los mensajes de WhatsApp sí, respetando el tono del brief. Cada acción conserva el mismo nombre en todo el recorrido: el botón que dice «Compartir» produce el aviso «Link copiado».

### Textos clave

| Lugar | Texto |
|---|---|
| Ficha, botón principal | Consultar por WhatsApp |
| Ficha, secundarios | Consultar financiación / Coordinar test drive |
| Ficha vendida | Buscar uno similar |
| Stock | Filtrar / Ordenar / Limpiar filtros / Ver 12 autos |
| Orden | Recomendados / Menor precio / Mayor precio / Más nuevos / Menos km |
| Sin precio publicado | Consultar precio |
| Flotante (nombre accesible) | Escribinos por WhatsApp |
| 404 | Esta página no existe. Ver el stock |

### Mensajes de WhatsApp

Viven en `src/config/mensajes.ts`. Sin emojis.

| Origen | Mensaje |
|---|---|
| Ficha, consulta | Hola! Me interesa el {marca modelo versión año} ({link}). ¿Sigue disponible? |
| Ficha, financiación | Hola! Quiero consultar opciones de financiación para el {auto} ({link}). |
| Ficha, test drive | Hola! Quiero coordinar un test drive del {auto} ({link}). ¿Qué días y horarios tienen? |
| Ficha vendida | Hola! Vi que el {auto} ya se vendió ({link}). ¿Tienen algo similar? |
| Financiación | Hola! Soy {nombre}. Quiero financiar {el auto elegido o «un auto»}. Tengo un anticipo de {anticipo} y me interesan {cuotas} cuotas. ¿Qué opciones tienen? |
| Usado | Hola! Quiero cotizar mi usado: {marca modelo versión} {año}, {km} km, estado {estado}. {comentario} Les puedo mandar fotos por acá. |
| Stock vacío | Hola! Estoy buscando {filtros elegidos, en texto} y no lo encontré en la web. ¿Me avisan si les entra algo así? |
| Flotante, header, contacto | Hola! Estoy viendo la web de {agencia} y quiero hacer una consulta. |

El `{link}` es siempre la URL absoluta de la ficha. Cuando el cliente manda el mensaje, el vendedor ve en su chat la vista previa con la foto y el precio, y sabe de qué auto le hablan antes de leer.

---

## 9. Estructura de archivos

```
demo-concesionaria/
├── astro.config.mjs           site = agencia.sitio.url
├── integraciones/
│   └── headers.ts             genera dist/_headers desde la config
├── public/
│   ├── robots.txt             sin Disallow (ver §12)
│   └── fonts/                 Archivo woff2 variable + TTF estáticos para OG
└── src/
    ├── config/                ── LO QUE CAMBIA POR AGENCIA ──
    │   ├── agencia.ts         identidad, contacto, horarios, switches
    │   └── mensajes.ts        plantillas de WhatsApp
    ├── data/
    │   └── autos.ts           el stock
    ├── assets/
    │   ├── agencia/           logo, foto del local, foto de hero
    │   └── autos/<slug>/      01.jpg, 02.jpg… (la 01 es la portada)
    │                          ── DE ACÁ PARA ABAJO NO SE TOCA ──
    ├── schema/
    │   ├── auto.ts            Zod + tipos del stock
    │   └── agencia.ts         Zod + tipos de la config
    ├── lib/                   corre en el build
    │   ├── stock.ts           única puerta a los datos
    │   ├── tema.ts            colores derivados + chequeo de contraste
    │   ├── formato.ts         precios, km y fechas en es-AR
    │   ├── etiquetas.ts       'diesel' → 'Diésel', 'pickup' → 'Pick-up'
    │   ├── fotos.ts           rutas del stock → imágenes optimizadas
    │   ├── whatsapp.ts        whatsappUrl() y armado de mensajes
    │   ├── og.ts              imagen Open Graph (Satori + resvg + sharp)
    │   └── seo.ts             meta, canonical, JSON-LD
    ├── scripts/               corre en el navegador
    │   ├── filtros.ts         filtros, orden, URL y contador
    │   ├── galeria.ts         contador, miniaturas y visor
    │   ├── formularios.ts     financiación y usado → WhatsApp
    │   ├── compartir.ts       Web Share + copiar link
    │   ├── horario.ts         abierto ahora
    │   └── analitica.ts       un solo listener para todos los WhatsApp
    ├── components/
    │   ├── ui/                Boton, BotonWhatsApp, Campo, Select, Chips,
    │   │                      Segmentado, Panel, Aviso
    │   ├── auto/              Cartel, TarjetaAuto, DatosClave, Galeria, Visor,
    │   │                      TablaSpecs, Equipamiento, BarraFicha, Parecidos
    │   ├── stock/             BarraStock, PanelFiltros, ChipsActivos, EstadoVacio
    │   ├── home/              Hero, BuscadorRapido, Destacados, PorTipo,
    │   │                      Servicios, AgenciaResumen, Testimonios
    │   └── sitio/             Header, Menu, Footer, WhatsAppFlotante, Horario,
    │                          CreditoDevott
    ├── layouts/
    │   └── Base.astro         tokens de color, fuente, meta, noindex, analítica
    ├── pages/
    │   ├── index.astro
    │   ├── stock.astro
    │   ├── autos/[slug].astro
    │   ├── og/[slug].jpg.ts   imagen Open Graph por auto, generada en el build
    │   ├── financiacion.astro
    │   ├── tomamos-tu-usado.astro
    │   ├── la-agencia.astro
    │   ├── contacto.astro
    │   └── 404.astro
    └── styles/
        ├── base.css           reset, tipografía, foco
        ├── tokens.css         escalas fijas: espacio, tipo, radios, movimiento
        └── utilidades.css
```

Para una agencia nueva se tocan cuatro lugares: `config/agencia.ts`, `config/mensajes.ts` (si hace falta), `data/autos.ts` y `assets/`. Ningún componente.

Los componentes nunca importan `data/autos.ts`: todo pasa por `lib/stock.ts`. El día que llegue el panel de administración con base de datos, cambia el interior de esas funciones y nada más.

Si una sección está apagada, desaparece del menú, de la home y del footer, y su URL redirige a la home.

---

## 10. Esquema de datos

### 10.1 Stock

El esquema Zod es la única fuente de verdad: los tipos de TypeScript se infieren de él, el build valida `autos.ts` contra él y, más adelante, el panel va a validar contra lo mismo. Las claves van sin tildes ni ñ (`anio`, `transmision`) para que pasen sin problemas a URLs y columnas de base de datos.

```ts
// src/schema/auto.ts
import { z } from 'astro/zod';

export const COMBUSTIBLES = ['nafta', 'diesel', 'hibrido', 'electrico', 'gnc'] as const;
export const TRANSMISIONES = ['manual', 'automatica'] as const;
export const CARROCERIAS = [
  'sedan', 'hatchback', 'suv', 'pickup', 'utilitario', 'coupe', 'monovolumen',
] as const;

export const FotoSchema = z.object({
  src: z.string(),        // 'toyota-hilux-srx-2022-h7k2/01.jpg' (relativo a src/assets/autos/) o URL https
  alt: z.string().min(5), // 'Toyota Hilux SRX 2022 gris, vista delantera'
});

export const AutoSchema = z.object({
  id: z.string().min(1),                       // estable para siempre; futura clave primaria
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  marca: z.string().min(1),                    // 'Volkswagen', nunca 'VW'
  modelo: z.string().min(1),
  version: z.string(),
  anio: z.number().int().min(1950).max(2100),
  km: z.number().int().min(0),
  combustible: z.enum(COMBUSTIBLES),
  transmision: z.enum(TRANSMISIONES),
  carroceria: z.enum(CARROCERIAS),
  color: z.string(),
  condicion: z.enum(['0km', 'usado']),
  precio: z.number().positive().nullable(),    // null = «Consultar precio»
  moneda: z.enum(['ARS', 'USD']),
  estado: z.enum(['disponible', 'reservado', 'vendido']),
  destacado: z.boolean(),
  fotos: z.array(FotoSchema).min(1),           // la primera es la portada
  descripcion: z.string(),
  equipamiento: z.array(z.string()),
  fechaIngreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // 'AAAA-MM-DD'
});

export type Auto = z.infer<typeof AutoSchema>;
```

Respecto del brief, sumamos dos cosas: `alt` en cada foto (accesibilidad) y la posibilidad de `precio: null` para agencias que no publican precio.

**Reglas que valida el build** (además del esquema):

- `id` y `slug` únicos.
- 0 km con más de 100 km: aviso.
- Vendido y destacado a la vez: error.
- Unidades 0 km con el switch `ceroKm` apagado: aviso.
- Una foto que no existe en `assets/autos/`: error, con la ruta.

**El slug no se regenera nunca.** Se arma una vez (`toyota-hilux-srx-2022-h7k2`, con un sufijo corto que evita choques entre dos unidades iguales) y queda fijo. Si después cambia la versión o el precio, el link que ya circula por WhatsApp sigue funcionando.

### 10.2 Config de la agencia

```ts
// src/schema/agencia.ts (resumen del tipo; se valida con Zod igual que el stock)
type Dia = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

type Agencia = {
  nombre: string;
  eslogan: string;
  ciudad: string;                                 // 'San Martín, Mendoza'
  logo: { src: string; alt: string } | null;      // null: el nombre se compone con la tipografía
  colores: { primario: string; acento: string; fondo: string }; // hex
  contacto: {
    whatsapp: string;                             // solo dígitos: 54 9 + área + número
    telefono: string;                             // como se muestra
    email: string | null;
    direccion: string;
    mapsUrl: string;
  };
  horarios: { dias: Dia[]; franjas: [string, string][] }[]; // admite horario cortado
  zonaHoraria: string;                            // 'America/Argentina/Mendoza'
  redes: { instagram?: string; facebook?: string; tiktok?: string };
  moneda: {
    porDefecto: 'ARS' | 'USD';
    cotizacionReferencia: number;                 // ARS por 1 USD; solo para filtrar y ordenar
  };
  secciones: {
    financiacion: boolean;
    tomaUsados: boolean;
    ceroKm: boolean;
    testimonios: boolean;                         // false en la demo
  };
  hero: { tipo: 'auto'; autoId: string } | { tipo: 'foto'; src: string; alt: string };
  financiacion: { cuotas: number[]; requisitos: string[] };
  laAgencia: {
    historia: string[];                           // párrafos
    fotoLocal: string | null;
    fundacion: number | null;                     // null en la demo: no inventamos trayectoria
  };
  testimonios: { nombre: string; texto: string }[]; // vacío en la demo
  sitio: { url: string; indexar: boolean; creditoDevott: boolean };
  analitica: { proveedor: 'umami' | 'plausible' | 'ga4' | 'ninguno'; id: string };
};
```

El archivo `agencia.ts` se escribe con `satisfies Agencia`, así el editor autocompleta y marca los errores mientras se completa.

Si el auto del hero está vendido o no existe, se usa el primer destacado disponible y el build avisa.

### 10.3 Precios en dos monedas

Cada auto se muestra siempre en la moneda y con el precio que cargó la agencia: nunca convertimos un precio a la vista. Pero para filtrar por rango y ordenar por precio un stock que mezcla pesos y dólares hace falta comparar, así que usamos la `cotizacionReferencia` de la config solo internamente. El filtro de precio tiene un conmutador ARS / USD (arranca en la moneda por defecto) y los escalones se calculan redondos a partir del stock.

### 10.4 Filtros en la URL

Nombres cortos y legibles, para que una búsqueda compartida por WhatsApp se entienda:

| Parámetro | Ejemplo | Nota |
|---|---|---|
| `marca` | `toyota` | Slug de la marca. |
| `modelo` | `hilux` | Solo si hay marca. |
| `anio` | `2019-2024`, `2019-` | Desde y hasta; cualquiera puede faltar. |
| `precio` | `15000-30000` | En la moneda de `moneda`. |
| `moneda` | `usd` | Si falta, la de la config. |
| `km` | `80000` | Máximo. |
| `comb` | `diesel,nafta` | Varios. |
| `caja` | `automatica` | |
| `carr` | `suv,pickup` | Varios. |
| `cond` | `0km`, `usado` | |
| `orden` | `precio-asc`, `precio-desc`, `nuevos`, `km` | Si falta, Recomendados. |

El buscador del hero es un formulario GET a `/stock` con estos mismos nombres, así que funciona aunque falle el JavaScript. En `/stock`, cada tarjeta lleva sus datos en atributos `data-*` y el script filtra sobre el HTML que ya está en la página, sin descargar nada. El script de filtros va justo después de la grilla para aplicar los filtros de la URL antes de que se vea el stock completo.

**Orden «Recomendados»** (por defecto): disponibles, después reservados y al final vendidos; dentro de cada grupo, destacados primero y luego por fecha de ingreso, del más reciente al más antiguo.
**«Más nuevos»**: año más reciente primero; a igual año, el último ingresado.

**Autos parecidos:** misma carrocería (2 puntos), precio dentro de ±20 % (2 puntos), misma marca (1 punto). Se excluyen el propio auto y los vendidos, y se muestran los 4 con más puntos.

---

## 11. WhatsApp y analítica

**Armado del link:** `whatsappUrl(mensaje)` devuelve `https://wa.me/{numero}?text={encodeURIComponent(mensaje)}`. El número se valida en el build (solo dígitos, con el 9 de celular de Argentina). En la demo genérica, todos van a 5492634280036.

- En la ficha, los links se arman en el build: son `href` estáticos que funcionan sin JavaScript.
- En los formularios, el mensaje se arma al enviar.
- Todos abren con `target="_blank"`: en el celular pasan a la app de WhatsApp y en la computadora abren WhatsApp Web sin perder la página.
- Test unitario de las plantillas con tildes, ñ, «¿», «&», «#» y saltos de línea, más una prueba manual en Android y en iPhone.

**Medición:** cada link de WhatsApp lleva `data-wa-origen` (y `data-wa-motivo` cuando corresponde). Un único listener en `analitica.ts` captura todos los clics y envía un evento `whatsapp_click`. No hay código de medición repartido por los componentes.

| origen | motivo | Dónde |
|---|---|---|
| `ficha` | `consulta`, `financiacion`, `test_drive`, `similar` | Botones de la ficha y de su barra fija. |
| `financiacion` | | Formulario de financiación. |
| `usado` | | Formulario de usados. |
| `flotante` | | Botón flotante. |
| `header` | | Botón del header. |
| `contacto` | | Página de contacto y footer. |
| `stock_vacio` | | Estado vacío del stock. |

Cada evento lleva también `auto` (el slug, si hay uno) y `pagina`.

**Proveedor:** proponemos **Umami**. Pesa unos 2 KB, no usa cookies (no hace falta aviso), registra eventos con propiedades y tiene un plan gratuito. Cloudflare Web Analytics no registra eventos personalizados y GA4 pesa bastante más y pide aviso de cookies. Queda detrás de una función `track()`, así que cambiar de proveedor es cambiar la config.

---

## 12. Rendimiento, accesibilidad y SEO

### Presupuesto

| Recurso | Límite |
|---|---|
| JavaScript propio | Hasta 12 KB comprimido en stock y ficha; hasta 3 KB en el resto. |
| CSS | Un solo archivo, hasta 15 KB comprimido. |
| Fuente | Un archivo woff2 variable. |
| Foto LCP a 375 px | Hasta 100 KB (AVIF, con WebP de respaldo). |
| Mapa | Nunca un iframe al cargar: tarjeta con dirección y «Cómo llegar»; el mapa embebido carga solo si el usuario lo toca. |
| Saltos de diseño | Cero: todas las fotos con `aspect-ratio` y fuente de respaldo ajustada. |

Fotos con `<Picture>` de Astro: AVIF y WebP, anchos de 360 a 1440 y `sizes` correctos. La foto LCP lleva `fetchpriority="high"` y carga de inmediato; el resto, diferida.

### Accesibilidad

Idioma `es-AR`, link «Saltar al contenido», landmarks, un solo `h1` por página, foco visible en todo, paneles con `<dialog>` (manejo de foco nativo), contador de resultados con `aria-live`, rótulo en todos los campos, estados comunicados por texto, `alt` en todas las fotos, áreas táctiles de 44 px y respeto de «reducir movimiento».

### SEO, noindex y Lighthouse

**Hay un choque en el brief.** Con `noindex`, Lighthouse no puede dar 95 en SEO: una de sus auditorías de mayor peso es justamente «la página no está bloqueada para indexar», y al fallarla el puntaje cae a alrededor de 65. Propuesta: `sitio.indexar` controla todo. La demo se publica con `indexar: false` y el puntaje de SEO se mide con un build `indexar: true`, donde todo lo demás tiene que dar 95 o más.

Con `indexar: false`:

- `<meta name="robots" content="noindex">` en todas las páginas, más el encabezado `X-Robots-Tag: noindex` en `_headers`.
- `robots.txt` **sin** `Disallow`. Si bloqueamos ahí, los buscadores no ven el noindex y, además, se arriesga la vista previa de los links en WhatsApp.
- Sin sitemap.

Con `indexar: true`: sitemap, canonical y JSON-LD de `Car` con su `Offer` en cada ficha y de `AutoDealer` en La agencia, armados solo con datos de la config.

### Open Graph

Cada ficha tiene su imagen generada en el build por `pages/og/[slug].jpg.ts`: Satori arma la composición, resvg la convierte y sharp la comprime a JPEG de 1200 × 630, liviano (apuntamos a menos de 300 KB, que es lo que WhatsApp muestra sin problemas). La composición es la foto del auto con el cartel grande, el nombre en ancho y el logo de la agencia. Si el auto está vendido, el cartel lo dice.

- `og:title`: «Toyota Hilux 2.8 TDI SRX 2022, US$ 42.900»
- `og:description`: «52.000 km, diésel, automática. Andino Autos, San Martín, Mendoza.»
- Las URLs son absolutas. El nombre del archivo incluye un hash de precio, estado y foto, para que cuando WhatsApp vuelva a leer la página no reutilice una imagen vieja.
- Las demás páginas usan una imagen general armada con el hero y el nombre de la agencia: es lo primero que va a ver el dueño cuando le pasen el link.

### Cloudflare Pages

`_headers` se genera en el build desde la config: noindex, caché inmutable para `/_astro/*` y encabezados de seguridad básicos. Si el dominio pasa por el proxy de Cloudflare, hay que tener Rocket Loader apagado, porque reordena los scripts.

---

## 13. Contenido de ejemplo

### Stock planeado (16 unidades)

| # | Unidad | Año | Condición | Carrocería | Moneda | Estado | Destacado |
|---|---|---|---|---|---|---|---|
| 1 | Toyota Hilux doble cabina 4x4 | 2022 | Usado | Pick-up | USD | Disponible | Sí (hero) |
| 2 | Toyota Corolla Cross híbrido | 2026 | 0 km | SUV | ARS | Disponible | Sí |
| 3 | Volkswagen Amarok V6 | 2021 | Usado | Pick-up | USD | Reservado | |
| 4 | Volkswagen Taos | 2023 | Usado | SUV | USD | Disponible | Sí |
| 5 | Ford Ranger | 2024 | Usado | Pick-up | USD | Disponible | Sí |
| 6 | Ford Territory | 2026 | 0 km | SUV | ARS | Disponible | |
| 7 | Fiat Cronos | 2023 | Usado | Sedán | ARS | Disponible | |
| 8 | Fiat Toro diésel | 2021 | Usado | Pick-up | USD | Disponible | |
| 9 | Chevrolet Onix | 2026 | 0 km | Hatchback | ARS | Disponible | |
| 10 | Chevrolet Tracker | 2022 | Usado | SUV | ARS | Disponible | Sí |
| 11 | Peugeot 208 | 2022 | Usado | Hatchback | ARS | Disponible | |
| 12 | Peugeot 2008 | 2026 | 0 km | SUV | ARS | Disponible | Sí |
| 13 | Renault Kangoo furgón | 2021 | Usado | Utilitario | ARS | Disponible | |
| 14 | Toyota Yaris | 2021 | Usado | Sedán | ARS | Disponible | |
| 15 | Renault Duster | 2020 | Usado | SUV | ARS | Disponible | |
| 16 | Toyota Etios | 2019 | Usado | Hatchback | ARS | Vendido | |

Queda una mezcla de 4 unidades 0 km y 12 usadas, 5 en dólares y 11 en pesos, una reservada, una vendida y seis destacadas, con nafta, diésel e híbrido, cajas manuales y automáticas y seis tipos de carrocería, así que todos los filtros tienen algo que mostrar. Las versiones exactas las definimos en el paso de datos, chequeadas contra la oferta actual del mercado argentino.

**Precios:** los calibramos con ustedes justo antes de mostrar la demo. En pesos quedan viejos en semanas, y un dueño de agencia detecta un precio irreal en dos segundos.

### Fotos

Usamos fotos con licencia libre (Unsplash, Pexels) solo cuando muestran el modelo correcto, sin patentes legibles ni marcas de otra agencia, y registramos la fuente de cada una en un archivo de créditos. Donde no haya una foto que sirva, va un placeholder prolijo: la silueta de la carrocería sobre superficie, con el cartel igual que en cualquier otro auto.

### Lo que dejamos apagado

Testimonios (componente listo, lista vacía), año de fundación (`null`) y cualquier cifra de ventas, premio o trayectoria. El texto de La agencia describe qué hace la agencia sin números.

### Recomendación para las tres reuniones

Armar cada demo con el stock y las fotos reales de esa agencia, que ya están publicados en su sitio actual, además de su nombre, logo y colores. Ver sus propios autos en su propia marca es lo que hace que el dueño sienta que el sitio ya es suyo.

---

## 14. Qué descartamos y por qué

- **Fondo crema con acento terracota.** Hoy es la señal más reconocible de una página generada en serie. Elegimos un blanco frío que no le discute protagonismo a las fotos.
- **Azul con amarillo.** En Argentina se lee como camiseta de fútbol, y vamos a ver a tres dueños distintos.
- **Tarjetas en cajas con la misma sombra y el mismo radio.** Es la estética de plantilla que queremos dejar atrás. El stock se muestra como fotos con su cartel.
- **Mayúsculas espaciadas sobre cada título, separadores con puntos medios, flechas en los botones, tipografía monoespaciada para datos.** Son muletillas de plantilla. Usamos rótulos en tipo oración y frases como «Diésel, automática».
- **Una línea de cordillera decorativa.** Estuvo en el primer plan y la sacamos: no aporta información.
- **Animaciones de entrada por sección.** Dejamos una sola transición, la que provoca el usuario al tocar un auto.
- **Sliders dobles de precio y año.** Imprecisos en el celular y poco accesibles.

---

## 15. Para confirmar antes de arrancar

1. **El cartel** como elemento distintivo, con la regla tipográfica de ancho para nombrar y angosto para contar.
2. **Paleta de la demo:** nieve, asfalto, petróleo y ámbar de giro.
3. **Precio opcional** (`precio: null` muestra «Consultar precio»).
4. **Cotización de referencia** en la config, solo para filtrar y ordenar con monedas mezcladas.
5. **«Más nuevos»** interpretado como año más reciente.
6. **Vendidos visibles** al final del stock y con la ficha activa, ofreciendo autos parecidos.
7. **SEO medido con `indexar: true`**, porque con noindex el 95 es imposible.
8. **Umami** como herramienta de analítica.
9. **Un subdominio por agencia** (por ejemplo, `andino.demo.devott.com.ar`), para que el link que le llega al dueño se vea prolijo.
10. **Demos con stock real** para las tres agencias.
