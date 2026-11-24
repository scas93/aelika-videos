import {Perspective, VideoConfig} from '../../../core/types';
import {entryPoints} from '../../../scenes/entry-points';
import {pickupStorefront} from '../../../scenes/storefront/pickup';
import {tabletOrders} from '../../../scenes/tablet-orders';
import {thermalPrinter} from '../../../scenes/thermal-printer';
import {whatsappChat} from '../../../scenes/whatsapp';

/**
 * Maké Repostería · pedido para recoger otro día (personalizada).
 * Cliente: llega desde Instagram (post o perfil), Facebook o un QR → WhatsApp (menú tipo Karmele) → menú en línea →
 * elige día y hora (cada hora, desde mañana) → paga (en tienda, tarjeta o Apple Pay) → confirmado + WhatsApp.
 * Maké: aviso en el teléfono del encargado → iPad con la app de Aelika → comanda en impresora térmica.
 * Productos, fotos y precios: menú de Maké Bakery en Rappi (public/make/menu.json).
 */
const A = (f: string) => `make/${f}`;

const CLIENTE: Perspective = {label: 'TU CLIENTE', sub: 'desde su celular', icon: 'person'};
const ENCARGADO: Perspective = {label: 'MAKÉ', sub: 'tu encargado, en su teléfono', icon: 'store', color: '#0b8cf3'};
const IPAD: Perspective = {label: 'MAKÉ', sub: 'en la tablet del mostrador', icon: 'store', color: '#0b8cf3'};
const IMPRESORA: Perspective = {label: 'MAKÉ', sub: 'en la impresora de la cocina', icon: 'store', color: '#0b8cf3'};

const URL = 'pide.aelika.com/make';
const DIRECCION = 'Calle Euclides 3120, Vallarta San Jorge, Guadalajara';
const PASA = 'miércoles 25 a las 10:00 a. m.';
const AUTO = 'Mensaje automático de Aelika';
/** La voz está pendiente: se acabaron los créditos de ElevenLabs (se reinician el 20 de dic). Al generarla, pon true. */
const CON_VOZ = false;
const items = [
  {name: 'Crookie Nutella', price: 119, photo: A('crookie-nutella.jpg'), qty: 1},
  {name: 'Rebanada Cheesecake Lotus', price: 188, photo: A('rebanada-cheesecake-lotus.jpg'), qty: 1},
  {name: 'Brownie Individual de Nutella', price: 88, photo: A('brownie-individual-de-nutella.jpg')},
  {name: 'Galleta Avellana Nutella', price: 88, photo: A('galleta-avellana-nutella.jpg')},
  {name: 'Cupcake Red Velvet', price: 63, photo: A('cupcake-red-velvet.jpg'), qty: 2},
  {name: 'Cupcake Lotus', price: 63, photo: A('cupcake-lotus.jpg')},
  {name: 'Rebanada Zanahoria', price: 150, photo: A('rebanada-zanahoria.jpg')},
  {name: 'Galleta Chispas', price: 80, photo: A('galleta-chispas.jpg')},
];
const pedidas = items.filter((i) => i.qty).map((i) => ({qty: i.qty!, name: i.name, price: i.price, photo: i.photo}));
const total = pedidas.reduce((a, i) => a + i.qty * i.price, 0); // $433
const avisoNuevo = `🔔 *Nuevo pedido #1042* de Andrea L.\nPasa a recogerlo el *${PASA}*\n💳 Pagado con Apple Pay: $${total}.00`;

export const make: VideoConfig = {
  id: 'Make',

  brand: {
    name: 'Maké',
    logo: A('logo.jpg'),
    colors: {
      dark: '#3a0a12',
      dark2: '#5c0f1b',
      dark3: '#741726',
      accent: '#9b3a4a',
      accentLight: '#e8d3cb',
      accentDark: '#5c0f1b',
      light: '#f6efe7',
      paper: '#fbf8f3',
      line: '#eaded5',
      muted: '#8a7a74',
    },
    displayFont: 'Inter, sans-serif',
    canvas: 'light',
  },

  scenes: [
    // ESCENA 0 — Llegan desde donde sea: post de Instagram, perfil, Facebook o QR → WhatsApp
    entryPoints({
      channels: ['igpost', 'instagram', 'facebook', 'qr'],
      name: 'Maké Repostería',
      handle: 'make.reposteria',
      category: 'Repostería',
      postImage: A('portada.jpg'),
      postCaption: 'Tu antojo listo cuando pases por él 🍰',
      time: '10:12',
      dateLabel: 'martes, 24 de noviembre',
      copy: {qrTitle: 'Escanea para pedir', qrWhere: 'en el mostrador', labels: {qr: 'QR EN TU MOSTRADOR', instagram: 'TU PERFIL'}},
      subtitles: ['Tus clientes llegan de donde sea…', '…y todo empieza en tu WhatsApp.'],
    }),

    // ESCENA 1 — Cliente: menú tipo Karmele → Ubicación → Hacer un pedido → menú en línea
    whatsappChat({
      title: 'Maké Repostería',
      statusTime: '10:13',
      time: '10:13',
      notice: true,
      perspective: CLIENTE,
      script: [
        {from: 'user', text: 'hola', sub: 'Te escriben por WhatsApp…'},
        {
          from: 'bot',
          text: '¡Hola! Bienvenido a *Maké Repostería* 🍰 Elige una opción para continuar:',
          menu: {items: ['Hacer un pedido', 'Ubicación', 'Horarios', 'Facturación'], note: 'Si prefieres atención personalizada, escribe la palabra "asesor" y con gusto te atenderemos.'},
          sub: 'Tu asistente les responde al instante.',
          pause: 50,
          tapMenu: 1,
        },
        {
          from: 'bot',
          text: '📍 Estamos en *Calle Euclides 3120*, Fracc. Vallarta San Jorge, 44690 Guadalajara.',
          buttons: ['Hacer un pedido', 'Ver horarios'],
          tapButton: 0,
          pause: 34,
          sub: 'Resuelve sus dudas sin que tú contestes.',
        },
        {
          from: 'bot',
          text: '*¡Con gusto!* 🥐\nArma tu pedido y elige qué día y a qué hora pasas por él.',
          card: {image: A('portada.jpg'), footer: URL, button: 'Hacer mi pedido'},
          tap: true,
          zoom: true,
          typing: 18,
          sub: 'Y los lleva a tu menú en línea.',
        },
      ],
    }),

    // ESCENA 2 — Cliente: productos → día y hora (cada hora, desde mañana) → cómo paga → Apple Pay → confirmado
    pickupStorefront({
      url: URL,
      title: 'Maké Repostería',
      categories: ['Crookies', 'Rebanadas', 'Cupcakes', 'Brownies', 'Galletas'],
      items,
      orderNumber: '#1042',
      from: 'Maké Repostería',
      statusTime: '10:14',
      now: {
        ready: '',
        address: DIRECCION,
        custom: {direct: true, days: ['Mañana', 'Jue 26', 'Vie 27', 'Sáb 28', 'Lun 30'], pickDay: 0, slots: ['9 am', '10 am', '11 am', '12 pm', '1 pm'], pickSlot: 1},
        readyAt: PASA,
        banner: `Pedido #1042 confirmado ✅ Pasa por él el ${PASA}. ¡Te esperamos! 🍰`,
      },
      subtitles: {
        menu: 'Arman su pedido en tu menú en línea.',
        cart: 'Revisan lo que van a llevar.',
        checkout: 'Eligen qué día y a qué hora pasan.',
        pay: 'Pagan en tienda, con tarjeta o con Apple Pay.',
        applePay: 'Con Apple Pay, en un toque.',
        done: 'Y les llega la confirmación por WhatsApp.',
      },
    }),

    // ESCENA 3 — Maké: aviso en el teléfono del encargado
    whatsappChat({
      title: 'Maké Chatbot',
      statusTime: '10:15',
      time: '10:15',
      perspective: ENCARGADO,
      enter: 'left',
      script: [{from: 'bot', text: avisoNuevo, footer: AUTO, cta: 'Ver pedido', cta2: 'Hablar con cliente', zoom: true, typing: 10, pause: 70, sub: 'Tu equipo recibe el pedido al instante…'}],
    }),

    // ESCENA 4 — Maké: el mismo pedido en la tablet con la app de Aelika
    tabletOrders({
      storeName: 'Maké Repostería',
      clock: '10:15',
      perspective: IPAD,
      queue: [
        {number: '#1041', customer: 'Mariana P.', items: 3, time: '10:02', status: 'prep'},
        {number: '#1040', customer: 'Luis R.', items: 2, time: '9:48', status: 'prep'},
        {number: '#1039', customer: 'Paola G.', items: 1, time: '9:30', status: 'ready'},
      ],
      order: {number: '#1042', customer: 'Andrea L.', time: '10:15', delivery: 'Para recoger · mañana', readyLabel: 'Pasa', ready: 'Mié 25 · 10:00', lines: pedidas, payment: 'Apple Pay'},
      subtitles: {open: '…en una tablet con la app de Aelika…', arrive: '…cada pedido llega con aviso…', detail: '…ya pagado y con su hora.'},
    }),

    // ESCENA 5 — Maké: comanda impresa
    thermalPrinter({
      store: 'Maké Repostería',
      orderNumber: '#1042',
      customer: 'Andrea L.',
      pickupAt: 'Mié 25 · 10:00 a. m.',
      items: [
        {qty: 1, name: 'Crookie Nutella'},
        {qty: 1, name: 'Reb. Cheesecake Lotus'},
        {qty: 2, name: 'Cupcake Red Velvet'},
      ],
      total: `$${total}.00`,
      payment: 'APPLE PAY',
      perspective: IMPRESORA,
      subtitles: {open: '…o impreso como comanda,', print: 'directo en tu cocina.'},
    }),
  ],

  addons: {
    kicker: 'Y PARA TU NEGOCIO',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '📣', title: 'Campañas de marketing', desc: 'Promociones y novedades para todos tus clientes.'},
      {icon: '📊', title: 'Reportes automáticos', desc: 'Tus ventas y pedidos, sin tener que pedirlos.'},
      {icon: '🛵', title: 'Pedidos a domicilio', desc: 'Con el envío cotizado al momento.'},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay). No va en el repo: public/musica/sunset-groove.mp3
  music: {src: 'musica/sunset-groove.mp3', volume: 0.14, startAt: 0.25},

  // Voz en off: Eric (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   NODE_USE_ENV_PROXY=1 node scripts/narrate.mjs src/videos/demos/make/narracion.json public/narracion/make [--only 2,4]
  // Escenas: 0 entrada · 1 cliente WhatsApp · 2 cliente pide y paga · 3 aviso al encargado · 4 tablet · 5 impresora
  narration: !CON_VOZ ? undefined : {
    clips: [
      {src: 'narracion/make/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/make/02.mp3', anchor: {scene: 0, mark: 'cards'}, offset: 0.4},
      {src: 'narracion/make/03.mp3', anchor: {scene: 1, mark: 'turn1'}, offset: 0},
      {src: 'narracion/make/04.mp3', anchor: {scene: 2, mark: 'menu'}, offset: 0.8},
      {src: 'narracion/make/05.mp3', anchor: {scene: 2, mark: 'checkout'}, offset: 0},
      {src: 'narracion/make/06.mp3', anchor: {scene: 2, mark: 'card'}, offset: -0.3},
      {src: 'narracion/make/07.mp3', anchor: {scene: 2, mark: 'done'}, offset: 0.3},
      {src: 'narracion/make/08.mp3', anchor: {scene: 3, mark: 'turn0'}, offset: 0.3},
      {src: 'narracion/make/09.mp3', anchor: {scene: 4, mark: 'open'}, offset: 0.3},
      {src: 'narracion/make/10.mp3', anchor: {scene: 5, mark: 'open'}, offset: 0.3},
      {src: 'narracion/make/11.mp3', anchor: 'addons', offset: 0.5},
      {src: 'narracion/make/12.mp3', anchor: 'outro', offset: 0.4},
    ],
  },

  cover: {useOutro: true},

  outro: {
    cta: 'Agendemos una llamada',
  },
};
