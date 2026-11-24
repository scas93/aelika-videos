# Brief · Maké Repostería

- **Tipo:** demos · **variante:** personalizada (repostería) · **Id:** `Make` · **fecha:** 2026-11-24
- **Base:** `cafe-aurora-recoger` (+ `entryPoints`, `thermalPrinter` nueva)
- **Estado:** ✅ Terminado (2026-11-24). Final: `npm run render -- Make` → `out/Make.mp4`.
- **Duración:** ~80 s · voz Eric (1.1×) · música *Sunset Groove* · intro de 214 frames para que quepa la primera frase

## Mensaje

Tus clientes hacen sus pedidos con anticipación, de la manera más sencilla y rápida. (La frase la dice la voz; no va escrita en el intro.)

## Flujo

1. **Entrada:** post de Instagram, perfil de Instagram, Facebook y QR en el mostrador → WhatsApp.
2. **Chatbot (como Karmele):** menú Hacer un pedido / Ubicación / Horarios / Facturación + nota "asesor"; toca *Ubicación*
   (Calle Euclides 3120) → botón *Hacer un pedido* → tarjeta al menú en línea.
3. **Storefront** (`pickupStorefront` con `now.steps`, checkout formal Carrito › Tus datos › Recogida › Pago): 1 Crookie Nutella, 1 Rebanada Cheesecake Lotus, 2 Cupcakes
   Red Velvet ($433) → **elige día y hora** (desde mañana, horarios cada hora 9 am–1 pm; nunca el mismo día) → paga en
   tienda / tarjeta / Apple Pay → Apple Pay → confirmado + aviso de WhatsApp.
4. **Maké:** aviso al encargado (WhatsApp) → tablet con la app de Aelika (`tabletOrders`) → **comanda en impresora térmica** (`thermalPrinter`).
5. **Add-ons:** campañas de marketing para todos tus clientes, reportes automáticos, pedidos a domicilio y más.
6. **Outro:** lema por defecto (sin "pedidos para recoger, sin comisiones") + "Agendemos una llamada".

## Assets y origen

- Productos, fotos, precios y logo: menú de **Maké Bakery en Rappi** (`public/make/menu.json`); portada = foto de fondo de Rappi.
- Dirección de recogida dada por el usuario: Calle Euclides 3120, Fracc. Vallarta San Jorge, 44690 Guadalajara.

## Datos de ejemplo (no reales)

Usuario de Instagram `make.reposteria`, pedido #1042, cola de pedidos de la tablet, fecha (mié 25 a las 10:00).

## Historial

- v1 (sesión aislada, sin la estructura nueva): storefront propio y escena de negocio con teléfono, tablet e impresora.
- v2 (sobre `cafe-aurora-recoger`): voz Eric, sin texto en el intro, recoger otro día con horarios cada hora, add-ons nuevos, sin el lema de comisiones.
- v3: voz de Eric generada (plan Starter de ElevenLabs); intro más largo, aviso al encargado más largo y frases 04 y 09 alargadas para quitar encimados y silencios.
- v4: checkout formal en 4 pasos (datos, recogida con calendario y horarios cada hora de 9 a 5, pago con resumen y "Cambiar"). El cliente es **Santiago Castro · 33 3100 6915**, a petición del usuario (son sus datos; ya aparecen en el outro como contacto de ventas).
