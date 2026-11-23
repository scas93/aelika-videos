# Brief · Café Aurora · pide y pasa a recoger

- **Tipo:** demos · **variante:** genérica (cafetería) · **Id:** `CafeAuroraRecoger` · **fecha:** 2026-11-23
- **Base:** `cafe-aurora` (marca, fotos y `pickupStorefront` con `now`) + `orderPanelView` + `tabletOrders`
- **Estado:** en revisión con el usuario
- **Duración:** ~67 s · voz Eric (1.1×) · música *Sunset Groove*

## Mensaje

Que los clientes prefieran pedir para pasar a recoger **sin hacer fila**. Es una compra normal (no "anticipada" ni para una junta).
El menú es **solo pan** (croissants, chocolatín, kouign amann, rol de canela, espiral de naranja, baguette, hogaza).

## Flujo

1. **Cliente (un solo paso):** WhatsApp → menú corto → menú en línea → productos → **¿Cuándo pasas por él?**
   (Ahorita / 30 / 45 / 60 min / Otra hora → **día y hora**: elige mañana 9:00) → **¿Cómo quieres pagar?** (en tienda, tarjeta, Apple Pay) → Apple Pay → confirmado.
2. **Encargado, en su teléfono:** aviso de WhatsApp ("Ver pedido" / "Hablar con cliente") → panel de Aelika con el pedido
   pagado y la hora en que pasan.
3. **Encargado, en el iPad de la barra:** vista de pedidos estilo apps de delivery; llega el pedido con aviso.

## Assets y origen

Los de `public/cafe-aurora/` (fotos de Banetto, logo generado).

## Datos de ejemplo (no reales)

Marca, dirección, precios, cliente (Andrea Medina y su teléfono), pedido #91 ($310), martes 24 a las 9:00.

## Historial

- v1 (pedido anticipado para una junta con confirmación de hora, flujo Karmele) → el usuario lo cambió a compra normal
  de un solo paso, con opciones de hora y el encargado en teléfono y luego iPad.
- v2 → menú solo de pan y el cliente elige día y hora ("Otra hora").
