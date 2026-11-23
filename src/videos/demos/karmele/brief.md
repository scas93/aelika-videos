# Brief · Karmele

- **Tipo:** demos · **variante:** personalizada · **Id:** `Karmele` · **fecha:** 2026-11-23
- **Base:** `pulso-studio` (estructura) + escena nueva `pickupStorefront`
- **Duración:** 88.6 s · voz Sarah (1.1×) · música *Sunset Groove*

## Negocio

Karmele, panadería en Guadalajara (karmele.com.mx). Sucursal: José María Morelos 2279 A, Arcos Vallarta.
Color de marca `#a2652f`.

## Operación (pago, entrega, horarios…)

- Solo **recoger en tienda**; el cliente elige día y horario entre los que tienen cupo.
- El pedido se envía **sin pagar**: la encargada lo confirma o rechaza por WhatsApp.
- Si rechaza: motivo (p. ej. sin disponibilidad de un producto) y, opcional, propone otro horario.
- Al aceptar: plantilla con el resumen + imagen con los datos de transferencia; el cliente manda su comprobante
  y la encargada lo marca como pagado.
- El total lo calcula la app con los precios del menú.

**Dos perspectivas:** cliente (Santiago) y encargada de pedidos (Ana), con una etiqueta arriba del teléfono.
Camino mostrado: rechazo → motivo → propone 11:00 → cliente acepta → resumen + transferencia → comprobante → pagado.

## Assets y origen

- Fotos de producto: tienda en línea de Karmele (karmele.com.mx/tienda-en-linea), recortadas a 600×600.
- `logo.png`: círculo café con "K", generado (no es el logo oficial; cámbialo si lo mandan).
- `transferencia.png`: recorte de la captura que mandó el usuario. **Datos bancarios reales**, mostrados con su aprobación.
- `comprobante.png`: comprobante SPEI genérico, generado.

## Datos de ejemplo (no reales)

Cliente Santiago Castro y su teléfono, encargada "Ana", pedido #128, días/horarios con cupo, el motivo del rechazo
y el comprobante. Productos, precios y dirección son reales.

## Pendiente

- El flujo de confirmación aún no está en staging (allí sigue el checkout con tarjeta): el video lo **simula**
  imitando el diseño del storefront. Si cambia la app real, ajusta `pickupStorefront`.
- Logo oficial de Karmele.
