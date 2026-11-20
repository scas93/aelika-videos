# Brief · Panadería Banetto (mayoreo, B2B)

- **Tipo:** demo comercial · **variante:** personalizada, **grabando la app real** · **fecha:** 2026-11-12
- **Flujo:** `pide.staging.aelika.com/banetto-mayorista` con la cuenta de prueba "Brunch & Co.": WhatsApp → login con código por WhatsApp (notificación y autocompletado simulados) → semana → días de entrega → pedido por día ("Igual que lun 16" resaltado) → enviar → confirmación en WhatsApp. ~40 s.
- **Datos:** el teléfono del negocio de prueba va en `B2B_PHONE` (nunca en el repo); el código lo pasa el usuario al grabar.
- **Notas:** enviar el pedido ocupa la semana elegida en staging; pedir al usuario que lo cancele si hay que regrabar.
