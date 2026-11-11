# aelika-videos

Videos verticales (1080×1920, ≤ 40 s) que muestran cómo un cliente hace un pedido con Aelika:
chat de WhatsApp → app de pedidos dentro de un iPhone → confirmación por WhatsApp,
con intro animada del logo, pasos numerados, close-ups y sonidos de toques y mensajes.

| Video | Flujo | Composición |
|---|---|---|
| `videos/karmele` | B2C: menú → carrito → datos → entrega (día y hora) → pago con tarjeta (Stripe test) | `KarmelePedido` |
| `videos/banetto-b2b` | B2B mayoreo: login con código por WhatsApp → semana → días → pedido por día ("Igual que lun 16") → enviar | `BanettoMayoreo` |

## Cómo funciona

1. **Grabar la app real** (`videos/<video>/record_*.js`) con Playwright emulando un iPhone 13 a 3×.
   Se captura con el screencast de Chrome (≈40 fps) y se registra cada toque, tecla, mensaje y paso en `events_*.json`.
2. **Grabar el chat de WhatsApp** (`videos/<video>/chat.html` + `record_chat.js`): recreación en HTML, escenas `intro` y `outro`.
3. **Preparar** (`remotion/prep*.py`): pasa las grabaciones a MP4, recorta esperas (Stripe, código, envío) y escribe la línea de tiempo (`remotion/src/timeline*.json`).
4. **Componer** con Remotion (`remotion/src/Video*.jsx`): fondo, teléfono, intro del logo, pasos, cámara, foco, autocompletado del código y sonidos.

Todo lo que se graba va a `recordings/<video>/` (ignorado por git).

## Requisitos

- Node 18+, Python 3 con `numpy` y `Pillow`, `ffmpeg`.
- Chromium de Playwright (`require('playwright')`). En la nube de Claude ya viene instalado en `/opt/pw-browsers`.
- Red: `pide.staging.aelika.com`, `aelika-staging.up.railway.app`, el bucket R2 de fotos, `www.panaderiabanetto.com` y los dominios de Stripe (`js.stripe.com`, `api.stripe.com`, `m.stripe.network`, `m.stripe.com`, `r.stripe.com`, `q.stripe.com`, `b.stripecdn.com`, `hooks.stripe.com`, `errors.stripe.com`).

```bash
cd remotion && npm install
```

## Hacer el video de Karmele

```bash
node videos/karmele/record_app.js                          # crea un pedido de prueba en staging (Stripe 4242…)
node videos/karmele/record_chat.js intro
node videos/karmele/record_chat.js outro <folio> '<total>'   # folio y total salen de recordings/karmele/marks.json
cd remotion && python3 prep.py ../recordings/karmele && npm run render
```

## Hacer el video B2B de Banetto

```bash
B2B_PHONE=<teléfono del negocio de prueba> node videos/banetto-b2b/login.js
#   pide el código por WhatsApp y espera: escribe el código en recordings/banetto-b2b/code.txt
node videos/banetto-b2b/record_b2b.js          # ensayo: se detiene en el resumen
node videos/banetto-b2b/record_b2b.js --send   # envía el pedido de prueba (la semana queda ocupada)
node videos/banetto-b2b/record_chat.js intro
node videos/banetto-b2b/record_chat.js outro <folio> '<total>'
cd remotion && python3 prep_b2b.py ../recordings/banetto-b2b && COMP=BanettoMayoreo npm run render
```

El resultado queda en `remotion/out/`. Para ajustar en vivo: `cd remotion && npm run studio`.

## Reglas

- **Solo staging.** Nunca enviar pedidos ni pagos en `pide.aelika.com` (producción).
- **No subir** `state.json` (sesión iniciada), teléfonos ni códigos. Van en `recordings/` o en variables de entorno.
- Cada grabación que llega a la confirmación crea un pedido real en staging; avisar el folio para limpiarlo.
- Antes de entregar, revisar cuadros del video (no solo que el render termine).
