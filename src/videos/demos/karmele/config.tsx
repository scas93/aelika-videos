import React from 'react';
import {AelikaIcon} from '../../../aelika/Aelika';
import {Perspective, VideoConfig} from '../../../core/types';
import {pickupStorefront} from '../../../scenes/storefront/pickup';
import {HistoryMsg, whatsappChat} from '../../../scenes/whatsapp';

/**
 * Karmele · pedido para recoger con CONFIRMACIÓN de la encargada.
 * Dos perspectivas: el cliente (sin nombre en la voz) y la encargada de pedidos (Nataly).
 * Todos los horarios se pueden elegir: la encargada decide si el pedido puede estar listo.
 * Camino del video: la encargada rechaza por falta de conchas y propone otro horario → el cliente acepta →
 * resumen + datos para transferencia → comprobante → la encargada lo marca como pagado.
 */
const A = (f: string) => `karmele/${f}`;

const CLIENTE: Perspective = {label: 'CLIENTE', sub: 'desde su celular', icon: 'person'};
const PEDIDOS: Perspective = {label: 'KARMELE · PEDIDOS', sub: 'Nataly, encargada de pedidos', icon: 'store', color: '#0b8cf3'};

const aelikaAvatar = (
  <div style={{width: 38, height: 38, borderRadius: '50%', background: '#fff', border: '1px solid #e3e3e3', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <AelikaIcon size={24} />
  </div>
);

// ---------- textos que se repiten entre escenas (historial de cada chat)
const bienvenida = '¡Hola! Bienvenido a Karmele 🥐 Repostería, Panadería & Café. Elige una opción para continuar:';
const tarjeta = {image: A('conchas.jpg'), footer: 'pide.aelika.com/karmele', button: 'Hacer mi pedido'};
const tarjetaTexto = '*¡Perfecto!* 🥐\nArma tu pedido, elige el día y el horario para recogerlo, y te confirmamos por aquí.';
const recibido = 'Recibimos tu pedido #128 🥐 Lo estamos revisando y te confirmamos en unos minutos.';
const nuevoPedido =
  '🔔 *Nuevo pedido #128*\n\n👤 Daniela Ruiz · +52 33 1234 5678\n📅 Miércoles 25 nov · 9:00 a. m.\n🏪 Recoger en tienda\n\n• 1 Caja con 12 Karmelitos\n• 15 Conchas\n• 8 Bolillos\n\n💰 Total: $1,150.00\n\n¿Hay disponibilidad para ese horario?';
const propuesta = 'Hola 😔 Para el *mié 25 a las 9:00 a. m.* no vamos a tener listas las *conchas*.\n¿Te funciona recogerlo el *mié 25 a las 11:00 a. m.*?';
const resumen =
  '📋 *Resumen de tu pedido*\n\nFecha de pedido: 23 de noviembre de 2026\nNombre del cliente: Daniela Ruiz\nTeléfono: +52 33 1234 5678\nHorario: 25 de noviembre, 11:00 a. m.\n\nPedido:\n- 1 Caja con 12 Karmelitos, 15 conchas, 8 bolillos\n\nMonto total: $1,150.00\nEstatus del pago: Pendiente';
const pideComprobante = 'Cuando hagas tu transferencia, mándanos tu comprobante por aquí 🙌';

const historialCliente: HistoryMsg[] = [
  {from: 'bot', text: tarjetaTexto, card: tarjeta, time: '14:32'},
  {from: 'bot', text: recibido, time: '14:36'},
];
const historialEncargada: HistoryMsg[] = [
  {from: 'bot', text: '¿Quieres proponerle otro horario al cliente?', time: '14:38'},
  {from: 'user', text: 'Mié 25 · 11:00 a. m.', time: '14:38'},
  {from: 'bot', text: 'Listo 👍 Le enviamos tu propuesta al cliente. Te aviso cuando responda.', time: '14:38'},
];

export const karmele: VideoConfig = {
  id: 'Karmele',

  brand: {
    name: 'Karmele',
    logo: A('logo.png'),
    colors: {
      dark: '#1c1917',
      dark2: '#27231f',
      dark3: '#332d27',
      accent: '#a2652f',
      accentLight: '#d39a63',
      accentDark: '#7a4a20',
      light: '#f5efe6',
      paper: '#f8f5f0',
      line: '#e7e0d6',
      muted: '#8a8075',
    },
    displayFont: 'Inter, sans-serif',
    canvas: 'light',
  },

  scenes: [
    // ESCENA 0 — Cliente: le escribe a Karmele y elige "Hacer un pedido"
    whatsappChat({
      title: 'Karmele',
      statusTime: '14:32',
      time: '14:32',
      notice: true,
      perspective: CLIENTE,
      script: [
        {from: 'user', text: 'hola', sub: 'Tu cliente te escribe por WhatsApp…'},
        {
          from: 'bot',
          text: bienvenida,
          menu: {items: ['Hacer un pedido', 'Ubicación', 'Horarios', 'Facturación'], note: 'Si prefieres atención personalizada, escribe la palabra "asesor" y con gusto te atenderemos.'},
          sub: 'Tu asistente le responde al instante.',
          pause: 44,
          tapMenu: 0,
        },
        {from: 'bot', text: tarjetaTexto, card: tarjeta, tap: true, zoom: true, typing: 18, sub: 'Y le manda tu menú en línea.'},
      ],
    }),

    // ESCENA 1 — Cliente: arma su pedido, elige día y horario, y lo envía (sin pagar)
    pickupStorefront({
      url: 'pide.aelika.com/karmele',
      title: 'Karmele',
      categories: ['Karmelitos', 'Panadería Dulce', 'Panadería Salada', 'Pasteles'],
      items: [
        {name: 'Caja con 12 Karmelitos variados', price: 590, photo: A('caja12.jpg'), qty: 1},
        {name: 'Caja con 6 Karmelitos variados', price: 300, photo: A('caja6.jpg')},
        {name: 'Conchas', price: 32, photo: A('conchas.jpg'), qty: 15},
        {name: 'Rol de canela', price: 35, photo: A('rol-canela.jpg')},
        {name: 'Croissant tradicional', price: 38, photo: A('croissant.jpg')},
        {name: 'Bolillo', price: 10, photo: A('bolillo.jpg'), qty: 8},
        {name: 'Hogaza masa madre', price: 90, photo: A('hogaza.jpg')},
        {name: 'Chocolatin', price: 45, photo: A('chocolatin.jpg')},
      ],
      customer: {name: 'Daniela Ruiz', phone: '33 1234 5678'},
      pickup: {address: 'José María Morelos 2279 A, Arcos Vallarta'},
      days: [
        ['Mar', '24'],
        ['Mié', '25'],
        ['Jue', '26'],
        ['Vie', '27'],
        ['Sáb', '28'],
      ],
      pickDay: 1,
      dayLong: 'Miércoles 25 nov',
      slots: [['8:00'], ['9:00'], ['10:00'], ['11:00'], ['12:00'], ['13:00']],
      scheduleNote: 'Pide con al menos un día de anticipación. Karmele te confirma por WhatsApp.',
      pickSlot: 1,
      orderNumber: '#128',
      from: 'Karmele',
      payNote: '💳 No pagas todavía: Karmele confirma que tu pedido esté listo a esa hora y te manda por WhatsApp los datos para transferir.',
      statusTime: '14:33',
      subtitles: {
        menu: 'Arma su pedido en tu menú en línea.',
        cart: 'Revisa lo que va a llevar.',
        data: 'Deja su nombre y teléfono.',
        schedule: 'Elige el día y el horario para recogerlo.',
        summary: 'Envía su pedido, sin pagar todavía.',
        sent: 'Queda pendiente de tu confirmación.',
      },
    }),

    // ESCENA 2 — Encargada: le llega el pedido; lo rechaza, da el motivo y propone otro horario
    whatsappChat({
      title: 'Aelika · Pedidos Karmele',
      statusTime: '14:36',
      time: '14:36',
      avatar: aelikaAvatar,
      perspective: PEDIDOS,
      enter: 'left',
      script: [
        {from: 'bot', text: nuevoPedido, buttons: ['✅ Confirmar', '❌ Rechazar'], linkButton: 'Abrir en el panel de Aelika', tapButton: 1, pause: 185, zoom: true, typing: 10, sub: 'A tu encargada le llega el pedido completo…'},
        {from: 'bot', text: '¿Por qué lo rechazas?', menu: {items: ['Sin disponibilidad de un producto', 'Horario lleno', 'Otro motivo']}, tapMenu: 0, pause: 30, typing: 14, sub: 'Si no puede tenerlo listo, indica el motivo…'},
        {from: 'bot', text: '¿Qué producto no tendrás listo a las 9:00 a. m.?', menu: {items: ['Caja con 12 Karmelitos', 'Conchas', 'Bolillos']}, tapMenu: 1, pause: 30, typing: 14},
        {from: 'bot', text: '¿Quieres proponerle otro horario al cliente?', buttons: ['Mié 25 · 11:00 a. m.', 'Mié 25 · 1:00 p. m.', 'No, solo rechazar'], tapButton: 0, pause: 34, typing: 14, sub: '…y le propone otro horario.'},
        {from: 'bot', text: 'Listo 👍 Le enviamos tu propuesta al cliente. Te aviso cuando responda.', typing: 14, pause: 34},
      ],
    }),

    // ESCENA 3 — Cliente: acepta el nuevo horario, recibe resumen y datos para transferir, manda comprobante
    whatsappChat({
      title: 'Karmele',
      statusTime: '14:39',
      time: '14:39',
      history: historialCliente,
      perspective: CLIENTE,
      enter: 'left',
      script: [
        {from: 'bot', text: propuesta, buttons: ['Sí, cambiar a 11:00 a. m.', 'Elegir otro horario', 'Cancelar pedido'], tapButton: 0, pause: 46, typing: 12, sub: 'El cliente acepta el nuevo horario con un toque.'},
        {from: 'bot', text: resumen, highlight: true, typing: 16, pause: 50, sub: 'Y recibe el resumen de su pedido…'},
        {from: 'bot', text: 'Datos para transferencia', image: A('transferencia.png'), typing: 10, pause: 44, sub: '…con los datos para transferir.'},
        {from: 'bot', text: pideComprobante, typing: 10, pause: 20},
        {from: 'user', text: '', image: A('comprobante.png'), pause: 40, sub: 'Manda su comprobante por el mismo chat.'},
      ],
    }),

    // ESCENA 4 — Encargada: el cliente aceptó; llega el comprobante y lo marca como pagado
    whatsappChat({
      title: 'Aelika · Pedidos Karmele',
      statusTime: '14:41',
      time: '14:41',
      history: historialEncargada,
      avatar: aelikaAvatar,
      perspective: PEDIDOS,
      enter: 'left',
      script: [
        {from: 'bot', text: '✅ *El cliente aceptó el nuevo horario*\nPedido #128 confirmado para el mié 25 · 11:00 a. m.', typing: 10, pause: 34, sub: 'Tu encargada ve que el cliente aceptó…'},
        {from: 'bot', text: '💸 El cliente envió su comprobante del pedido #128 ($1,150.00)', image: A('comprobante.png'), buttons: ['Marcar como pagado', 'Revisar después'], tapButton: 0, typing: 10, pause: 44, sub: '…y marca el pago con un toque.'},
        {from: 'bot', text: 'Listo ✅ Pedido #128 pagado. Ya le avisamos al cliente.', typing: 10, pause: 30},
      ],
    }),

    // ESCENA 5 — Cliente: pago recibido
    whatsappChat({
      title: 'Karmele',
      statusTime: '14:42',
      time: '14:42',
      history: [{from: 'user', text: '', image: A('comprobante.png'), time: '14:41'}],
      perspective: CLIENTE,
      enter: 'left',
      script: [{from: 'bot', text: 'Pago recibido ✅ ¡Gracias!\nTe esperamos el *miércoles 25 a las 11:00 a. m.* en José María Morelos 2279 A 🥐', typing: 12, pause: 132, highlight: true, sub: 'Y el cliente recibe la confirmación de su pago.'}],
    }),
  ],

  addons: {
    kicker: 'Y PARA TU NEGOCIO',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '🔔', title: 'Recordatorios automáticos', desc: 'Un aviso por WhatsApp antes de la hora en que pasan por su pedido.'},
      {icon: '📣', title: 'Promociones y campañas', desc: 'Lanza el pan de temporada o un descuento a tus clientes en un clic.'},
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Sellos y recompensas que hacen volver a tus clientes.'},
    ],
  },

  // Voz en off: Sarah (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   node scripts/narrate.mjs src/videos/demos/karmele/narracion.json public/narracion/karmele
  // Escenas: 0 cliente (WhatsApp) · 1 cliente (storefront) · 2 encargada · 3 cliente · 4 encargada · 5 cliente
  narration: {
    clips: [
      {src: 'narracion/karmele/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/karmele/02.mp3', anchor: {scene: 0, mark: 'turn0'}, offset: 0.6},
      {src: 'narracion/karmele/03.mp3', anchor: {scene: 1, mark: 'menu'}, offset: 0.5},
      {src: 'narracion/karmele/04.mp3', anchor: {scene: 1, mark: 'data'}, offset: 1.0},
      {src: 'narracion/karmele/05.mp3', anchor: {scene: 1, mark: 'summary'}, offset: 0.3},
      {src: 'narracion/karmele/06.mp3', anchor: {scene: 2, mark: 'turn0'}, offset: 0.4},
      {src: 'narracion/karmele/07.mp3', anchor: {scene: 2, mark: 'turn1'}, offset: 0.45},
      {src: 'narracion/karmele/08.mp3', anchor: {scene: 3, mark: 'turn0'}, offset: 0.3},
      {src: 'narracion/karmele/09.mp3', anchor: {scene: 3, mark: 'turn4'}, offset: -0.5},
      {src: 'narracion/karmele/10.mp3', anchor: {scene: 4, mark: 'turn1'}, offset: -0.1},
      {src: 'narracion/karmele/11.mp3', anchor: {scene: 5, mark: 'turn0'}, offset: 0.4},
      {src: 'narracion/karmele/12.mp3', anchor: 'addons', offset: 0.6},
      {src: 'narracion/karmele/13.mp3', anchor: 'outro', offset: 0.4},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay). No va en el repo: public/musica/sunset-groove.mp3
  music: {src: 'musica/sunset-groove.mp3', volume: 0.14, startAt: 0.25},

  cover: {useOutro: true},

  outro: {
    tagline: ['Pedidos, confirmaciones y pagos', 'por WhatsApp.'],
    cta: 'Agendemos una llamada',
  },
};
