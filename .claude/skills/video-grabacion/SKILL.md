---
name: video-grabacion
description: Hace o actualiza una DEMO COMERCIAL vertical (1080×1920, ≤40 s) GRABANDO la app real de Aelika (staging) con Playwright — chat de WhatsApp, app real dentro de un iPhone, confirmación — con el pipeline de grabacion/. Para videos con escenas simuladas usa la plantilla de la raíz del repo. Úsala cuando pidan un video nuevo para otro negocio, regrabar porque cambió el flujo, o ajustar textos, cámara o tiempos de un video existente.
---

# Video de flujo de pedido

Todo vive en `grabacion/` (corre los comandos desde ahí). Lee primero `grabacion/README.md`. Los dos videos de referencia son `grabacion/videos/karmele` (B2C con Stripe) y `grabacion/videos/banetto-b2b` (B2B con login por código).

## Proceso

1. **Explorar antes de grabar.** Recorre el flujo con Playwright en modo exploración (capturas + texto + botones por pantalla) sin enviar nada. Anota cada pantalla y botón. Pregunta al usuario lo que no se puede deducir: productos, día y hora, forma de pago, y si se puede enviar el pedido.
2. **Grabar la app** copiando el `record_*.js` más parecido. Ensayo sin enviar → revisar cuadros → grabación final.
3. **Grabar el chat** adaptando `chat.html` y `record_chat.js` (nombre del negocio, saludo, mensaje con el link, confirmación con folio y total reales).
4. **Preparar y componer:** `prep*.py` y `Video*.jsx`. Para un video nuevo, copia la composición más cercana y regístrala en `remotion/src/index.jsx`.
5. **Revisar** cuadros del render (stills con `--stills` y `FRAMES=...`, o `ffmpeg -ss`) en cada paso, transición y overlay antes de entregar. Mide la duración (≤ 40 s).

## Lo que ya aprendimos (no repetir errores)

- **Solo staging.** Nunca enviar pedidos ni pagos en producción. Cada envío en staging crea un folio real: avísalo.
- **Calidad:** lanza Chromium con `--force-device-scale-factor=3`; sin eso el screencast sale a 1×.
- **Fluidez:** mete un pixel casi invisible que cambie cada 33 ms (fuerza cuadros) y desactiva `backdrop-filter` al grabar. Sin GPU, el desenfoque baja la captura a ~7 fps.
- **Selectores:** busca botones por texto visible (`locator('button', { hasText })`); los nombres accesibles a veces no coinciden. Busca productos por nombre, nunca por índice (el menú cambia).
- **Tiempos muertos:** marca eventos (`stripe_ready`, `code_sent`/`code_ready`, envío) y recorta en `prep*.py`. Pausa el screencast mientras se espera un código para no llenar el disco.
- **Login con código:** graba el login una vez, guarda `state.json` (nunca al repo) y graba el resto con esa sesión. El usuario pasa el código en el chat; el script lo espera en `code.txt`.
- **Estilo que le gusta al usuario:**
  - Poco movimiento de cámara: pocos close-ups fijos (zoom 1.25×, desde el centro del teléfono) y sin zoom outs durante el chat.
  - El teléfono siempre completo, con el paso numerado justo debajo (sigue la orilla del teléfono).
  - Textos descriptivos, no promocionales ("El cliente escribe por WhatsApp").
  - Intro del logo de Aelika de ~3 s. Solo efectos de sonido, sin música.
  - Resaltar funciones clave (foco + paso propio + un poco más de tiempo).
- **Simulaciones:** la notificación de WhatsApp con el código y el autocompletado de iOS se dibujan encima de un cuadro congelado (`overlay: "autofill"`). El foco va en clips con `spotlight: true`.
- Los textos del bot y de las notificaciones son propuestas: confírmalos con el usuario.
