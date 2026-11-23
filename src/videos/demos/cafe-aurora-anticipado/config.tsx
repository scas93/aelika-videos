import {Perspective, VideoConfig} from '../../../core/types';
import {orderPanelReview} from '../../../scenes/order-panel';
import {pickupStorefront} from '../../../scenes/storefront/pickup';
import {pickupPay} from '../../../scenes/storefront/pickup-pay';
import {tabletOrders} from '../../../scenes/tablet-orders';
import {HistoryMsg, whatsappChat} from '../../../scenes/whatsapp';

/**
 * Café Aurora · PEDIDO ANTICIPADO con confirmación de hora (flujo de Karmele, cafetería genérica).
 * 1. WhatsApp: menú corto → link al storefront con el teléfono ya cargado.
 * 2. Storefront: pedido para una junta, nombre, día y hora → se envía como SOLICITUD, sin cobro.
 * 3. La encargada recibe el aviso y la revisa en el panel (teléfono o tablet): propone otra hora.
 * 4. El cliente acepta en el link y elige cómo pagar (en tienda, tarjeta o Apple Pay) → Apple Pay.
 * 5. El pedido pagado aparece en la tablet de la barra.
 * Marca ficticia y fotos de Café Aurora (Banetto); la voz no dice el nombre del negocio.
 */
const A = (f: string) => `cafe-aurora/${f}`;

const CLIENTE: Perspective = {label: 'TU CLIENTE', sub: 'desde su celular', icon: 'person'};
const ENCARGADA: Perspective = {label: 'TU CAFETERÍA', sub: 'tu encargada, desde su teléfono', icon: 'store', color: '#0b8cf3'};
const IPAD: Perspective = {label: 'TU CAFETERÍA', sub: 'en la tablet de la barra', icon: 'store', color: '#0b8cf3'};

const URL = 'pide.aelika.com/cafe-aurora';
const DIRECCION = 'Av. Chapultepec 120, Americana';
const AUTO = 'Mensaje automático de Aelika';
const tarjeta = {image: A('latte.jpg'), footer: URL, button: 'Hacer mi pedido'};
const tarjetaTexto = '*¡Va!* ☕\nArma tu pedido y elige cuándo pasas por él. Tu número ya está cargado.';
const recibido = 'Recibimos tu solicitud #91 ☕ Confirmamos la hora y te mandamos el link de pago por aquí.';
const items = [
  {name: 'Latte', price: 65, photo: A('latte.jpg'), qty: 4},
  {name: 'Americano', price: 50, photo: A('americano.jpg'), qty: 2},
  {name: 'Croissant', price: 48, photo: A('croissant.jpg'), qty: 4},
  {name: 'Rol de canela', price: 55, photo: A('rol-canela.jpg')},
  {name: 'Chocolatín', price: 52, photo: A('chocolatin.jpg'), qty: 4},
  {name: 'Galleta red velvet', price: 38, photo: A('galleta.jpg')},
  {name: 'Frappé moka', price: 85, photo: A('frappe.jpg')},
  {name: 'Alfajor de chocolate', price: 35, photo: A('alfajor.jpg')},
];
const pedidas = items.filter((i) => i.qty).map((i) => ({qty: i.qty!, name: i.name, price: i.price, photo: i.photo}));
const total = pedidas.reduce((a, i) => a + i.qty * i.price, 0); // $760
const avisoNuevo = `🔔 *Nueva solicitud #91* de Andrea M. para recoger el miércoles 25 nov a las 8:00 a. m. ($${total}.00). Revísala en el panel para confirmar la hora.`;
const propuesta = 'Para tu solicitud #91 no alcanzamos a tenerla a las 8:00 a. m. y te proponemos recogerla el *miércoles 25 a las 8:30 a. m.*\nAcepta para pasar al pago, o recházala:';

const historialCliente: HistoryMsg[] = [
  {from: 'bot', text: tarjetaTexto, card: tarjeta, time: '10:21'},
  {from: 'bot', text: recibido, time: '10:24'},
];

export const cafeAuroraAnticipado: VideoConfig = {
  id: 'CafeAuroraAnticipado',

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
    // ESCENA 0 — Cliente: WhatsApp con menú corto → link para pedir
    whatsappChat({
      title: 'Café Aurora',
      statusTime: '10:21',
      time: '10:21',
      notice: true,
      perspective: CLIENTE,
      script: [
        {from: 'user', text: 'hola! quiero encargar para una junta', sub: 'Tu cliente te escribe por WhatsApp…'},
        {
          from: 'bot',
          text: '¡Hola! Bienvenido a Café Aurora ☕ ¿Qué te gustaría hacer?',
          menu: {items: ['Hacer un pedido', 'Ver menú', 'Ubicación y horarios']},
          sub: 'Tu asistente le responde al instante.',
          pause: 40,
          tapMenu: 0,
        },
        {from: 'bot', text: tarjetaTexto, card: tarjeta, tap: true, zoom: true, typing: 18, sub: 'Y le manda el link para pedir, con su número ya cargado.'},
      ],
    }),

    // ESCENA 1 — Cliente: arma el pedido, pone su nombre, día y hora → solicitud sin cobro
    pickupStorefront({
      url: URL,
      title: 'Café Aurora',
      categories: ['Café', 'Pan dulce', 'Galletas', 'Fríos'],
      items,
      customer: {name: 'Andrea Medina', phone: '33 9876 5432'},
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
      slots: [['7:30'], ['8:00'], ['8:30'], ['9:00'], ['9:30'], ['10:00'], ['10:30'], ['11:00'], ['11:30']],
      pickSlot: 1,
      scheduleNote: 'Para pedidos grandes, pide con un día de anticipación. Te confirmamos la hora por WhatsApp.',
      orderNumber: '#91',
      from: 'Café Aurora',
      payNote: '💳 No se cobra nada todavía: confirmamos la hora y te mandamos por WhatsApp el link para pagar.',
      sendLabel: 'Enviar solicitud',
      sentTitle: '¡Solicitud enviada!',
      sentPill: 'Solicitud #91 · Por confirmar',
      sentNote: 'Revisamos que tu pedido esté listo el miércoles 25 a las 8:00 y te mandamos por WhatsApp el link de pago.',
      sentBanner: recibido,
      statusTime: '10:22',
      subtitles: {
        menu: 'Arma su pedido para una junta.',
        cart: 'Revisa lo que va a llevar.',
        data: 'Pone su nombre: el teléfono ya viene de WhatsApp.',
        schedule: 'Elige el día y la hora para recogerlo.',
        summary: 'Envía su solicitud, sin cobro todavía.',
        sent: 'Queda por confirmar.',
      },
    }),

    // ESCENA 2 — Encargada: le llega el aviso de la solicitud y la abre en el panel
    whatsappChat({
      title: 'Café Aurora Chatbot',
      statusTime: '10:24',
      time: '10:24',
      perspective: ENCARGADA,
      enter: 'left',
      script: [{from: 'bot', text: avisoNuevo, footer: AUTO, cta: 'Ver pedido', cta2: 'Hablar con cliente', tapCta: true, zoom: true, typing: 10, pause: 80, sub: 'Tu encargada recibe el aviso de la solicitud.'}],
    }),

    // ESCENA 3 — Encargada, en el panel: Por confirmar → propone otra hora
    orderPanelReview({
      orderNumber: '#91',
      customer: {name: 'Andrea Medina', phone: '33 9876 5432'},
      date: 'Mié 25 nov',
      time: '8:00 a. m.',
      items: pedidas,
      statusTime: '10:25',
      perspective: ENCARGADA,
      proposeDays: ['Mié 25', 'Jue 26', 'Vie 27'],
      pickProposeDay: 0,
      proposeSlots: ['8:30', '9:00', '9:30', '10:00'],
      pickProposeSlot: 0,
      proposedTime: '8:30 a. m.',
      subtitles: {
        open: 'La revisa en el panel: en su teléfono o en la tablet.',
        kitchen: 'Consulta con cocina si alcanzan a esa hora…',
        propose: '…y como no, propone otra hora.',
        sent: 'Aelika le manda la propuesta al cliente por WhatsApp.',
      },
    }),

    // ESCENA 4 — Cliente: recibe la propuesta con el link para aceptar o rechazar
    whatsappChat({
      title: 'Café Aurora',
      statusTime: '10:27',
      time: '10:27',
      history: historialCliente,
      perspective: CLIENTE,
      enter: 'left',
      script: [{from: 'bot', text: propuesta, cta: 'Ver propuesta', tapCta: true, zoom: true, typing: 12, pause: 60, sub: 'Tu cliente recibe la propuesta por WhatsApp.'}],
    }),

    // ESCENA 5 — Cliente: acepta, elige cómo pagar (en tienda, tarjeta o Apple Pay) y paga con Apple Pay
    pickupPay({
      url: URL,
      title: 'Café Aurora',
      orderNumber: '#91',
      items: pedidas,
      address: DIRECCION,
      agreed: 'Mié 25 nov · 8:30 a. m.',
      proposal: {requested: 'Mié 25 nov · 8:00 a. m.'},
      card: {number: '', exp: '', cvc: ''},
      method: 'applePay',
      doneNote: 'Te esperamos el miércoles 25 a las 8:30 a. m. en Av. Chapultepec 120.',
      banner: 'Pedido #91 confirmado ✅ Te esperamos el mié 25 a las 8:30 a. m. ☕',
      statusTime: '10:28',
      subtitles: {
        proposal: 'Ve la nueva hora y la acepta con un toque.',
        pay: 'Paga en tienda, con tarjeta o con Apple Pay.',
        done: 'Pagado: el pedido queda confirmado.',
      },
    }),

    // ESCENA 6 — Local: el pedido confirmado y pagado aparece en la tablet de la barra
    tabletOrders({
      storeName: 'Café Aurora',
      clock: '10:28',
      perspective: IPAD,
      queue: [
        {number: '#90', customer: 'Sofía G.', items: 2, time: '10:18', status: 'prep'},
        {number: '#89', customer: 'Luis R.', items: 3, time: '10:12', status: 'prep'},
        {number: '#88', customer: 'Diego P.', items: 1, time: '10:05', status: 'ready'},
      ],
      order: {
        number: '#91',
        customer: 'Andrea M.',
        time: '10:28',
        delivery: 'Pedido anticipado · para recoger',
        readyLabel: 'Recoge',
        ready: 'Mié 25 · 8:30',
        lines: pedidas,
        payment: 'Apple Pay',
      },
      subtitles: {open: 'Y en la tablet de tu barra…', arrive: '…el pedido llega confirmado…', detail: '…ya pagado y con su hora de recolección.'},
    }),
  ],

  addons: {
    kicker: 'Y PARA TU CAFETERÍA',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '🔔', title: 'Recordatorios automáticos', desc: 'Un aviso por WhatsApp antes de que pasen por su pedido.'},
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Sellos digitales: el décimo café va por tu cuenta.'},
      {icon: '📣', title: 'Promociones y campañas', desc: 'Ofrece paquetes para juntas y eventos a tus clientes.'},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay). No va en el repo: public/musica/sunset-groove.mp3
  music: {src: 'musica/sunset-groove.mp3', volume: 0.14, startAt: 0.25},

  // Voz en off: Eric (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   NODE_USE_ENV_PROXY=1 node scripts/narrate.mjs src/videos/demos/cafe-aurora-anticipado/narracion.json public/narracion/cafe-aurora-anticipado [--only 2,4]
  // Escenas: 0 cliente WhatsApp · 1 cliente solicitud · 2 encargada aviso · 3 encargada panel · 4 cliente propuesta ·
  //          5 cliente acepta y paga · 6 tablet de la barra
  narration: {
    clips: [
      {src: 'narracion/cafe-aurora-anticipado/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/cafe-aurora-anticipado/02.mp3', anchor: {scene: 0, mark: 'turn0'}, offset: 0.3},
      {src: 'narracion/cafe-aurora-anticipado/03.mp3', anchor: {scene: 1, mark: 'menu'}, offset: 0.8},
      {src: 'narracion/cafe-aurora-anticipado/04.mp3', anchor: {scene: 1, mark: 'data'}, offset: 0.4},
      {src: 'narracion/cafe-aurora-anticipado/05.mp3', anchor: {scene: 1, mark: 'summary'}, offset: 0.3},
      {src: 'narracion/cafe-aurora-anticipado/06.mp3', anchor: {scene: 2, mark: 'turn0'}, offset: 0.4},
      {src: 'narracion/cafe-aurora-anticipado/07.mp3', anchor: {scene: 3, mark: 'propose'}, offset: -0.5},
      {src: 'narracion/cafe-aurora-anticipado/08.mp3', anchor: {scene: 4, mark: 'turn0'}, offset: 0.3},
      {src: 'narracion/cafe-aurora-anticipado/09.mp3', anchor: {scene: 5, mark: 'pay'}, offset: 0.2},
      {src: 'narracion/cafe-aurora-anticipado/10.mp3', anchor: {scene: 6, mark: 'open'}, offset: 0.4},
      {src: 'narracion/cafe-aurora-anticipado/11.mp3', anchor: 'addons', offset: 0.5},
      {src: 'narracion/cafe-aurora-anticipado/12.mp3', anchor: 'outro', offset: 0.4},
    ],
  },

  cover: {useOutro: true},

  outro: {
    tagline: ['Pedidos, confirmaciones y pagos', 'por WhatsApp.'],
    cta: 'Agendemos una llamada',
  },
};
