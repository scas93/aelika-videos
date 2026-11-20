---
name: video-nuevo
description: Onboarding para CUALQUIER video nuevo de Aelika. Úsala primero cada vez que pidan un video (demo para un prospecto, video genérico de un giro, anuncio, reel, video de marketing, etc.) o cuando no esté claro qué tipo de video es. Pregunta el tipo, carga su ficha (qué preguntar, assets, bases, reglas y aprendizajes), junta el brief y arranca la producción con la skill del tipo.
---

# Onboarding de un video nuevo

## 1. ¿Qué tipo de video es?

Lee los tipos disponibles en `src/videos/*/TIPO.md` y pregunta con opciones (si el usuario no lo dijo ya):

| Tipo | Ficha | Producción |
|---|---|---|
| **Demo comercial** — simula el flujo con la marca de un prospecto para venderle Aelika | `src/videos/demos/TIPO.md` | skill `video-flujo` (plantilla) o `video-grabacion` (app real) |
| **Marketing** — anuncios, reels, piezas para redes | `src/videos/marketing/TIPO.md` | aún sin skill: sigue la ficha y crea el primero con el usuario |

Si no encaja en ninguno, propón crear un tipo nuevo: carpeta `src/videos/<tipo>/` con su `TIPO.md`
(mismas secciones que los demás), su `index.ts` y su entrada en `VIDEO_GROUPS` (`src/videos/index.ts`).

## 2. Brief

1. Lee completa la ficha del tipo, **incluida la sección Aprendizajes**.
2. Revisa si ya existe un video parecido (`src/videos/<tipo>/*/brief.md`) que sirva de base.
3. Pregunta **solo lo que falte** de la sección "Onboarding: qué preguntar" (agrupa en una sola tanda de
   preguntas; usa opciones con una recomendada cuando haya un default razonable).
4. Revisa los assets contra la tabla "Assets necesarios": pide los que falten o resuelve con la alternativa indicada.

## 3. Arranque

1. `npm run new -- <base> <carpeta> <Id> "Nombre" [--tipo <tipo>]` con la base que indique la ficha.
2. Llena `src/videos/<tipo>/<carpeta>/brief.md` con las respuestas, el origen de cada asset y qué datos son reales y cuáles de ejemplo.
3. Sigue con la skill de producción del tipo.

## 4. Al terminar (no lo saltes)

1. Agrega a la sección **Aprendizajes** de `src/videos/<tipo>/TIPO.md` lo que salió de este video
   (problemas resueltos, decisiones del usuario, preferencias de estilo), con fecha y nombre del video.
   Si algo cambia cómo se debe preguntar o qué assets pedir, actualiza también esas secciones.
2. Actualiza el `brief.md` del video si algo cambió durante la producción.
