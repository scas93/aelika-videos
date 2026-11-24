import {Perspective, VideoConfig} from '../../../core/types';
import {classFullPanel, weekClassesTablet, WeekClass} from '../../../scenes/class-panel';
import {entryPoints} from '../../../scenes/entry-points';
import {classesStorefront} from '../../../scenes/storefront/classes';
import {whatsappChat} from '../../../scenes/whatsapp';

/**
 * Fuerza Gym · demo GENÉRICA de gimnasio (marca ficticia). Dos perspectivas:
 * 1. Cliente: llega de Maps/Instagram/Facebook/QR → WhatsApp → reserva el ÚLTIMO lugar de Spinning (7:15) y paga su paquete.
 * 2. Gimnasio (sin WhatsApp, todo en el panel de Aelika): en el teléfono llega la notificación "¡Clase llena!" →
 *    detalle de la clase → en la tablet, "Clases de la semana" en vista de calendario (coach y asistencia).
 * La voz no dice el nombre del negocio: se puede reutilizar al personalizar.
 */
const A = (f: string) => `fuerza-gym/${f}`;

const CLIENTE: Perspective = {label: 'TU CLIENTE', sub: 'desde su celular', icon: 'person'};
const GYM_TEL: Perspective = {label: 'TU GIMNASIO', sub: 'en el panel de Aelika, desde tu teléfono', icon: 'store', color: '#0b8cf3'};
const GYM_TAB: Perspective = {label: 'TU GIMNASIO', sub: 'en el panel de Aelika, desde la tablet', icon: 'store', color: '#0b8cf3'};

const URL = 'reservas.fuerzagym.mx';

// Semana en el calendario de la tablet: 5 horarios de 1 h 15 min (3 en la mañana, 2 en la tarde)
const SEMANA: WeekClass[] = [
  // [día, horario, clase, coach, reservados]
  ...([
    [0, 0, 'Funcional', 'Diego', 6], [0, 1, 'Spinning', 'Carla', 8], [0, 2, 'HIIT', 'Mauricio', 4], [0, 3, 'Box', 'Diego', 7], [0, 4, 'Spinning', 'Mauricio', 5],
    [1, 0, 'Funcional', 'Diego', 5], [1, 1, 'Yoga', 'Sofía', 3], [1, 2, 'HIIT', 'Mauricio', 6], [1, 3, 'Funcional', 'Carla', 8], [1, 4, 'HIIT', 'Carla', 6],
    [2, 0, 'Funcional', 'Diego', 5], [2, 1, 'Spinning', 'Carla', 8], [2, 2, 'HIIT', 'Mauricio', 3], [2, 3, 'Box', 'Diego', 2], [2, 4, 'Spinning', 'Mauricio', 4],
    [3, 0, 'Funcional', 'Diego', 4], [3, 1, 'Yoga', 'Sofía', 5], [3, 2, 'HIIT', 'Mauricio', 2], [3, 3, 'Funcional', 'Carla', 6], [3, 4, 'Box', 'Diego', 3],
    [4, 0, 'Funcional', 'Diego', 3], [4, 1, 'Spinning', 'Carla', 6], [4, 2, 'HIIT', 'Mauricio', 2], [4, 3, 'Box', 'Diego', 5], [4, 4, 'Spinning', 'Mauricio', 2],
    [5, 0, 'Spinning', 'Carla', 4], [5, 1, 'Funcional', 'Diego', 5], [5, 2, 'Yoga', 'Sofía', 2],
  ] as [number, number, string, string, number][]).map(([day, slot, name, coach, booked]) => ({day, slot, name, coach, booked, capacity: 8})),
];

export const fuerzaGym: VideoConfig = {
  id: 'FuerzaGym',

  brand: {
    name: 'Fuerza Gym',
    logo: A('logo.png'),
    colors: {
      dark: '#121417',
      dark2: '#1b1e22',
      dark3: '#262a30',
      accent: '#7cb518',
      accentLight: '#dff7a8',
      accentDark: '#4d7a06',
      light: '#f2f3ee',
      paper: '#f7f8f4',
      line: '#e3e5de',
      muted: '#7d8278',
    },
    displayFont: 'Inter, sans-serif',
    canvas: 'light',
  },

  // Intro más largo para que quepa la primera frase de la voz
  intro: {len: 200},

  scenes: [
    // ESCENA 0 — Llegan de donde sea (Maps, Instagram, Facebook, QR) y todo empieza en WhatsApp
    entryPoints({
      channels: ['maps', 'instagram', 'facebook', 'qr'],
      name: 'Fuerza Gym',
      handle: 'fuerza.gym',
      category: 'Gimnasio',
      rating: '4.8',
      reviews: '312',
      time: '10:12',
      dateLabel: 'martes, 24 de noviembre',
      copy: {qrTitle: 'Escanea para reservar', qrWhere: 'en recepción', labels: {qr: 'QR EN RECEPCIÓN'}, fbFollowers: '5.2 mil'},
      subtitles: ['Tus clientes llegan de donde sea…', '…y todo empieza en tu WhatsApp.'],
    }),

    // ESCENA 1 — Cliente: WhatsApp con menú y preguntas frecuentes
    whatsappChat({
      title: 'Fuerza Gym',
      statusTime: '10:13',
      time: '10:13',
      notice: true,
      perspective: CLIENTE,
      script: [
        {from: 'user', text: 'Hola', sub: 'Te escriben por WhatsApp…'},
        {
          from: 'bot',
          text: '¡Hola! 💪 Bienvenido a *Fuerza Gym*. Elige una opción para continuar:',
          menu: {items: ['Reservar clase', 'Horarios', 'Paquetes y precios', 'Ubicación'], note: 'Si prefieres atención personalizada, escribe la palabra "asesor" y con gusto te atendemos.'},
          sub: 'Tu asistente les responde al instante.',
          pause: 50,
          tapMenu: 1,
        },
        {
          from: 'bot',
          text: 'Abrimos de lunes a viernes de 6:00 a 22:00 y sábados de 8:00 a 14:00. Cada clase dura 1 h 15 min 🕘',
          sub: 'Resuelve sus dudas sin que tú contestes.',
          buttons: ['Reservar clase', 'Ver paquetes'],
          tapButton: 0,
          pause: 34,
        },
        {
          from: 'bot',
          text: '*¡Va!* 🔥\nAparta tu lugar en segundos: elige tu clase, tu horario y tu coach.',
          card: {image: A('photo-gym.jpg'), footer: URL, button: 'Reservar mi clase'},
          tap: true,
          zoom: true,
          typing: 18,
          sub: 'Y los manda directo a reservar.',
        },
      ],
    }),

    // ESCENA 2 — Cliente: reserva el último lugar de Spinning (7:15) y compra su paquete
    classesStorefront({
      url: URL,
      coverPhoto: A('photo-gym.jpg'),
      classPhoto: A('photo-class.jpg'),
      title: 'FUERZA',
      subtitle: 'Gym · Fuerza, cardio y clases',
      days: [
        ['HOY', '24'],
        ['MIÉ', '25'],
        ['JUE', '26'],
        ['VIE', '27'],
        ['SÁB', '28'],
      ],
      pickDay: 1,
      today: [
        {time: '18:00', name: 'Funcional', coach: 'Diego', spots: 4},
        {time: '19:15', name: 'HIIT', coach: 'Carla', spots: 2},
        {time: '20:30', name: 'Yoga', coach: 'Sofía', spots: 6},
      ],
      classes: [
        {time: '06:00', name: 'Funcional', coach: 'Diego', spots: 3, tags: ['Funcional']},
        {time: '07:15', name: 'Spinning', coach: 'Carla', spots: 1, tags: ['Spinning']},
        {time: '08:30', name: 'HIIT', coach: 'Mauricio', spots: 5, tags: ['HIIT']},
        {time: '18:00', name: 'Box', coach: 'Diego', spots: 6},
        {time: '19:15', name: 'Spinning', coach: 'Mauricio', spots: 4, tags: ['Spinning']},
      ],
      filters: ['Todas', 'Funcional', 'Spinning', 'HIIT', 'Diego'],
      pickFilter: 2,
      pickClass: 1,
      detail: {
        duration: '1 h 15 min',
        level: 'Todos los niveles',
        focus: 'Cardio',
        description: 'Ritmo, música y resistencia sobre la bici: 75 minutos de cardio para salir con todo.',
        dayLong: 'Mié 25 nov',
        coachRole: 'Coach',
      },
      customer: {name: 'Andrea López', phone: '33 1987 6543', code: '4827'},
      codeFrom: 'Fuerza Gym',
      statusTime: '10:14',
      subtitles: {
        cover: 'Tu propia página de reservas, con tu marca.',
        schedule: 'Ven clases y lugares disponibles en tiempo real.',
        filter: 'Filtran por tipo de clase o coach.',
        detail: 'Conocen la clase antes de reservar.',
        identify: 'Se identifican con su WhatsApp. Sin contraseñas.',
        pay: 'Compran su paquete y reservan en un solo paso.',
        done: 'Y les llega la confirmación por WhatsApp.',
      },
      pay: {
        options: [
          {title: 'Usar mi paquete', sub: 'No tienes un paquete activo', disabled: true},
          {title: 'Clase suelta', sub: 'Solo esta clase', price: '$150'},
          {title: 'Paquete 10 clases', sub: '$120 por clase · vigencia 60 días', price: '$1,200', badge: 'MÁS POPULAR'},
          {title: 'Mensualidad ilimitada', sub: 'Todas las clases que quieras por 30 días', price: '$1,490'},
        ],
        pick: 2,
        remainingAfter: 'Te quedan 9 clases en tu paquete',
      },
    }),

    // ESCENA 3 — Gimnasio, en el panel (teléfono): "¡Clase llena!" → detalle de la clase
    classFullPanel({
      business: 'Fuerza Gym',
      cls: {name: 'Spinning', date: 'Mié 25 nov', time: '7:15 – 8:30 a. m.', duration: '1 h 15 min', coach: 'Carla', room: 'Sala de bicis', capacity: 8},
      attendees: [
        {name: 'Andrea López', plan: 'Paquete 10', isNew: true},
        {name: 'Mariana Ruiz', plan: 'Mensualidad'},
        {name: 'Luis García', plan: 'Paquete 10'},
        {name: 'Paola Méndez', plan: 'Clase suelta'},
        {name: 'Jorge Salas', plan: 'Mensualidad'},
        {name: 'Fernanda Ortiz', plan: 'Paquete 10'},
        {name: 'Ricardo Peña', plan: 'Mensualidad'},
        {name: 'Valeria Soto', plan: 'Clase suelta'},
      ],
      waitlist: 2,
      today: [
        ['18:00', 'Funcional', 'Diego', 4, 8],
        ['19:15', 'HIIT', 'Carla', 6, 8],
      ],
      statusTime: '10:16',
      perspective: GYM_TEL,
    }),

    // ESCENA 4 — Gimnasio, en el panel (tablet): clases de la semana en calendario
    weekClassesTablet({
      business: 'Fuerza Gym',
      weekLabel: '23 – 28 de noviembre',
      days: [
        ['LUN', '23'],
        ['MAR', '24'],
        ['MIÉ', '25'],
        ['JUE', '26'],
        ['VIE', '27'],
        ['SÁB', '28'],
      ],
      today: 1,
      slots: ['6:00', '7:15', '8:30', '18:00', '19:15'],
      breakAfter: 2,
      duration: '1 h 15 min',
      classes: SEMANA,
      highlight: {day: 2, slot: 1},
      waitlist: 2,
      perspective: GYM_TAB,
      subtitles: {open: 'O desde la tablet, con tus clases de la semana…', detail: '…con su coach y su asistencia.'},
    }),
  ],

  addons: {
    kicker: 'Y PARA TU GIMNASIO',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '🔔', title: 'Recordatorios automáticos', desc: 'Confirmación y recordatorio de cada clase por WhatsApp.'},
      {icon: '📣', title: 'Campañas y promociones', desc: 'Retos, clases especiales y descuentos para todos tus clientes.'},
      {icon: '📊', title: 'Reportes automáticos', desc: 'Asistencia, ventas y paquetes, sin tener que pedirlos.'},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay). No va en el repo: public/musica/sunset-groove.mp3
  music: {src: 'musica/sunset-groove.mp3', volume: 0.14, startAt: 0.25},

  // Voz en off: Eric (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   NODE_USE_ENV_PROXY=1 node scripts/narrate.mjs src/videos/demos/fuerza-gym/narracion.json public/narracion/fuerza-gym [--only 2,4]
  // Escenas: 0 entrada · 1 cliente WhatsApp · 2 cliente reserva · 3 panel teléfono · 4 panel tablet
  narration: {
    clips: [
      {src: 'narracion/fuerza-gym/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/fuerza-gym/02.mp3', anchor: {scene: 0, mark: 'cards'}, offset: 0.4},
      {src: 'narracion/fuerza-gym/03.mp3', anchor: {scene: 1, mark: 'turn1'}, offset: 0},
      {src: 'narracion/fuerza-gym/04.mp3', anchor: {scene: 2, mark: 'cover'}, offset: 0.6},
      {src: 'narracion/fuerza-gym/05.mp3', anchor: {scene: 2, mark: 'detail'}, offset: 0.4},
      {src: 'narracion/fuerza-gym/06.mp3', anchor: {scene: 2, mark: 'pay'}, offset: 0.3},
      {src: 'narracion/fuerza-gym/07.mp3', anchor: {scene: 2, mark: 'done'}, offset: 0.3},
      {src: 'narracion/fuerza-gym/08.mp3', anchor: {scene: 3, mark: 'home'}, offset: 0.3},
      {src: 'narracion/fuerza-gym/09.mp3', anchor: {scene: 3, mark: 'detail'}, offset: 0.3},
      {src: 'narracion/fuerza-gym/10.mp3', anchor: {scene: 4, mark: 'open'}, offset: 0.3},
      {src: 'narracion/fuerza-gym/11.mp3', anchor: 'addons', offset: 0.5},
      {src: 'narracion/fuerza-gym/12.mp3', anchor: 'outro', offset: 0.6},
    ],
  },

  cover: {useOutro: true},

  outro: {
    cta: 'Agendemos una llamada',
  },
};
