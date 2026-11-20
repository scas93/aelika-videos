---
name: video-flujo
description: Hace o ajusta una DEMO COMERCIAL de Aelika con la plantilla de escenas simuladas (Remotion) — un video que simula el flujo de un cliente con la marca de un prospecto para venderle Aelika (puntos de entrada, chat de WhatsApp, storefront de citas/clases/pedidos, add-ons y outro, con narración y música). Úsala para una demo nueva de un negocio o giro, una versión personalizada para un prospecto, o cambios de textos, tiempos, voz o formato. No es para videos de marketing (anuncios/reels). Para grabar la app real usa la skill video-grabacion.
---

# Demo comercial con la plantilla

**Qué es:** una herramienta de venta. Simula el flujo completo de un cliente con la marca de un *prospecto*
(su logo, colores, productos y precios) para que se imagine usando Aelika. Se manda uno a uno, así que
60–70 s está bien. Lo que más importa: **personalización**, **fidelidad al producto real** (solo funciones que
Aelika tiene) y **datos creíbles** (reales del prospecto; inventados solo en demos genéricas como Pulso Studio).
Los videos de marketing (anuncios, reels) son otro tipo y vivirán en `src/videos/marketing/`.

Las demos viven en `src/videos/demos/<negocio>/` y se registran en `src/videos/demos/index.ts`.
Lee `README.md` (escenas disponibles, opciones de cada una) y `BRIEF.md` (qué pedirle al cliente).

## Proceso

1. **Brief.** Pide solo lo que falte: giro, marca (logo/colores o su Instagram), productos o clases con precio,
   forma de entrega/pago, de dónde llegan sus clientes, voz y música. No inventes funciones de Aelika: muestra
   solo lo que ya aparece en otros videos o lo que el usuario confirme.
2. **Arranque.** `npm run new -- <base> <carpeta> <Id> "Nombre"` copia la demo más parecida de `src/videos/demos/`
   (citas → casa-occidente, clases → detona o pulso-studio, pedidos de comida → lacarniceria-lira) y lo registra.
3. **Fotos.** Las del cliente son las mejores. Si no hay, Wikimedia Commons por su API (licencias libres;
   anota créditos en `public/<negocio>/CREDITOS.md`). Unsplash y Pixabay bloquean descargas automáticas:
   no intentes saltar su protección.
4. **Guion de voz** en `src/videos/demos/<negocio>/narracion.json` y `node scripts/narrate.mjs …` (la llave de
   ElevenLabs la inyecta el entorno). En el plan gratuito solo sirven las voces de la cuenta (Sarah, Eric…).
   Ancla cada frase a una **marca** de su escena (`anchor: {scene: 2, mark: 'pay'}`) en vez de segundos sueltos.
   Marcas: entryPoints `cards, merge` · whatsappChat `turn0, turn1…` · classes `cover, schedule, filter, detail,
   identify, pay, applePay, done` · orders `menu, add, cart, delivery, quote, pay, applePay, done` ·
   appointments `menu, service, staff, date, data, summary, success`.
5. **Revisar antes de renderizar:** `npm run check -- <Id> --sheet` (archivos faltantes, frases encimadas o fuera
   del video, huecos de voz, subtítulos largos) y mira `out/<Id>-hoja.png`. Corrige y repite.
6. **Render:** `npm run render -- <Id> --formats 9x16,4x5,16x9` (audio a -14 LUFS, miniatura PNG y formatos).
   Varios: `npm run render:all`.
7. **Entrega:** comparte el MP4, di qué datos son de ejemplo (reseñas, precios, clientes) y los créditos de fotos.

## Lo que ya aprendimos

- Frases de voz largas se enciman con la siguiente: acórtalas y regenera solo esas (ahorra caracteres).
- Textos neutros para videos genéricos ("tus clientes", "coach", "tu estudio o gimnasio").
- Si una pantalla se desplaza, cuida que la barra de estado tenga fondo y que el carrito no tape la fila tocada.
- La música (`public/musica/`) no va en el repo por su licencia; Detona y los demás usan *Sunset Groove* (Pixabay).
- Chromium se detecta solo (`scripts/browser.mjs`); `REMOTION_BROWSER` solo si quieres otro.
