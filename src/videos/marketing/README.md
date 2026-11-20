# Videos de marketing (próximamente)

Aquí irán los videos con fines de marketing: anuncios y reels para redes, piezas de marca, testimonios, etc.
A diferencia de las demos comerciales (`../demos/`), priorizan:

- **Gancho en los primeros 3 segundos** (sin abrir con el logo).
- **Duración corta** (15–30 s) y **subtítulos** que repiten la voz, porque se ven sin sonido.
- **Formatos** 9:16, 4:5 y 16:9 (`npm run render -- <Id> --formats 9x16,4x5,16x9`) y audio a -14 LUFS.

Para empezar este tipo: crea `index.ts` aquí con `export const MARKETING: VideoConfig[] = [...]`
y agrégalo a `VIDEO_GROUPS` en `src/videos/index.ts`.
