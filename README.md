# Aelika · videos de flujo

Plantilla en [Remotion](https://www.remotion.dev/) (React → MP4) para hacer videos verticales (1080×1920, 30 fps) que muestran cómo un cliente llega desde Instagram, WhatsApp o Facebook hasta comprar o agendar en un **storefront de Aelika**.

Cada video sigue la misma estructura:

1. **Intro de Aelika**: el logo animado (~4 s).
2. **El flujo dentro del teléfono**: las escenas que tú eliges, con dedo, zooms 🔍 y subtítulos.
3. **Add-ons**: tarjetas con funciones extra.
4. **Outro de Aelika**: el lema y el contacto de ventas.

Un video nuevo es **un archivo de configuración**; no hay que tocar la plantilla.

## Uso rápido

```bash
npm install
npm run studio                 # vista previa interactiva en el navegador
npm run render -- CasaOccidente   # exporta out/CasaOccidente.mp4
```

Para revisar sin exportar todo, renderiza capturas sueltas:

```bash
node scripts/stills.mjs CasaOccidente out/stills 140 520 1300
```

> Si tienes un Chromium propio (por ejemplo, en un servidor), indícalo con `REMOTION_BROWSER=/ruta/al/chrome`.

## Crear un video nuevo

1. Copia la carpeta de fotos a `public/<negocio>/` (logo redondo, fotos del feed, etc.).
2. Copia `src/videos/casa-occidente/config.tsx` a `src/videos/<negocio>/config.tsx` y cambia:
   - `id`: el nombre de la composición, sin espacios (p. ej. `TaqueriaElGuero`).
   - `brand`: el nombre, el logo, los colores, la tipografía y el fondo (`canvas: 'light'` para marcas claras).
   - `scenes`: la lista de escenas en orden (ver abajo).
   - `addons`: las tarjetas del final (opcional).
   - `outro`: lema, contacto y botón (`cta`, p. ej. "Agenda tu demo"), todos opcionales.
   - `narration`: voz en off, un audio por frase anclado a una escena: `{clips: [{src: 'narracion/detona/01.mp3', anchor: 'intro'}, {src: '…', anchor: 2, offset: 0.5}]}`. `anchor` es `'intro'`, `'addons'`, `'outro'` o el índice de la escena en `scenes`. Si hay narración, baja la música (`music.volume` ≈ 0.15).
   - Para generar la narración con ElevenLabs: escribe el guion en `src/videos/<negocio>/narracion.json` (`voiceId`, `speed`, `lines`) y corre `NODE_USE_ENV_PROXY=1 node scripts/narrate.mjs src/videos/<negocio>/narracion.json public/narracion/<negocio>` (en tu computadora con `ELEVENLABS_API_KEY`; en la nube de Claude la llave la inyecta el entorno). Con el plan gratuito de ElevenLabs solo funcionan las voces incluidas en la cuenta (p. ej. Sarah o Eric), no las de la biblioteca pública. Imprime la duración de cada frase para acomodar los `offset`.
   - `cover`: portada del primer frame, que WhatsApp usa como miniatura: `{kicker, title: [línea1, línea2]}` o `{useOutro: true}` para usar la pantalla final de Aelika (logo, lema y contacto). Dura 0.6 s y se desvanece hacia el intro.
   - `music`: pista de fondo, p. ej. `{src: 'musica/pista.mp3', volume: 0.8, startAt: 12}`. Entra suave y se desvanece al final. `startAt` es el segundo de la canción en que arranca el video. Las pistas van en `public/musica/`, que no se sube al repo por la licencia de la música: hay que descargarlas de nuevo (p. ej. Detona usa *Chill House · Sunset Groove* de TurtleBeats en Pixabay, guardada como `public/musica/sunset-groove.mp3`).
3. Regístralo en `src/videos/index.ts`.
4. `npm run studio` para revisarlo y `npm run render -- <id>` para exportarlo.

`BRIEF.md` tiene la lista de lo que hay que pedirle al cliente.

## Escenas disponibles

| Escena | Función | Duración | Qué hace el dedo |
|---|---|---|---|
| Puntos de entrada | `entryPoints({...})` | 6 s | Hasta 4 tarjetas (`channels`: Google Maps, Instagram, Facebook, sitio web, QR) tocan WhatsApp y convergen en el teléfono. Los textos de las tarjetas se cambian con `copy` |
| Post de Instagram | `instagramPost({...})` | 3 s | Doble toque (like) y toca la cuenta |
| Perfil de Instagram | `instagramProfile({...})` | 4 s | Desliza las historias y toca el link de la bio |
| Linktree | `linktree({...})` | 3 s | Toca uno de los botones |
| Chat de WhatsApp | `whatsappChat({...})` | automática | Envía mensajes y toca la tarjeta con botón |
| Storefront de citas | `appointmentsStorefront({...})` | 20 s | Servicio → extra → profesional → día y hora → datos → confirmar |
| Storefront de clases | `classesStorefront({...})` | 35 s | Portada → día → filtro → detalle → WhatsApp + código → paquete/Apple Pay → lugar apartado |
| Storefront de pedidos | `ordersStorefront({...})` | 34 s | Menú con fotos (toca "+" según `qty` de cada producto, con scroll) → carrito → a domicilio con **cotización de Uber** (precio y tiempo) o para recoger → resumen con productos y envío por separado → Apple Pay → pedido confirmado con seguimiento |
| Panel de Aelika | `aelikaPanel({...})` | 5 s | Ocupación de la clase + notificación al equipo |

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

## Estructura

```
src/
  core/        motor: teléfono, dedo, cámara/zooms, subtítulos, marca, línea de tiempo
  aelika/      intro y outro de Aelika (iguales en todos los videos)
  scenes/      escenas reutilizables (instagram, linktree, whatsapp, add-ons)
    storefront/  storefronts por giro (shell.tsx = piezas comunes)
  videos/      un archivo de configuración por video + registro (index.ts)
public/        fotos y logos, una carpeta por negocio
```

## Pendiente: otros giros

Por ahora existen los storefronts de **citas**, **clases** y **pedidos de comida** (sin extras por producto todavía). Los siguientes se construyen sobre `scenes/storefront/shell.tsx` conforme se necesiten:

- **Tienda**: catálogo → talla y color → carrito → envío → pago → guía.
- **Pedidos por encargo**: producto → personalización → fecha → anticipo.

Otros canales que todavía no existen: Facebook (página y Messenger) y post o reel de TikTok.
