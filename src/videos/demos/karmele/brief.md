# Brief · Karmele

- **Tipo:** demos · **variante:** personalizada · **Id:** `Karmele` · **fecha:** 2026-11-23
- **Base:** `pulso-studio` (estructura) + escenas `pickupStorefront`, `orderPanelReview` y `pickupPay`
- **Duración:** ~92 s · voz Eric (1.1×; antes Sarah) · música *Sunset Groove*

## Negocio

Karmele, panadería en Guadalajara (karmele.com.mx). Sucursal: José María Morelos 2279 A, Arcos Vallarta.
Color de marca `#a2652f`.

## Operación (flujo actualizado por el usuario, 2026-11-23)

1. **Entrada (chatbot):** menú con Hacer un pedido / Ver menú / Ubicación y horarios. "Hacer un pedido" manda el
   link al storefront con el teléfono del cliente ya cargado.
2. **Solicitud (storefront):** carrito, nombre y la hora a la que quiere recoger → se envía como solicitud, sin cobro.
   Solo recoger en tienda; todos los horarios se pueden elegir (con un día de anticipación).
3. **Confirmación (Nataly y cocina):** a Nataly le llega un aviso por WhatsApp ("Karmele Chatbot", mensaje automático
   de Aelika, botón **Ver pedido**). En el panel ve la solicitud **Por confirmar**, consulta con cocina y elige
   **Confirmar hora** o **Proponer otra hora**. Toda la gestión es en el panel, no en WhatsApp.
4. **Respuesta al cliente (bot):** si confirma → link de pago directo; si propone → link para aceptar o rechazar
   (aceptar = pasa al pago; rechazar = la solicitud se cancela).
5. **Pago (solo tarjeta):** la página muestra resumen, hora acordada y cobro con tarjeta. Pagado → pedido
   **Confirmado** y confirmación por WhatsApp.

El video muestra el camino de **proponer otra hora** (9:00 → 11:00) y la voz menciona el de confirmar directo.
Dos perspectivas: cliente (sin nombre en la voz ni en los chats) y Nataly.

## Assets y origen

- Fotos de producto: tienda en línea de Karmele (karmele.com.mx/tienda-en-linea), recortadas a 600×600.
  Los 8 productos y sus precios son de su menú real.
- `logo.png`: círculo café con "K", generado (no es el logo oficial; cámbialo si lo mandan).
- Diseño del panel de Aelika según capturas de Banetto (detalle de pedido y aviso con "Ir al sitio").

## Datos de ejemplo (no reales)

Cliente Daniela Ruiz y su teléfono (solo en el formulario, el aviso y el panel), encargada "Nataly", solicitud #128,
la hora propuesta y la tarjeta de prueba 4242 4242 4242 4242.

## Pendiente

- El flujo nuevo aún no está en staging: el video lo **simula** imitando el diseño del storefront y del panel.
  Cuando exista, revisar textos y pantallas (`pickup.tsx`, `pickup-pay.tsx`, `order-panel.tsx`).
- Logo oficial de Karmele.
