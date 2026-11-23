import {Perspective, VideoConfig} from '../../../core/types';
import {orderPanelReview} from '../../../scenes/order-panel';
import {pickupStorefront} from '../../../scenes/storefront/pickup';
import {pickupPay} from '../../../scenes/storefront/pickup-pay';
import {HistoryMsg, whatsappChat} from '../../../scenes/whatsapp';

/**
 * Karmele · pedido para recoger con CONFIRMACIÓN DE HORA (flujo del 2026-11-23).
 * 1. Chatbot: Hacer un pedido / Ver menú / Ubicación y horarios → link al storefront con el teléfono ya cargado.
 * 2. Storefront: carrito, nombre y la hora en que quiere recoger → se envía como SOLICITUD, sin cobro.
 * 3. Nataly (encargada) recibe el aviso, ve la solicitud en el panel como "Por confirmar", consulta con cocina y
 *    elige Confirmar hora o Proponer otra hora.
 * 4. Bot: si confirma → link de pago; si propone → link para aceptar o rechazar (aceptar = pago; rechazar = cancela).
 * 5. Pago solo con tarjeta en esa página → pedido Confirmado → confirmación por WhatsApp.
 * El video muestra el camino de "proponer otra hora"; la voz menciona el otro.
 * Dos perspectivas: el cliente (sin nombre en la voz) y Nataly.
 */
const A = (f: string) => `karmele/${f}`;

const CLIENTE: Perspective = {label: 'CLIENTE', sub: 'desde su celular', icon: 'person'};
const PEDIDOS: Perspective = {label: 'KARMELE · PEDIDOS', sub: 'Nataly, encargada de pedidos', icon: 'store', color: '#0b8cf3'};

// ---------- textos que se repiten entre escenas
const URL = 'pide.aelika.com/karmele';
const DIRECCION = 'José María Morelos 2279 A, Arcos Vallarta';
const bienvenida = '¡Hola! Bienvenido a Karmele 🥐 Repostería, Panadería & Café. Elige una opción para continuar:';
const tarjeta = {image: A('conchas.jpg'), footer: URL, button: 'Hacer mi pedido'};
const tarjetaTexto = '*¡Perfecto!* 🥐\nArma tu pedido y elige a qué hora quieres recogerlo. Tu número ya está cargado.';
const recibido = 'Recibimos tu solicitud #128 🥐 Karmele confirma la hora y te mandamos el link de pago por aquí.';
const AUTO = 'Mensaje automático de Aelika';
const avisoNuevo = '🔔 *Nueva solicitud #128* de Daniela Ruiz para recoger el miércoles 25 nov a las 9:00 a. m. ($1,150.00). Revísala en el panel para confirmar la hora.';
const propuesta = 'Karmele no alcanza a tener tu pedido #128 a las 9:00 a. m. y te propone recogerlo el *miércoles 25 a las 11:00 a. m.*\nAcepta para pasar al pago, o recházala:';
/** datos del pedido (panel y pago) */
const items = [
  {qty: 1, name: 'Caja con 12 Karmelitos', price: 590},
  {qty: 15, name: 'Conchas', price: 32},
  {qty: 8, name: 'Bolillo', price: 10},
];
const pedido = {orderNumber: '#128', customer: {name: 'Daniela Ruiz', phone: '33 1234 5678'}, date: 'Mié 25 nov', items};

const historialCliente: HistoryMsg[] = [
  {from: 'bot', text: tarjetaTexto, card: tarjeta, time: '14:32'},
  {from: 'bot', text: recibido, time: '14:35'},
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
          menu: {items: ['Hacer un pedido', 'Ver menú', 'Ubicación y horarios']},
          sub: 'Tu asistente le responde al instante.',
          pause: 44,
          tapMenu: 0,
        },
        {from: 'bot', text: tarjetaTexto, card: tarjeta, tap: true, zoom: true, typing: 18, sub: 'Y le manda el link para pedir, con su número ya cargado.'},
      ],
    }),

    // ESCENA 1 — Cliente: arma su carrito, pone su nombre y la hora, y envía la solicitud (sin cobro)
    pickupStorefront({
      url: URL,
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
      phonePrefilled: true,
      pickup: {address: DIRECCION},
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
      pickSlot: 1,
      scheduleNote: 'Pide con al menos un día de anticipación. Karmele te confirma la hora por WhatsApp.',
      orderNumber: '#128',
      from: 'Karmele',
      payNote: '💳 No se cobra nada todavía: Karmele confirma la hora y te manda por WhatsApp el link para pagar con tarjeta.',
      sendLabel: 'Enviar solicitud',
      sentTitle: '¡Solicitud enviada!',
      sentPill: 'Solicitud #128 · Por confirmar',
      sentNote: 'Karmele revisa que tu pedido esté listo el miércoles 25 a las 9:00 y te manda por WhatsApp el link de pago.',
      sentBanner: recibido,
      statusTime: '14:33',
      subtitles: {
        menu: 'Arma su carrito en tu menú en línea.',
        cart: 'Revisa lo que va a llevar.',
        data: 'Pone su nombre: el teléfono ya viene de WhatsApp.',
        schedule: 'Elige a qué hora le gustaría recogerlo.',
        summary: 'Envía su solicitud, sin cobro todavía.',
        sent: 'Queda por confirmar.',
      },
    }),

    // ESCENA 2 — Nataly: le llega el aviso de la solicitud y la abre en el panel
    whatsappChat({
      title: 'Karmele Chatbot',
      statusTime: '14:35',
      time: '14:35',
      perspective: PEDIDOS,
      enter: 'left',
      script: [{from: 'bot', text: avisoNuevo, footer: AUTO, cta: 'Ver pedido', tapCta: true, zoom: true, typing: 10, pause: 70, sub: 'A tu encargada le llega el aviso de la solicitud.'}],
    }),

    // ESCENA 3 — Nataly, en el panel: Por confirmar → consulta con cocina → Proponer otra hora
    orderPanelReview({
      ...pedido,
      time: '9:00 a. m.',
      statusTime: '14:36',
      perspective: PEDIDOS,
      proposeDays: ['Mié 25', 'Jue 26', 'Vie 27'],
      pickProposeDay: 0,
      proposeSlots: ['10:00', '11:00', '12:00', '13:00'],
      pickProposeSlot: 1,
      proposedTime: '11:00 a. m.',
    }),

    // ESCENA 4 — Cliente: recibe la propuesta con el link para aceptar o rechazar
    whatsappChat({
      title: 'Karmele',
      statusTime: '14:39',
      time: '14:39',
      history: historialCliente,
      perspective: CLIENTE,
      enter: 'left',
      script: [{from: 'bot', text: propuesta, cta: 'Ver propuesta', tapCta: true, zoom: true, typing: 12, pause: 60, sub: 'Tu cliente recibe la propuesta por WhatsApp.'}],
    }),

    // ESCENA 5 — Cliente: acepta la nueva hora y paga con tarjeta ahí mismo
    pickupPay({
      url: URL,
      title: 'Karmele',
      orderNumber: '#128',
      items,
      address: DIRECCION,
      agreed: 'Mié 25 nov · 11:00 a. m.',
      proposal: {requested: 'Mié 25 nov · 9:00 a. m.'},
      card: {number: '4242 4242 4242 4242', exp: '08/28', cvc: '123'},
      doneNote: 'Te esperamos el miércoles 25 a las 11:00 a. m. en José María Morelos 2279 A.',
      banner: 'Pedido #128 confirmado ✅ Te esperamos el mié 25 a las 11:00 a. m.',
      statusTime: '14:40',
      subtitles: {
        proposal: 'Ve la nueva hora y la acepta con un toque.',
        pay: 'Pasa directo al pago: resumen, hora acordada y tarjeta.',
        done: 'Pagado: el pedido queda confirmado.',
      },
    }),

    // ESCENA 6 — Cliente: confirmación por WhatsApp
    whatsappChat({
      title: 'Karmele',
      statusTime: '14:41',
      time: '14:41',
      history: [{from: 'bot', text: propuesta, cta: 'Ver propuesta', time: '14:39'}],
      perspective: CLIENTE,
      enter: 'left',
      script: [
        {
          from: 'bot',
          text: '✅ *Pedido #128 confirmado*\nPagado: $1,150.00 con tarjeta\n\nTe esperamos el *miércoles 25 a las 11:00 a. m.* en José María Morelos 2279 A 🥐',
          typing: 12,
          pause: 200,
          highlight: true,
          sub: 'Y recibe la confirmación por WhatsApp.',
        },
      ],
    }),
  ],

  addons: {
    kicker: 'Y PARA TU NEGOCIO',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '🔔', title: 'Recordatorios automáticos', desc: 'Un aviso por WhatsApp antes de la hora en que pasan por su pedido.'},
      {icon: '📣', title: 'Promociones y campañas', desc: 'Lanza el pan de temporada o un descuento a tus clientes en un clic.'},
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Sellos y recompensas que hacen volver a tus clientes.'},
    ],
  },

  // Voz en off: Sarah (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   NODE_USE_ENV_PROXY=1 node scripts/narrate.mjs src/videos/demos/karmele/narracion.json public/narracion/karmele [--only 2,4]
  // Escenas: 0 cliente (WhatsApp) · 1 cliente (solicitud) · 2 Nataly (aviso) · 3 Nataly (panel) ·
  //          4 cliente (propuesta) · 5 cliente (aceptar y pagar) · 6 cliente (confirmación)
  narration: {
    clips: [
      {src: 'narracion/karmele/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/karmele/02.mp3', anchor: {scene: 0, mark: 'turn0'}, offset: 0.3},
      {src: 'narracion/karmele/03.mp3', anchor: {scene: 1, mark: 'menu'}, offset: 0.8},
      {src: 'narracion/karmele/04.mp3', anchor: {scene: 1, mark: 'data'}, offset: 1.2},
      {src: 'narracion/karmele/05.mp3', anchor: {scene: 1, mark: 'summary'}, offset: 0.3},
      {src: 'narracion/karmele/06.mp3', anchor: {scene: 2, mark: 'turn0'}, offset: 0.4},
      {src: 'narracion/karmele/07.mp3', anchor: {scene: 3, mark: 'propose'}, offset: -0.5},
      {src: 'narracion/karmele/08.mp3', anchor: {scene: 4, mark: 'turn0'}, offset: 0.3},
      {src: 'narracion/karmele/09.mp3', anchor: {scene: 5, mark: 'pay'}, offset: 0.2},
      {src: 'narracion/karmele/10.mp3', anchor: {scene: 5, mark: 'done'}, offset: 0.3},
      {src: 'narracion/karmele/11.mp3', anchor: {scene: 6, mark: 'turn0'}, offset: 0.6},
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
