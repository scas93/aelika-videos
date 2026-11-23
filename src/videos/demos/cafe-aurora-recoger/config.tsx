import {Perspective, VideoConfig} from '../../../core/types';
import {orderPanelView} from '../../../scenes/order-panel';
import {pickupStorefront} from '../../../scenes/storefront/pickup';
import {tabletOrders} from '../../../scenes/tablet-orders';
import {whatsappChat} from '../../../scenes/whatsapp';

/**
 * Café Aurora · PIDE Y PASA A RECOGER SIN HACER FILA (cafetería genérica).
 * Menú solo de pan. Cliente, en un solo paso: WhatsApp → menú → elige cuándo pasa (ahorita, 30, 45, 60 min u
 * otra hora → día y hora) →
 * paga (en tienda, tarjeta o Apple Pay) → confirmado.
 * Encargado: recibe el pedido en su teléfono (aviso de WhatsApp → panel de Aelika) y luego en el iPad de la barra.
 * Marca ficticia y fotos de Café Aurora (Banetto); la voz no dice el nombre del negocio.
 */
const A = (f: string) => `cafe-aurora/${f}`;

const CLIENTE: Perspective = {label: 'TU CLIENTE', sub: 'desde su celular', icon: 'person'};
const ENCARGADO: Perspective = {label: 'TU CAFETERÍA', sub: 'tu encargado, en su teléfono', icon: 'store', color: '#0b8cf3'};
const IPAD: Perspective = {label: 'TU CAFETERÍA', sub: 'en el iPad de la barra', icon: 'store', color: '#0b8cf3'};

const URL = 'pide.aelika.com/cafe-aurora';
const DIRECCION = 'Av. Chapultepec 120, Americana';
const PASA = 'martes 24 a las 9:00 a. m.';
const AUTO = 'Mensaje automático de Aelika';
const items = [
  {name: 'Croissant', price: 48, photo: A('croissant.jpg'), qty: 2},
  {name: 'Croissant de almendra', price: 62, photo: A('croissant-almendra.jpg')},
  {name: 'Chocolatín', price: 52, photo: A('chocolatin.jpg'), qty: 2},
  {name: 'Kouign amann', price: 68, photo: A('kouign-amann.jpg')},
  {name: 'Rol de canela', price: 55, photo: A('rol-canela.jpg'), qty: 2},
  {name: 'Espiral de naranja', price: 50, photo: A('espiral-naranja.jpg')},
  {name: 'Baguette', price: 45, photo: A('baguette.jpg')},
  {name: 'Hogaza natural', price: 95, photo: A('hogaza.jpg')},
];
const pedidas = items.filter((i) => i.qty).map((i) => ({qty: i.qty!, name: i.name, price: i.price, photo: i.photo}));
const total = pedidas.reduce((a, i) => a + i.qty * i.price, 0); // $310
const avisoNuevo = `🔔 *Nuevo pedido #91* de Andrea M.\nPasa a recogerlo el *${PASA}*\n💳 Pagado con Apple Pay: $${total}.00`;

export const cafeAuroraRecoger: VideoConfig = {
  id: 'CafeAuroraRecoger',

  brand: {
    name: 'Café Aurora',
    logo: A('logo.png'),
    colors: {
      dark: '#16231e',
      dark2: '#1d2d27',
      dark3: '#263a32',
      accent: '#2f6b57',
      accentLight: '#7fb39c',
      accentDark: '#1f4a3c',
      light: '#f3ece0',
      paper: '#f8f4ec',
      line: '#e5ddd0',
      muted: '#7d8a82',
    },
    displayFont: 'Inter, sans-serif',
    canvas: 'light',
  },

  scenes: [
    // ESCENA 0 — Cliente: WhatsApp con menú corto → link al menú en línea
    whatsappChat({
      title: 'Café Aurora',
      statusTime: '10:23',
      time: '10:23',
      notice: true,
      perspective: CLIENTE,
      script: [
        {from: 'user', text: 'hola! quiero pedir pan para pasar a recoger', sub: 'Tu cliente te escribe por WhatsApp…'},
        {
          from: 'bot',
          text: '¡Hola! Bienvenido a Café Aurora ☕ ¿Qué te gustaría hacer?',
          menu: {items: ['Hacer un pedido', 'Ver menú', 'Ubicación y horarios']},
          sub: 'Tu asistente le responde al instante.',
          pause: 40,
          tapMenu: 0,
        },
        {
          from: 'bot',
          text: '*¡Va!* 🥐\nPide tu pan desde aquí y pasa por él sin hacer fila.',
          card: {image: A('croissant.jpg'), footer: URL, button: 'Hacer mi pedido'},
          tap: true,
          zoom: true,
          typing: 18,
          sub: 'Y le manda tu menú en línea.',
        },
      ],
    }),

    // ESCENA 1 — Cliente, en un solo paso: productos → cuándo pasa → cómo paga → Apple Pay → confirmado
    pickupStorefront({
      url: URL,
      title: 'Café Aurora',
      categories: ['Croissants', 'Pan dulce', 'Pan salado', 'Especiales'],
      items,
      orderNumber: '#91',
      from: 'Café Aurora',
      statusTime: '10:24',
      now: {
        ready: '30 min',
        address: DIRECCION,
        times: ['Ahorita', '30 min', '45 min', '60 min', 'Otra hora'],
        pickTime: 4,
        custom: {days: ['Hoy', 'Mañana', 'Mié 25', 'Jue 26', 'Vie 27'], pickDay: 1, slots: ['8:00', '8:30', '9:00', '9:30', '10:00'], pickSlot: 2},
        readyAt: PASA,
        banner: `Pedido #91 confirmado ✅ Pasa por él el ${PASA}, te estará esperando 🥐`,
      },
      subtitles: {
        menu: 'Arma su pedido en tu menú en línea.',
        cart: 'Revisa lo que va a llevar.',
        checkout: 'Elige cuándo pasa: ahorita, al rato, o qué día y hora.',
        pay: 'Paga en tienda, con tarjeta o con Apple Pay.',
        applePay: 'Paga con Apple Pay en un toque.',
        done: 'Listo: pasa, recoge y se va, sin hacer fila.',
      },
    }),

    // ESCENA 2 — Encargado: le llega el pedido por WhatsApp y lo abre
    whatsappChat({
      title: 'Café Aurora Chatbot',
      statusTime: '10:25',
      time: '10:25',
      perspective: ENCARGADO,
      enter: 'left',
      script: [{from: 'bot', text: avisoNuevo, footer: AUTO, cta: 'Ver pedido', cta2: 'Hablar con cliente', tapCta: true, zoom: true, typing: 10, pause: 70, sub: 'Tu encargado recibe el pedido al instante…'}],
    }),

    // ESCENA 3 — Encargado, en el panel de Aelika (teléfono): pedido pagado y con hora
    orderPanelView({
      orderNumber: '#91',
      customer: {name: 'Andrea Medina', phone: '33 9876 5432'},
      date: '',
      time: '',
      items: pedidas,
      pickupAt: 'Mar 24 · 9:00 a. m.',
      payment: 'Apple Pay',
      statusTime: '10:25',
      perspective: ENCARGADO,
    }),

    // ESCENA 4 — Encargado: el mismo pedido en el iPad de la barra (vista tipo apps de delivery)
    tabletOrders({
      storeName: 'Café Aurora',
      clock: '10:25',
      perspective: IPAD,
      queue: [
        {number: '#90', customer: 'Sofía G.', items: 2, time: '10:18', status: 'prep'},
        {number: '#89', customer: 'Luis R.', items: 3, time: '10:12', status: 'prep'},
        {number: '#88', customer: 'Diego P.', items: 1, time: '10:05', status: 'ready'},
      ],
      order: {number: '#91', customer: 'Andrea M.', time: '10:25', delivery: 'Para recoger · mañana', readyLabel: 'Pasa', ready: 'Mar 24 · 9:00', lines: pedidas, payment: 'Apple Pay'},
      subtitles: {open: 'Y en el iPad de tu barra…', arrive: '…cada pedido llega con aviso…', detail: '…para tenerlo listo cuando llegue.'},
    }),
  ],

  addons: {
    kicker: 'Y PARA TU CAFETERÍA',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Sellos digitales: el décimo pan va por tu cuenta.'},
      {icon: '📣', title: 'Promociones y campañas', desc: 'Avisa del pan recién salido o del pan de temporada.'},
      {icon: '🔔', title: 'Recordatorios automáticos', desc: 'Un mensaje para que vuelvan por su pan de siempre.'},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay). No va en el repo: public/musica/sunset-groove.mp3
  music: {src: 'musica/sunset-groove.mp3', volume: 0.14, startAt: 0.25},

  // Voz en off: Eric (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   NODE_USE_ENV_PROXY=1 node scripts/narrate.mjs src/videos/demos/cafe-aurora-recoger/narracion.json public/narracion/cafe-aurora-recoger [--only 2,4]
  // Escenas: 0 cliente WhatsApp · 1 cliente pide y paga · 2 encargado aviso · 3 encargado panel · 4 iPad
  narration: {
    clips: [
      {src: 'narracion/cafe-aurora-recoger/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/cafe-aurora-recoger/02.mp3', anchor: {scene: 0, mark: 'turn1'}, offset: 0},
      {src: 'narracion/cafe-aurora-recoger/03.mp3', anchor: {scene: 1, mark: 'menu'}, offset: 1.5},
      {src: 'narracion/cafe-aurora-recoger/04.mp3', anchor: {scene: 1, mark: 'checkout'}, offset: -0.2},
      {src: 'narracion/cafe-aurora-recoger/05.mp3', anchor: {scene: 1, mark: 'applePay'}, offset: -0.1},
      {src: 'narracion/cafe-aurora-recoger/06.mp3', anchor: {scene: 1, mark: 'done'}, offset: 0.3},
      {src: 'narracion/cafe-aurora-recoger/07.mp3', anchor: {scene: 2, mark: 'turn0'}, offset: 0.3},
      {src: 'narracion/cafe-aurora-recoger/08.mp3', anchor: {scene: 4, mark: 'open'}, offset: 0.4},
      {src: 'narracion/cafe-aurora-recoger/09.mp3', anchor: 'addons', offset: 0.5},
      {src: 'narracion/cafe-aurora-recoger/10.mp3', anchor: 'outro', offset: 0.4},
    ],
  },

  cover: {useOutro: true},

  outro: {
    tagline: ['Pedidos para recoger', 'sin hacer fila.'],
    cta: 'Agendemos una llamada',
  },
};
