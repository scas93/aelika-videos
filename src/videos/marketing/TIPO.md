# Tipo: Marketing (esqueleto — se completa con el primer video de este tipo)

## Para qué es

Videos para **redes y anuncios** (Reels, TikTok, Stories, anuncios pagados), piezas de marca de Aelika,
testimonios, etc. A diferencia de las demos comerciales (`../demos/TIPO.md`), los ve gente que **no** pidió
verlos: hay que ganarse su atención en segundos.

## Onboarding: qué preguntar

1. **Objetivo:** ¿alcance, clics, demos agendadas, registro?
2. **Plataforma y formato:** Reels/TikTok (9:16), feed (4:5), YouTube/web (16:9); ¿anuncio pagado u orgánico?
3. **Audiencia:** giro y tipo de negocio al que le habla.
4. **Mensaje principal:** un solo beneficio por video.
5. **Gancho:** la frase o imagen de los primeros 2–3 segundos.
6. **Llamada a la acción:** qué hacer al terminar (escribir por WhatsApp, agendar demo, visitar web).
7. **Voz, música y subtítulos.**

## Assets necesarios (propuesta inicial)

- Logo y paleta de Aelika (ya en `src/aelika/` y `public/`).
- Clips o escenas del flujo (se pueden reutilizar escenas de las demos).
- Música con licencia para redes; voz si aplica.

## Reglas de calidad (propuesta inicial)

- **Gancho en los primeros 3 s**; el logo no abre el video (va al final o muy breve).
- **Duración corta:** 15–30 s.
- **Subtítulos que repiten la voz** palabra por palabra (se ve sin sonido).
- **Formatos:** `npm run render -- <Id> --formats 9x16,4x5,16x9`; audio a -14 LUFS (ya lo hace `render`).

## Cómo arrancar este tipo

Crea `index.ts` aquí con `export const MARKETING: VideoConfig[] = [...]` y agrégalo a `VIDEO_GROUPS` en
`src/videos/index.ts`. Después `npm run new -- <base> <carpeta> <Id> --tipo marketing` ya funciona.

## Aprendizajes

(Vacío: agrega aquí, con fecha, lo que aprendas en cada video de marketing.)
