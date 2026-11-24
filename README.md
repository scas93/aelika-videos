# Aelika · videos

Proyecto en [Remotion](https://www.remotion.dev/) (React → MP4) para los videos de Aelika. Hay **varios tipos de video**, cada uno en su carpeta de `src/videos/`:

**Onboarding:** todo video nuevo empieza preguntando su tipo (skill `video-nuevo`). Cada tipo tiene una ficha `src/videos/<tipo>/TIPO.md` con qué preguntar, qué assets se necesitan, de qué base partir, sus reglas de calidad y una sección de **Aprendizajes** que crece con cada video, para no perder las mejoras. Cada video guarda su `brief.md` (respuestas, origen de los assets, qué datos son reales).

| Tipo | Carpeta | Para qué es | Estado |
|---|---|---|---|
| **Demos comerciales** | `src/videos/demos/` | Herramienta de venta: simulan el flujo completo de un cliente con la **marca del prospecto** (su logo, colores, productos y precios) para que se imagine usando Aelika. Se mandan uno a uno a cada prospecto. | En uso: Casa Occidente, Detona, La Carnicería Lira, Pulso Studio (genérico de fitness), Karmele (dos perspectivas), Café Aurora (genérico de cafetería con iPad) y su versión "pide y pasa sin fila" |
| **Marketing** | `src/videos/marketing/` | Anuncios y reels para redes, piezas de marca, etc. | Próximamente (ficha inicial en `src/videos/marketing/TIPO.md`) |

En **las demos comerciales** importa, sobre todo:
- **Personalización:** que el prospecto vea *su* negocio. Usa sus datos reales; los datos inventados (reseñas, seguidores, precios) solo en las demos genéricas.
- **Fidelidad al producto:** mostrar solo funciones que Aelika tiene y que se parezcan a la app real.
- **Duración:** 60–70 s está bien (se manda directo al prospecto, no es un anuncio).

`grabacion/` tiene además demos hechas **grabando la app real** (Karmele y Banetto Mayoreo), con otro método (ver abajo).

## Demos comerciales

Plantilla para videos verticales (1080×1920, 30 fps) que muestran cómo un cliente llega desde Instagram, WhatsApp, Google Maps o Facebook hasta comprar, reservar o agendar en un **storefront de Aelika**.

Cada demo sigue la misma estructura:

1. **Intro de Aelika**: el logo animado (~4 s).
2. **El flujo dentro del teléfono**: las escenas que tú eliges, con dedo, zooms 🔍 y subtítulos.
3. **Add-ons**: tarjetas con funciones extra.
4. **Outro de Aelika**: el lema y el contacto de ventas.

Un video nuevo es **un archivo de configuración**; no hay que tocar la plantilla.

## Uso rápido

```bash
npm install
npm run studio                                  # vista previa interactiva en el navegador
npm run new -- pulso-studio gym-titan GymTitan "Gym Titán"   # video nuevo a partir de uno existente
npm run check -- GymTitan --sheet               # revisión automática + hoja de cuadros (out/GymTitan-hoja.png)
npm run render -- GymTitan --formats 9x16,4x5,16x9   # MP4 vertical, 4:5 y 16:9 + miniatura PNG
npm run render:all                              # todos los videos registrados
npm run review -- GymTitan                      # carpeta out/revision/GymTitan/ para aprobar con el cliente
```

- **`check`** revisa antes de renderizar: archivos que faltan en `public/`, frases de voz que se enciman o se salen del video, huecos largos sin voz y subtítulos demasiado largos. Sale con error si encuentra problemas.
- **`render`** normaliza el audio a **-14 LUFS** (el nivel de Instagram/TikTok/YouTube) y saca la miniatura (`out/<Id>.png`). Los formatos 4:5 y 16:9 ponen el video vertical sobre el mismo fondo, extendido a lo ancho.
- **`review`** junta un video ligero (720p), la hoja de cuadros y la revisión automática en una página `index.html`.

Para capturas sueltas: `node scripts/stills.mjs <Id> out/stills 140 520 1300`.

> Chromium se detecta solo (`scripts/browser.mjs`): en la nube de Claude usa el que viene instalado. Si quieres otro, indícalo con `REMOTION_BROWSER=/ruta/al/chrome`.

## Crear una demo nueva

Lo más rápido es `npm run new -- <base> <carpeta> <Id> "Nombre"`, que copia la demo más parecida
(citas → `casa-occidente`, clases → `detona` o `pulso-studio`, pedidos de comida → `lacarniceria-lira`) y la registra.
Por pasos:

1. Copia la carpeta de fotos a `public/<negocio>/` (logo redondo, fotos del feed, etc.).
2. Copia `src/videos/demos/casa-occidente/config.tsx` a `src/videos/demos/<negocio>/config.tsx` y cambia:
   - `id`: el nombre de la composición, sin espacios (p. ej. `TaqueriaElGuero`).
   - `brand`: el nombre, el logo, los colores, la tipografía y el fondo (`canvas: 'light'` para marcas claras).
   - `scenes`: la lista de escenas en orden (ver abajo).
   - `addons`: las tarjetas del final (opcional).
   - `outro`: lema, contacto y botón (`cta`, p. ej. "Agenda tu demo"), todos opcionales.
   - `narration`: voz en off, un audio por frase anclado a una escena: `{clips: [{src: 'narracion/detona/01.mp3', anchor: 'intro'}, {src: '…', anchor: {scene: 2, mark: 'pay'}, offset: 0.2}]}`. `anchor` es `'intro'`, `'addons'`, `'outro'`, el índice de la escena en `scenes` o, mejor, **una marca de la escena** (`{scene, mark}`): así la frase sigue al momento aunque cambien los tiempos. `offset` (segundos) puede ser negativo. Si hay narración, baja la música (`music.volume` ≈ 0.15).
     Marcas disponibles: `entryPoints` → `cards, merge` · `whatsappChat` → `turn0, turn1…` (inicio de cada turno del guion) · `classesStorefront` → `cover, schedule, filter, detail, identify, pay, applePay, done` · `ordersStorefront` → `menu, add, cart, delivery, quote, pay, applePay, done` · `appointmentsStorefront` → `menu, service, staff, date, data, summary, success` · `recordedClip` → las que le pongas.
   - Para generar la narración con ElevenLabs: escribe el guion en `src/videos/demos/<negocio>/narracion.json` (`voiceId`, `speed`, `lines`) y corre `NODE_USE_ENV_PROXY=1 node scripts/narrate.mjs src/videos/demos/<negocio>/narracion.json public/narracion/<negocio>` (en tu computadora con `ELEVENLABS_API_KEY`; en la nube de Claude la llave la inyecta el entorno). Con el plan gratuito de ElevenLabs solo funcionan las voces incluidas en la cuenta (p. ej. Sarah o Eric), no las de la biblioteca pública. Imprime la duración de cada frase para acomodar los `offset`. Con `--only 2,4,6` regenera solo esas frases.
   - `cover`: portada del primer frame, que WhatsApp usa como miniatura: `{kicker, title: [línea1, línea2]}` o `{useOutro: true}` para usar la pantalla final de Aelika (logo, lema y contacto). Dura 0.6 s y se desvanece hacia el intro.
   - `music`: pista de fondo, p. ej. `{src: 'musica/pista.mp3', volume: 0.8, startAt: 12}`. Entra suave y se desvanece al final. `startAt` es el segundo de la canción en que arranca el video. Las pistas van en `public/musica/`, que no se sube al repo por la licencia de la música: hay que descargarlas de nuevo (p. ej. Detona usa *Chill House · Sunset Groove* de TurtleBeats en Pixabay, guardada como `public/musica/sunset-groove.mp3`).
3. Regístralo en `src/videos/demos/index.ts`.
4. `npm run studio` para revisarlo y `npm run render -- <id>` para exportarlo.

`src/videos/demos/TIPO.md` tiene qué preguntarle al prospecto, los assets que se necesitan, las bases y los aprendizajes; cada demo guarda sus respuestas en su `brief.md`.

### Demo genérica de fitness (Pulso Studio)

`src/videos/demos/pulso-studio/config.tsx` es una demo **genérico** para estudios y gimnasios con una marca ficticia, *Pulso Studio*.
La narración (Sarah) no menciona el nombre del negocio, así que **para personalizarlo a un prospecto no hay que regenerar la voz**:

1. `npm run new -- pulso-studio <gimnasio> <Id> "Nombre"` (o copia `src/videos/demos/pulso-studio/` a mano y regístralo en `src/videos/demos/index.ts`).
2. En `config.tsx` cambia `id`, `brand` (nombre, logo, colores), los textos de `entryPoints` y `whatsappChat`, y en el storefront el título, las fotos, las clases, los coaches y los precios.
3. Deja `narration` apuntando a `narracion/pulso-studio/…` (es el mismo audio para todos).
4. Revisa con `npm run check -- <Id> --sheet` antes de exportar (sobre todo si cambias el número de opciones o pasos).

## Escenas disponibles

| Escena | Función | Duración | Qué hace el dedo |
|---|---|---|---|
| Puntos de entrada | `entryPoints({...})` | 6 s | Hasta 4 tarjetas (`channels`: Google Maps, Instagram, Facebook, sitio web, QR) tocan WhatsApp y convergen en el teléfono. Los textos de las tarjetas se cambian con `copy` |
| Post de Instagram | `instagramPost({...})` | 3 s | Doble toque (like) y toca la cuenta |
| Perfil de Instagram | `instagramProfile({...})` | 4 s | Desliza las historias y toca el link de la bio |
| Linktree | `linktree({...})` | 3 s | Toca uno de los botones |
| Chat de WhatsApp | `whatsappChat({...})` | automática | Envía mensajes y toca la tarjeta con botón. Mensajes con `image` (foto + texto), `footer` ("Mensaje automático de Aelika"), `cta` + `tapCta` (botón con link dentro de la burbuja, p. ej. "Ver pedido"), `cta2` (segundo botón, p. ej. "Hablar con cliente"), `avatar` del chat (imagen o componente) y `perspective` |
| Storefront de citas | `appointmentsStorefront({...})` | 20 s | Servicio → extra → profesional → día y hora → datos → confirmar |
| Storefront de clases | `classesStorefront({...})` | 35 s | Portada → día → filtro → detalle → WhatsApp + código → paquete/Apple Pay → lugar apartado |
| Storefront de pedidos | `ordersStorefront({...})` | 34 s | Menú con fotos (toca "+" según `qty` de cada producto, con scroll) → carrito → a domicilio con **cotización de Uber** (precio y tiempo) o para recoger → resumen con productos y envío por separado → Apple Pay → pedido confirmado con seguimiento |
| Storefront para recoger | `pickupStorefront({...})` | 27 s | Menú (toca "+" según `qty`, rápido como dejando presionado) → carrito → datos → día y horario (opcional: "sin cupo"/"lleno"; nota con `scheduleNote`) → resumen con nota de pago → pedido enviado, pendiente de confirmación. `badge` en un producto (tarjeta destacada con listón), `now` (modo "recoger ya": recoger lo antes posible → pagar en tienda o con tarjeta → Apple Pay → confirmado; con `now.times` elige cuándo pasa —ahorita, 30, 45, 60 min u otra hora; con `now.custom`, "Otra hora" abre día y hora— y paga en tienda, tarjeta o Apple Pay; marcas `checkout, time, card, applePay, paid, done`), `phonePrefilled` (teléfono desde WhatsApp) y textos de solicitud (`sendLabel`, `sentTitle`, `sentPill`, `sentNote`, `sentBanner`). Marcas `menu, add, cart, data, schedule, day, slot, summary, send, sent` |
| Aceptar propuesta y pagar | `pickupPay({...})` | 13 s | Link que manda el bot: propuesta de hora (Aceptar y pagar / Rechazar; sin `proposal` abre directo en el pago) → resumen, hora acordada y tarjeta (o, con `method: 'applePay'`, las opciones Apple Pay / tarjeta / en tienda y la hoja de Apple Pay) → pedido confirmado. Marcas `proposal, accept, pay, card, paid, done` |
| iPad del local | `tabletOrders({...})` | 7.7 s | iPad horizontal (capa sobre el lienzo) con la vista de pedidos: columna de pedidos y detalle; llega el pedido nuevo con aviso y se abre. Marcas `open, arrive, detail` |
| Panel de Aelika: pedido | `orderPanelReview({...})` / `orderPanelPayment({...})` / `orderPanelView({...})` | 12 s / 7 s | El panel (app.aelika.com) dentro del navegador de WhatsApp. Revisión: solicitud "Por confirmar" → Confirmar hora / Proponer otra hora → día y hora → enviar propuesta (marcas `open, kitchen, propose, send, sent`). Pago: comprobante → Marcar pagado (marcas `open, paid`). Ver: pedido pagado con la hora en que pasan, solo lectura (marcas `open, detail`). Toast "Le avisamos al cliente por WhatsApp" |
| Panel de Aelika | `aelikaPanel({...})` | 5 s | Ocupación de la clase + notificación al equipo |
| Grabación real | `recordedClip({src, from, length, speed})` | la que indiques | Un video grabado de la app (p. ej. de `grabacion/`, 1170×2532) dentro del teléfono; tiempos de `taps`, `zooms`, `subtitles` y `marks` en segundos |

### Chat de WhatsApp por guion

Solo se escribe la conversación; los tiempos se calculan solos:

```ts
whatsappChat({
  title: 'Casa Occidente Gdl',
  script: [
    {from: 'user', text: 'Hola, me gustaría obtener información', prefilled: true, sub: 'Y ya estás en su WhatsApp.'},
    {from: 'bot', text: '¡Hola! 👋 ¿En qué te puedo ayudar?', sub: 'Te contesta al instante.'},
    {from: 'user', text: 'Quiero agendar'},
    {from: 'bot', text: '*¡Perfecto!* Agenda aquí:', card: {image: 'negocio/foto.jpg', button: 'Agendar mi cita'}, tap: true, zoom: true},
  ],
})
```

- `*texto*` se muestra en negritas.
- `sub` cambia el subtítulo en ese momento.
- `pause` da más o menos tiempo de lectura.
- `zoom` hace zoom al mensaje y `highlight` lo resalta.
- `card` + `tap` crean la tarjeta con botón, y el cliente la toca.
- `buttons` + `tapButton` crean respuestas rápidas ("Sí, ahí estaré"), y el cliente toca una.
- `menu` crea un menú numerado de opciones tocables; con `tapMenu` el cliente toca una y se envía como su respuesta.
- `{from: 'jump', label: 'Miércoles · 20:00'}` inserta una cortinilla de salto de tiempo.

### Varias perspectivas

Cualquier escena acepta `perspective: {label, sub?, icon?: 'person' | 'store', color?}` (en `whatsappChat` va dentro de sus datos). Muestra una etiqueta arriba del teléfono ("CLIENTE", "KARMELE · PEDIDOS") que se mantiene hasta que otra escena la cambie. Ejemplo: `src/videos/demos/karmele/`.

## Grabaciones de la app real

`grabacion/` tiene otro método: **grabar la app real** de Aelika en staging con Playwright (toques, eventos, recorte de esperas) y componerla en su propio proyecto de Remotion. Así se hicieron los videos de **Karmele** (pedido B2C con Stripe) y **Banetto Mayoreo** (B2B con login por código de WhatsApp). Ver `grabacion/README.md`.

## Estructura

```
src/
  core/          motor: teléfono, dedo, cámara/zooms, subtítulos, marca, línea de tiempo
  aelika/        intro y outro de Aelika (iguales en todos los videos)
  scenes/        escenas reutilizables (instagram, linktree, whatsapp, add-ons, grabación real)
    storefront/  storefronts por giro (shell.tsx = piezas comunes)
  videos/        un registro por tipo de video (index.ts junta todos)
    demos/       demos comerciales: TIPO.md (ficha) + index.ts + una carpeta por video (config.tsx, brief.md, narracion.json)
    marketing/   (próximamente) TIPO.md
public/          fotos y logos (una carpeta por negocio), narración y música
scripts/         render, revisión, arranque de videos, narración
grabacion/       demos grabando la app real (proyecto aparte, ver grabacion/README.md)
```

## Pendiente: otros giros

Por ahora existen los storefronts de **citas**, **clases** y **pedidos de comida** (sin extras por producto todavía). Los siguientes se construyen sobre `scenes/storefront/shell.tsx` conforme se necesiten:

- **Tienda**: catálogo → talla y color → carrito → envío → pago → guía.
- **Pedidos por encargo**: producto → personalización → fecha → anticipo.

Otros canales que todavía no existen: Facebook (página y Messenger) y post o reel de TikTok.

### Novedades (Maké, 2026-11-24)

- `pickupStorefront({now: {custom: {direct: true, days, slots, pickDay, pickSlot}}})`: el cliente elige día y hora directo, sin opciones rápidas.
- `thermalPrinter({...})`: la comanda sale impresa en una impresora térmica (escena de ~5.5 s, capa sobre el lienzo).
- `entryPoints` acepta el canal `igpost` (post de Instagram con botón "Enviar mensaje de WhatsApp"; `postImage`, `postCaption`).
