import {VideoConfig} from '../../core/types';
import {entryPoints} from '../../scenes/entry-points';
import {ordersStorefront} from '../../scenes/storefront/orders';
import {whatsappChat} from '../../scenes/whatsapp';

// Fotos y logo en public/lacarniceria-lira/ (créditos en public/lacarniceria-lira/CREDITOS.md)
const A = (f: string) => `lacarniceria-lira/${f}`;

export const lacarniceriaLira: VideoConfig = {
  id: 'LaCarniceriaLira',

  brand: {
    name: 'La Carnicería Lira',
    logo: A('logo.png'),
    // carbón y brasa, tomados del logo
    colors: {
      dark: '#1a1512',
      dark2: '#241d19',
      dark3: '#30261f',
      accent: '#c4511f',
      accentLight: '#e88a52',
      accentDark: '#8c3512',
      light: '#f4ece3',
      paper: '#f8f4ef',
      line: '#e8ddd2',
      muted: '#8b7d70',
    },
    displayFont: '"Playfair Display", Georgia, serif',
  },

  scenes: [
    // ESCENA 0 — Llegan de donde sea (Maps, Instagram, Facebook, su web) y todo empieza en WhatsApp
    entryPoints({
      channels: ['maps', 'instagram', 'facebook', 'web'],
      name: 'La Carnicería Lira',
      handle: 'lacarniceria_1',
      category: 'Restaurante',
      rating: '4.7',
      reviews: '312',
      web: 'lacarnicerialira.com',
      time: '12:38',
      dateLabel: 'sábado, 21 de noviembre',
      copy: {webTitle: 'LA CARNICERÍA', webTagline: '¿Antojo de una carne asada?', webButton: 'Pide aquí', fbFollowers: '1.8 mil'},
      subtitles: ['Tus clientes te encuentran donde sea…', '…y todo empieza en tu WhatsApp.'],
    }),

    // ESCENA 1 — WhatsApp: menú del asistente y link al pedido
    whatsappChat({
      title: 'La Carnicería Lira',
      statusTime: '12:39',
      time: '12:39',
      notice: true,
      script: [
        {from: 'user', text: 'Hola', sub: '…y te escriben directo a tu WhatsApp.'},
        {
          from: 'bot',
          text: '¡Hola! 🔥 Bienvenido a *La Carnicería Lira*. Elige una opción:',
          menu: {items: ['Hacer un pedido', 'Ver el menú', 'Reservar mesa', 'Horarios y ubicación']},
          sub: 'Tu asistente les responde al instante.',
          pause: 40,
          tapMenu: 0,
        },
        {
          from: 'bot',
          text: '*¡Va! 🥩*\nArma tu pedido: cortes finos a domicilio con Uber o para recoger en 20 min.',
          card: {image: A('portada.jpg'), footer: 'pedidos.lacarnicerialira.com', button: 'Hacer mi pedido'},
          tap: true,
          zoom: true,
          typing: 18,
          sub: 'Y los manda directo a tu menú.',
        },
      ],
    }),

    // ESCENA 2 — Storefront de pedidos: carne asada a domicilio con Uber
    ordersStorefront({
      url: 'pedidos.lacarnicerialira.com',
      coverPhoto: A('portada.jpg'),
      title: 'La Carnicería Lira',
      subtitle: 'Cortes finos · Parrilla · Guadalajara',
      categories: ['Cortes', 'Importados', 'Nacionales', 'Para la parrilla'],
      items: [
        {name: 'Rib Eye', detail: 'Importado · 300 g', price: 435, photo: A('ribeye.jpg'), qty: 2},
        {name: 'New York', detail: 'Importado · 300 g', price: 435, photo: A('newyork.jpg')},
        {name: 'Picaña', detail: 'Importado · 300 g', price: 435, photo: A('picana.jpg'), qty: 2},
        {name: 'Arrachera', detail: 'Nacional · 300 g', price: 390, photo: A('arrachera.jpg'), qty: 3},
        {name: 'Vacío', detail: 'Importado · 300 g', price: 472, photo: A('vacio.jpg')},
        {name: 'Entraña', detail: 'Importada · 700 g', price: 945, photo: A('entrana.jpg')},
        {name: 'Tomahawk', detail: 'Importado · 1.2 kg', price: 1600, photo: A('tomahawk.jpg'), qty: 1},
      ],
      customer: 'Carlos',
      cartNote: '3.3 kg para tu carne asada 🔥',
      delivery: {address: 'Av. Patria 1891, Zapopan', uberPrice: 89, uberEta: '35–45 min', arrival: '1:35 p. m.'},
      pickup: {address: 'Av. Circunvalación 1205', ready: '20 min'},
      orderNumber: '#1042',
      from: 'La Carnicería Lira',
      statusTime: '12:40',
      subtitles: {
        menu: 'Su propio menú en línea, con fotos y precios.',
        add: 'Arman su carne asada en unos cuantos toques.',
        cart: 'Revisan su pedido.',
        delivery: 'Eligen a domicilio o para recoger en 20 minutos.',
        quote: 'Uber cotiza el envío al momento: precio y tiempo.',
        pay: 'Ven carne y envío por separado, y pagan todo junto.',
        done: 'Listo: pedido confirmado por WhatsApp.',
      },
    }),
  ],

  addons: {
    kicker: 'Y PARA TU RESTAURANTE',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '📅', title: 'Reservaciones', desc: 'Tus clientes apartan mesa desde WhatsApp, sin llamadas.'},
      {icon: '📣', title: 'Promociones', desc: 'Lanza el combo del fin de semana a todos tus clientes en un clic.'},
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Puntos y recompensas que hacen volver a tus clientes.'},
      {icon: '🎉', title: 'Pedidos para eventos', desc: 'Cotiza y cobra pedidos grandes con anticipo.'},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay), la misma de Detona. No va en el repo:
  // descárgala y guárdala como public/musica/sunset-groove.mp3
  music: {src: 'musica/sunset-groove.mp3', volume: 0.14, startAt: 0.25},

  // Voz en off: Eric (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   node scripts/narrate.mjs src/videos/lacarniceria-lira/narracion.json public/narracion/lacarniceria-lira
  // Escenas: 0 = puntos de entrada, 1 = WhatsApp, 2 = storefront. Las frases del storefront se anclan a sus marcas.
  narration: {
    clips: [
      {src: 'narracion/lacarniceria-lira/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/lacarniceria-lira/02.mp3', anchor: 0, offset: 0.3},
      {src: 'narracion/lacarniceria-lira/03.mp3', anchor: 1, offset: 1.1},
      {src: 'narracion/lacarniceria-lira/04.mp3', anchor: {scene: 2, mark: 'menu'}, offset: 0.3},
      {src: 'narracion/lacarniceria-lira/05.mp3', anchor: {scene: 2, mark: 'cart'}, offset: -1.1},
      {src: 'narracion/lacarniceria-lira/06.mp3', anchor: {scene: 2, mark: 'delivery'}, offset: 0.2},
      {src: 'narracion/lacarniceria-lira/07.mp3', anchor: {scene: 2, mark: 'pay'}, offset: 0.9},
      {src: 'narracion/lacarniceria-lira/08.mp3', anchor: {scene: 2, mark: 'done'}, offset: 0.23},
      {src: 'narracion/lacarniceria-lira/09.mp3', anchor: 'addons', offset: 0.5},
      {src: 'narracion/lacarniceria-lira/10.mp3', anchor: 'outro', offset: 0.4},
    ],
  },

  cover: {useOutro: true},

  outro: {
    tagline: ['Pedidos, envíos con Uber y pagos', 'para tu restaurante.'],
    cta: 'Agendemos una llamada',
  },
};
