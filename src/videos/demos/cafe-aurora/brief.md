# Brief · Café Aurora

- **Tipo:** demos · **variante:** genérica (cafetería, solo pickup) · **Id:** `CafeAurora` · **fecha:** 2026-11-23
- **Base:** `lacarniceria-lira` (entrada) + `pickupStorefront` en modo `now` + escena nueva `tabletOrders`
- **Estado:** en revisión con el usuario
- **Duración:** ~67 s · voz Eric (1.1×) · música *Sunset Groove*

## Negocio

Cafetería ficticia "Café Aurora" (marca genérica para mandar a muchas cafeterías). Solo servicio para recoger.
Verde café `#2f6b57` y crema. La voz no dice el nombre del negocio.

## Flujo

1. **Entrada:** Instagram, Facebook, Google Maps y QR en la barra → WhatsApp.
2. **Chatbot:** menú corto (Hacer un pedido / Ver menú / Ubicación y horarios) → tarjeta al menú en línea.
3. **Storefront:** cafés y pan; carrito → recoger **lo antes posible** (listo en ~15 min) → ¿cómo pagar?
   En tienda / Con tarjeta → **Apple Pay** → pedido confirmado.
4. **Confirmación** por WhatsApp al cliente.
5. **Local:** el pedido llega al **teléfono** del encargado (WhatsApp, "Ver pedido" / "Hablar con cliente")
   y al **iPad** de la barra (vista de pedidos estilo apps de delivery). Solo se ve recibirlo, sin aceptar ni marcar listo.

## Assets y origen

- Fotos de producto: Panadería Banetto (panaderiabanetto.com, cliente de Aelika). Algunas muestran su papel con
  la marca "Banetto" de fondo. Créditos en `public/cafe-aurora/CREDITOS.md`.
- `logo.png`: generado (marca ficticia).

## Datos de ejemplo (no reales)

Nombre, logo, dirección (Av. Chapultepec 120), precios, reseñas, clientes (Andrea M., Sofía G., …) y pedidos #85–#88.

## Pendiente

- La vista del iPad está inventada siguiendo el estilo del panel de Aelika: si existe una real, imitarla.
- Si se personaliza para una cafetería real: cambiar fotos (sin la marca Banetto), menú, precios y dirección.
