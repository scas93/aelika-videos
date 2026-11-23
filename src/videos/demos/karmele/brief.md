# Brief · Karmele

- **Tipo:** demos · **variante:** personalizada · **Id:** `Karmele` · **fecha:** 2026-11-23
- **Base:** `pulso-studio` (estructura) + escena nueva `pickupStorefront`
- **Duración:** 95.1 s · voz Sarah (1.1×) · música *Sunset Groove*

## Negocio

Karmele, panadería en Guadalajara (karmele.com.mx). Sucursal: José María Morelos 2279 A, Arcos Vallarta.
Color de marca `#a2652f`.

## Operación (pago, entrega, horarios…)

- Solo **recoger en tienda**; todos los horarios se pueden elegir (con un día de anticipación): la encargada decide si el pedido puede estar listo.
- El pedido se envía **sin pagar**. A la encargada le llega un aviso por WhatsApp ("Karmele Chatbot", mensaje automático de Aelika) con el botón **Ver pedido**, que abre el panel de Aelika: **toda la gestión es en el panel** (aceptar/rechazar, motivo, proponer horario, marcar pagado). Al terminar, Aelika le avisa al cliente por WhatsApp.
- Si rechaza: motivo (p. ej. sin disponibilidad de un producto) y, opcional, propone otro horario.
- Cuando el cliente acepta: plantilla con el resumen + imagen con los datos de transferencia; el cliente manda su comprobante
  ; a la encargada le llega el aviso y lo marca como pagado en el panel.
- El total lo calcula la app con los precios del menú.

**Dos perspectivas:** cliente (sin nombre en la voz ni en los chats) y encargada de pedidos (Nataly), con una etiqueta arriba del teléfono.
Camino mostrado: rechazo → motivo → propone 11:00 → cliente acepta → resumen + transferencia → comprobante → pagado.

## Assets y origen

- Fotos de producto: tienda en línea de Karmele (karmele.com.mx/tienda-en-linea), recortadas a 600×600.
- `logo.png`: círculo café con "K", generado (no es el logo oficial; cámbialo si lo mandan).
- `transferencia.png`: recorte de la captura que mandó el usuario. **Datos bancarios reales**, mostrados con su aprobación.
- `comprobante.png`: comprobante SPEI genérico, generado.

## Datos de ejemplo (no reales)

Cliente Daniela Ruiz y su teléfono (solo en el formulario, el aviso del pedido y el resumen), encargada "Nataly", pedido #128, el motivo del rechazo
y el comprobante. Productos, precios y dirección son reales (los 8 productos están en karmele.com.mx/tienda-en-linea).

## Pendiente de decidir

- Gestión del pedido por el cliente: recomendado WhatsApp para lo rápido + botón "Ver mi pedido" a una página con link único sin login (estado, detalle, cambiar horario o cancelar). Agregar al video si Aelika lo tiene o lo tendrá.

## Pendiente

- El flujo de confirmación aún no está en staging (allí sigue el checkout con tarjeta): el video lo **simula**
  imitando el diseño del storefront y del panel (capturas de Banetto). Si cambia la app real, ajusta `pickupStorefront` y `order-panel.tsx`.
- Logo oficial de Karmele.
