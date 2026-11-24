# Brief · Fuerza Gym

- **Tipo:** demos · **variante:** genérica (gimnasio) · **Id:** `FuerzaGym` · **fecha:** 2026-11-24
- **Base:** `pulso-studio` (entrada, WhatsApp y `classesStorefront`) + escenas nuevas `classFullPanel` y `weekClassesTablet`
- **Estado:** en revisión con el usuario
- **Duración:** ~89 s · voz Eric (1.1×) · música *Sunset Groove* bajita

## Mensaje

Tus clientes reservan su clase en segundos y tú ves todo tu gimnasio desde el panel de Aelika (teléfono o tablet).
La voz no dice el nombre del negocio: se reutiliza al personalizar.

## Flujo

1. **Cliente:** Maps / Instagram / Facebook / QR → WhatsApp (menú, Horarios, "Reservar clase") → reserva el **último lugar**
   de Spinning (Mié 25 · 7:15, coach Carla, 1 h 15 min) → se identifica con WhatsApp → compra paquete de 10 → lugar apartado.
2. **Gimnasio (sin WhatsApp, todo en el panel de Aelika):**
   - Teléfono: resumen de hoy → notificación "¡Clase llena!" → detalle (8/8, asistentes con su paquete, 2 en lista de espera).
   - Tablet: módulo **Clases de la semana** en calendario (clases de 1 h 15 min con coach y asistencia, p. ej. 5/8); acercamiento a la clase llena.
3. **Add-ons:** recordatorios automáticos, campañas y promociones, reportes automáticos, y más.

## Assets y origen

- Logo: hecho para el video (marca ficticia, "F" verde eléctrico sobre carbón).
- `photo-gym.jpg`: [Gym Fitness Center (22370915258).jpg](https://commons.wikimedia.org/wiki/File:Gym_Fitness_Center_(22370915258).jpg), Carl Lender, CC BY 2.0.
- `photo-class.jpg`: la de Pulso Studio (Shixart1985, CC BY 2.0). Créditos en `public/fuerza-gym/CREDITOS.md`.

## Datos de ejemplo (todo es ficticio)

Marca, reseñas (4.8 ★, 312), precios ($150 clase, $1,200 paquete 10, $1,490 mensualidad), coaches (Diego, Carla, Mauricio, Sofía),
clientes y asistentes, cupo de 8, horarios de la semana.

## Historial

- v1: dos perspectivas (cliente → gimnasio en el panel). El usuario pidió que del lado del gimnasio no hubiera WhatsApp.
