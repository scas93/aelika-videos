# Tipo: Demo comercial

## Para qué es

Herramienta de **venta**. Simula el flujo completo de un cliente final con la **marca de un prospecto**
(su logo, colores, productos y precios) para que el dueño del negocio se imagine usando Aelika.
Se manda **uno a uno** al prospecto (WhatsApp, correo, reunión), no se publica en redes.

- **Quién lo ve:** el dueño o encargado del negocio (el prospecto), no su cliente final.
- **Qué debe sentir:** "así se vería *mi* negocio funcionando con Aelika".
- **Duración:** 60–70 s está bien. Estructura: intro de Aelika → flujo en el teléfono → add-ons → outro con contacto de ventas.

## Dos variantes

| Variante | Cuándo | Datos | Ejemplo |
|---|---|---|---|
| **Personalizada** | Para un prospecto concreto | Reales del prospecto (nombre, logo, menú, precios, reseñas). Si no hay, se quitan, no se inventan | Casa Occidente, Detona, La Carnicería Lira |
| **Genérica de giro** | Para mandar a muchos negocios del mismo giro | Marca ficticia; datos de ejemplo permitidos. La narración **no** menciona el nombre del negocio, para reutilizarla al personalizar | Pulso Studio (fitness) |

## Onboarding: qué preguntar

Pregunta solo lo que falte (revisa primero lo que el usuario ya dio). Guarda las respuestas en
`src/videos/demos/<negocio>/brief.md` (`npm run new` lo crea con esta misma estructura).

1. **Variante:** ¿personalizada (para quién) o genérica (de qué giro)?
2. **Giro y flujo:** citas (barbería, spa, consultorio), clases (estudio, gimnasio), pedidos (restaurante, carnicería, panadería)… ¿o un flujo que todavía no existe?
3. **Marca:** nombre comercial, logo y colores (o su Instagram/web para sacarlos).
4. **Catálogo:** 4–8 productos, servicios o clases con precio; extras o variantes; personal si aplica (nombre y especialidad).
5. **Operación:** forma de pago (tarjeta, Apple Pay, efectivo), entrega o recolección (y con qué servicio, p. ej. Uber), anticipación, horarios, sucursal.
6. **Canales de entrada:** de dónde llegan sus clientes (Google Maps, Instagram, Facebook, web, QR, Linktree).
7. **WhatsApp:** nombre del contacto, saludo del bot, opciones del menú, 1–2 preguntas frecuentes.
8. **Cierre:** add-ons a mostrar (máx. 4) y lema/CTA del outro.
9. **Voz y música:** voz (por defecto la del giro, ver abajo) y pista (por defecto *Sunset Groove*).

## Assets necesarios

| Asset | Especificación | Si no lo hay |
|---|---|---|
| Logo | PNG cuadrado ≥ 400 px; ideal el avatar redondo de su Instagram | Recortar el avatar de una captura de su perfil (`public/lacarniceria-lira/logo.png` se hizo así) |
| Foto de portada | Horizontal, del lugar o del producto estrella; se usa en la portada del storefront y en la tarjeta de WhatsApp | Wikimedia Commons por API (ver Aprendizajes) |
| Fotos de producto/clase | Cuadradas ≥ 600 px, una por producto del menú (pedidos) o 1–2 de clase/servicio | Wikimedia Commons; anotar créditos en `public/<negocio>/CREDITOS.md` |
| Capturas de Instagram | Perfil, historias destacadas y 9 fotos del feed, si se usa la escena de Instagram | Omitir la escena de Instagram y usar `entryPoints` |
| Voz | Guion en `narracion.json`; ElevenLabs. Defaults: Sarah (femenina) o Eric (masculina) | — |
| Música | `public/musica/sunset-groove.mp3` (no va en el repo; la tiene el usuario) | Pedirla al usuario |

## Bases de las que partir (`npm run new -- <base> …`)

| Flujo | Base | Escenas |
|---|---|---|
| Citas | `casa-occidente` | Instagram → Linktree → WhatsApp → `appointmentsStorefront` → confirmación en WhatsApp |
| Clases (personalizada) | `detona` | `entryPoints` → WhatsApp → `classesStorefront` |
| Clases (genérica) | `pulso-studio` | igual que Detona, con textos neutros |
| Pedidos de comida | `lacarniceria-lira` | `entryPoints` → WhatsApp → `ordersStorefront` (Uber o recoger, Apple Pay) |
| Pedido para recoger con confirmación (dos perspectivas) | `karmele` | WhatsApp → `pickupStorefront` (solicitud) → aviso a la encargada → `orderPanelReview` (confirmar o proponer hora) → propuesta por WhatsApp → `pickupPay` (aceptar y pagar con tarjeta) → confirmación |
| App real grabada | `grabacion/` (Karmele, Banetto) | Otro método: ver skill `video-grabacion` |

## Reglas de calidad

- **Fidelidad:** muestra solo funciones que Aelika tiene. Ante la duda, pregunta antes de agregarla.
- **Le habla al dueño:** subtítulos, add-ons y narración en perspectiva del negocio ("tus clientes te escriben…", "tu asistente responde…"), no del cliente final.
- **Datos:** en las personalizadas, reales o ninguno; en las genéricas, de ejemplo y verosímiles. Avisa al usuario qué datos son de ejemplo.
- **Neutralidad en genéricas:** "tus clientes", "coach", "tu estudio o gimnasio"; nada que dependa del nombre del negocio en la voz.
- **Antes de entregar:** `npm run check -- <Id> --sheet` sin errores, revisa la hoja de cuadros y avisa créditos de fotos.

## Aprendizajes

Agrega aquí, con fecha, lo que aprendas en cada demo. Es la memoria de este tipo de video.

- **2026-11-18 · Detona** — El copy va dirigido a la dueña del estudio ("tus alumnas", "tu estudio"), no a la clienta. La portada puede usar la pantalla final del outro (`cover: {useOutro: true}`).
- **2026-11-19 · La Carnicería Lira** — Para pedidos con envío, muestra productos y envío **por separado** y la cotización de Uber (precio + tiempo) antes de pagar. Restaurante sin fotos propias: Wikimedia Commons (Unsplash y Pixabay bloquean descargas automáticas; no intentar saltarlo).
- **2026-11-19 · Narración** — En el plan gratuito de ElevenLabs solo sirven las voces de la cuenta (Sarah, Eric…), no las mexicanas de la biblioteca. Frases largas se enciman con la siguiente: acórtalas y regenera solo esas para ahorrar caracteres.
- **2026-11-19 · Pulso Studio** — Una genérica de giro reutiliza la misma narración en cada versión personalizada si la voz no dice el nombre del negocio. Etiquetas fijas como "Instructora" deben ser configurables (`coachRole`).
- **2026-11-20 · Proceso** — Ancla la narración a marcas de escena (`{scene, mark}`) en vez de segundos: al cambiar una escena, la voz se acomoda sola.
- **2026-11-11 · Karmele/Banetto (grabación)** — Grabando la app real: forzar escala 3×, quitar `backdrop-filter` y un pixel que cambie cada 33 ms para tener ~40 fps; buscar botones por texto visible y productos por nombre, nunca por índice.
- **2026-11-23 · Karmele (dos perspectivas)** — Para mostrar al cliente y al negocio, alterna escenas de WhatsApp y marca cada una con `perspective: {label, sub, icon, color}`: aparece una etiqueta arriba del teléfono que se mantiene hasta que otra escena la cambie. Usa otro color para el negocio y `avatar` en el chat de la encargada (`<AelikaIcon size={24}/>`; `AelikaMark` es el logo completo con texto y sale enorme). Los mensajes con imagen (`image`) sirven para datos de transferencia y comprobantes. Si staging aún no tiene el flujo nuevo, simúlalo imitando el diseño real (`pickupStorefront`) y anótalo en el brief. Con varios cambios de chat, alarga las pausas (`pause`) donde la narración es larga para que no se encimen frases. `npm run new` ya no sobrescribe archivos existentes en `public/<carpeta>/`.
- **2026-11-23 · Karmele (ajustes del usuario)** — Los productos deben ser del menú real del negocio (verificarlos en su tienda). No marques horarios como "lleno" si quien decide es la encargada. Al cliente no se le pone nombre en la voz ni en los chats ("tu cliente"); el nombre solo aparece donde la app lo pide (formulario, aviso del pedido) y nunca debe ser el del usuario.  Regenera solo las frases que cambian con `--only 2,4,6`.
- **2026-11-23 · Karmele (gestión en el panel)** — El negocio **no** gestiona pedidos respondiendo en WhatsApp: recibe un aviso del chatbot del negocio ("Karmele Chatbot") con pie "Mensaje automático de Aelika" y botón "Ver pedido" (`footer`, `cta`, `tapCta`), que abre el panel de Aelika en el navegador de WhatsApp; ahí acepta/rechaza, da el motivo, propone horario o marca pagado (`orderPanelReview`, `orderPanelPayment`), y Aelika avisa al cliente automáticamente. Diseño del panel según capturas de Banetto: título grande, estado en píldora, tarjetas con borde y botones con contorno ("Marcar pagado").
- **2026-11-23 · Karmele (flujo de solicitud)** — El flujo real de pedidos con confirmación: el cliente envía una **solicitud sin cobro**; el negocio **confirma la hora o propone otra** en el panel; el bot manda link de pago o link de propuesta (aceptar → pago; rechazar → cancela); el pago es con tarjeta en esa página. Sin transferencias ni comprobantes. Antes de armar un flujo nuevo, pide al usuario el flujo paso a paso: cambió tres veces en este video. No pongas datos bancarios si el pago no es por transferencia.
- **2026-11-23 · Karmele (ajustes de voz y menú)** — La voz no enumera lo que el cliente pide ("arma su pedido en el menú en línea" basta) ni explica caminos que no se ven en pantalla: confunde. Horarios cada 30 min. Un producto de temporada va primero y destacado (`badge` en `pickupStorefront`). Los avisos al negocio llevan "Ver pedido" y "Hablar con cliente" (`cta` + `cta2`).
- **2026-11-23 · Karmele (terminado)** — Aprobado tras 6 versiones. Lo que más cambió fue el flujo de negocio, no el diseño: en la próxima demo con flujo nuevo, confirma el flujo completo (quién hace qué, dónde y cómo se paga) antes de producir.
