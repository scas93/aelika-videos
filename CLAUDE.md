# aelika-videos

Videos de Aelika hechos con Remotion. Hay **varios tipos de video**; cada uno vive en `src/videos/<tipo>/`
con una ficha `TIPO.md` (para qué es, qué preguntar, assets, bases, reglas de calidad y aprendizajes).
Hoy el tipo en uso es **demos comerciales** (`src/videos/demos/`); `marketing` está preparado.

## Reglas para cualquier sesión

- **Todo video nuevo empieza con la skill `video-nuevo`** (onboarding): primero se pregunta el tipo de video
  y se lee su `TIPO.md`, incluidos sus Aprendizajes.
- **Las mejoras no se pierden:** al terminar un video, o al descubrir algo que conviene repetir o evitar,
  agrégalo con fecha a la sección *Aprendizajes* del `TIPO.md` correspondiente, y actualiza el `brief.md` del video.
  Si la mejora es de código (escenas, scripts), documéntala también en `README.md`.
- **Antes de entregar un video:** `npm run check -- <Id> --sheet` sin errores y revisión de la hoja de cuadros.
- **Ramas:** trabaja en `main` o en una rama que se una a `main` al terminar; no dejes ramas sueltas.
- **Secretos:** nunca subas sesiones (`state.json`), teléfonos, códigos ni llaves. La llave de ElevenLabs la inyecta el entorno.
- **Solo staging** para grabar la app real (`grabacion/`); nunca enviar pedidos ni pagos en producción.

## Mapa rápido

- `README.md`: comandos (`new`, `check`, `render`, `render:all`, `review`), escenas y opciones.
- `src/videos/<tipo>/TIPO.md` y `src/videos/<tipo>/<video>/brief.md`: conocimiento por tipo y por video.
- `.claude/skills/`: `video-nuevo` (onboarding), `video-flujo` (demos con la plantilla), `video-grabacion` (demos grabando la app real).
- `grabacion/`: proyecto aparte para grabar la app real.
