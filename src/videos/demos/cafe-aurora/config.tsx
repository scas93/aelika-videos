import {Perspective, VideoConfig} from '../../../core/types';
import {entryPoints} from '../../../scenes/entry-points';
import {pickupStorefront} from '../../../scenes/storefront/pickup';
import {tabletOrders} from '../../../scenes/tablet-orders';
import {whatsappChat} from '../../../scenes/whatsapp';

/**
 * Café Aurora · demo GENÉRICA de cafetería, solo para recoger (marca ficticia; datos de ejemplo).
 * Cliente: entra desde Instagram, Facebook, Google o el QR → WhatsApp con menú corto → menú en línea →
 * recoger lo antes posible, pagar en tienda o con tarjeta (Apple Pay) → confirmación por WhatsApp.
 * Local: recibe el pedido en el teléfono (WhatsApp) y en el iPad de la barra (vista de pedidos).
 * La voz no dice el nombre del negocio, para reutilizarla al personalizar.
 * Fotos de producto: Panadería Banetto (ver public/cafe-aurora/CREDITOS.md).
 */
const A = (f: string) => `cafe-aurora/${f}`;

const CLIENTE: Perspective = {label: 'TU CLIENTE', sub: 'desde su celular', icon: 'person'};
const TELEFONO: Perspective = {label: 'TU CAFETERÍA', sub: 'en el teléfono del encargado', icon: 'store', color: '#0b8cf3'};
const IPAD: Perspective = {label: 'TU CAFETERÍA', sub: 'en el iPad de la barra', icon: 'store', color: '#0b8cf3'};

const URL = 'pide.aelika.com/cafe-aurora';
const DIRECCION = 'Av. Chapultepec 120, Americana';
const LISTO = '~15 min';
const AUTO = 'Mensaje automático de Aelika';
const items = [
  {name: 'Latte', price: 65, photo: A('latte.jpg'), qty: 2},
  {name: 'Americano', price: 50, photo: A('americano.jpg')},
  {name: 'Croissant', price: 48, photo: A('croissant.jpg'), qty: 1},
  {name: 'Chocolatín', price: 52, photo: A('chocolatin.jpg'), qty: 1},
  {name: 'Galleta red velvet', price: 38, photo: A('galleta.jpg'), qty: 1},
  {name: 'Rol de canela', price: 55, photo: A('rol-canela.jpg')},
  {name: 'Frappé moka', price: 85, photo: A('frappe.jpg')},
  {name: 'Alfajor de chocolate', price: 35, photo: A('alfajor.jpg')},
];
const pedidas = items.filter((i) => i.qty).map((i) => ({qty: i.qty!, name: i.name, price: i.price, photo: i.photo}));
const total = pedidas.reduce((a, i) => a + i.qty * i.price, 0); // $268
const avisoLocal =
  `🔔 *Nuevo pedido #88* de Andrea M.\nPara recoger lo antes posible (${LISTO})\n\n` +
  pedidas.map((i) => `• ${i.qty} ${i.name}`).join('\n') +
  `\n\n💳 Pagado con Apple Pay: $${total}.00`;

export const cafeAurora: VideoConfig = {
  id: 'CafeAurora',

  brand: {
    name: 'Café Aurora',
    logo: A('logo.png'),
    // verde café y crema, del logo
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
    // ESCENA 0 — Puntos de entrada: Instagram, Facebook, Google Maps y el QR de la barra
    entryPoints({
      channels: ['instagram', 'facebook', 'maps', 'qr'],
      name: 'Café Aurora',
      handle: 'cafe.aurora',
      category: 'Cafetería',
      rating: '4.8',
      reviews: '426',
      time: '10:21',
      dateLabel: 'lunes, 23 de noviembre',
      copy: {qrTitle: 'Escanea y pide para llevar', qrWhere: 'en tu barra o en tu ventana', labels: {qr: 'QR EN TU CAFETERÍA'}, fbFollowers: '3.4 mil'},
      subtitles: ['Tus clientes te encuentran donde sea…', '…y todo empieza en tu WhatsApp.'],
    }),

    // ESCENA 1 — Cliente: WhatsApp con menú corto → tarjeta al menú en línea
    whatsappChat({
      title: 'Café Aurora',
      statusTime: '10:21',
      time: '10:21',
      notice: true,
      perspective: CLIENTE,
      script: [
        {from: 'user', text: 'hola! quiero pedir para llevar', sub: 'Tu cliente te escribe por WhatsApp…'},
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
          text: '*¡Va!* ☕\nArma tu pedido y lo recoges en cuanto esté listo.',
          card: {image: A('latte.jpg'), footer: URL, button: 'Hacer mi pedido'},
          tap: true,
          zoom: true,
          typing: 18,
          sub: 'Y le manda tu menú en línea.',
        },
      ],
    }),

    // ESCENA 2 — Cliente: menú, carrito, recoger lo antes posible, pago (en tienda o tarjeta → Apple Pay)
    pickupStorefront({
      url: URL,
      title: 'Café Aurora',
      categories: ['Café', 'Pan dulce', 'Galletas', 'Fríos'],
      items,
      orderNumber: '#88',
      from: 'Café Aurora',
      statusTime: '10:22',
      now: {
        ready: LISTO,
        address: DIRECCION,
        banner: `Pedido #88 confirmado ✅ Estará listo en ${LISTO}. Te esperamos en ${DIRECCION} ☕`,
      },
      subtitles: {
        menu: 'Arma su pedido en tu menú en línea.',
        cart: 'Revisa lo que va a llevar.',
        checkout: 'Lo recoge lo antes posible y elige cómo pagar.',
        applePay: 'Paga con Apple Pay en un toque.',
        done: 'Pedido confirmado y pagado.',
      },
    }),

    // ESCENA 3 — Cliente: confirmación por WhatsApp
    whatsappChat({
      title: 'Café Aurora',
      statusTime: '10:23',
      time: '10:23',
      history: [{from: 'bot', text: '*¡Va!* ☕\nArma tu pedido y lo recoges en cuanto esté listo.', card: {image: A('latte.jpg'), footer: URL, button: 'Hacer mi pedido'}, time: '10:21'}],
      perspective: CLIENTE,
      enter: 'left',
      script: [
        {
          from: 'bot',
          text: `✅ *Pedido #88 confirmado*\nPagado con Apple Pay: $${total}.00\n\nEstará listo en ${LISTO}. Te esperamos en ${DIRECCION} ☕`,
          typing: 12,
          pause: 70,
          highlight: true,
          sub: 'Y recibe la confirmación por WhatsApp.',
        },
      ],
    }),

    // ESCENA 4 — Local: el pedido llega al teléfono del encargado por WhatsApp
    whatsappChat({
      title: 'Café Aurora Chatbot',
      statusTime: '10:24',
      time: '10:24',
      perspective: TELEFONO,
      enter: 'left',
      script: [{from: 'bot', text: avisoLocal, footer: AUTO, cta: 'Ver pedido', cta2: 'Hablar con cliente', zoom: true, typing: 10, pause: 96, sub: 'Tú recibes el pedido en tu teléfono…'}],
    }),

    // ESCENA 5 — Local: el mismo pedido en el iPad de la barra (vista de pedidos)
    tabletOrders({
      storeName: 'Café Aurora',
      clock: '10:24',
      perspective: IPAD,
      queue: [
        {number: '#87', customer: 'Sofía G.', items: 2, time: '10:18', status: 'prep'},
        {number: '#86', customer: 'Luis R.', items: 3, time: '10:12', status: 'prep'},
        {number: '#85', customer: 'Diego P.', items: 1, time: '10:05', status: 'ready'},
      ],
      order: {number: '#88', customer: 'Andrea M.', time: '10:24', ready: LISTO, lines: pedidas, payment: 'Apple Pay'},
      subtitles: {open: '…o en un iPad en tu barra.', arrive: 'Cada pedido nuevo llega con aviso…', detail: '…ya pagado y listo para preparar.'},
    }),
  ],

  addons: {
    kicker: 'Y PARA TU CAFETERÍA',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Sellos digitales: el décimo café va por tu cuenta.'},
      {icon: '📣', title: 'Promociones y campañas', desc: 'Avisa del pan recién salido o de tu bebida de temporada.'},
      {icon: '🔔', title: 'Recordatorios automáticos', desc: 'Un mensaje para que vuelvan por su café de siempre.'},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay). No va en el repo: public/musica/sunset-groove.mp3
  music: {src: 'musica/sunset-groove.mp3', volume: 0.14, startAt: 0.25},

  // Voz en off: Eric (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   NODE_USE_ENV_PROXY=1 node scripts/narrate.mjs src/videos/demos/cafe-aurora/narracion.json public/narracion/cafe-aurora [--only 2,4]
  // Escenas: 0 entrada · 1 cliente WhatsApp · 2 cliente menú y pago · 3 cliente confirmación · 4 teléfono del local · 5 iPad
  narration: {
    clips: [
      {src: 'narracion/cafe-aurora/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/cafe-aurora/02.mp3', anchor: 0, offset: 0.5},
      {src: 'narracion/cafe-aurora/03.mp3', anchor: {scene: 1, mark: 'turn1'}, offset: 0.2},
      {src: 'narracion/cafe-aurora/04.mp3', anchor: {scene: 2, mark: 'menu'}, offset: 0.5},
      {src: 'narracion/cafe-aurora/05.mp3', anchor: {scene: 2, mark: 'checkout'}, offset: 0.3},
      {src: 'narracion/cafe-aurora/06.mp3', anchor: {scene: 2, mark: 'applePay'}, offset: 0.8},
      {src: 'narracion/cafe-aurora/07.mp3', anchor: {scene: 3, mark: 'turn0'}, offset: 0.3},
      {src: 'narracion/cafe-aurora/08.mp3', anchor: {scene: 4, mark: 'turn0'}, offset: 0.4},
      {src: 'narracion/cafe-aurora/09.mp3', anchor: {scene: 5, mark: 'open'}, offset: 0.4},
      {src: 'narracion/cafe-aurora/10.mp3', anchor: 'addons', offset: 0.5},
      {src: 'narracion/cafe-aurora/11.mp3', anchor: 'outro', offset: 0.4},
    ],
  },

  cover: {useOutro: true},

  outro: {
    tagline: ['Pedidos para recoger', 'por WhatsApp.'],
    cta: 'Agendemos una llamada',
  },
};
