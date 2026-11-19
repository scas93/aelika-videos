import {VideoConfig} from '../../core/types';
import {entryPoints} from '../../scenes/entry-points';
import {classesStorefront} from '../../scenes/storefront/classes';
import {whatsappChat} from '../../scenes/whatsapp';

/**
 * Video GENÉRICO para el giro fitness (estudios boutique, gimnasios, boxes…).
 * "Pulso Studio" es una marca ficticia. La narración no menciona el nombre del negocio,
 * así que para personalizarlo a un prospecto basta con copiar este archivo y cambiar
 * `brand`, las fotos, las clases y los coaches: el audio se reutiliza tal cual.
 */
const A = (f: string) => `pulso-studio/${f}`;

export const pulsoStudio: VideoConfig = {
  id: 'PulsoStudio',

  brand: {
    name: 'Pulso Studio',
    logo: A('logo.png'),
    colors: {
      dark: '#141416',
      dark2: '#1e1e22',
      dark3: '#2a2a30',
      accent: '#ff5a36',
      accentLight: '#ff9a80',
      accentDark: '#c23a1c',
      light: '#f3f1ee',
      paper: '#f7f6f3',
      line: '#e6e3de',
      muted: '#8a8680',
    },
    displayFont: 'Inter, sans-serif',
  },

  scenes: [
    // ESCENA 0 — Llegan de donde sea (Maps, Instagram, web, QR) y todo empieza en WhatsApp
    entryPoints({
      name: 'Pulso Studio',
      handle: 'pulso.studio',
      category: 'Estudio de fitness',
      rating: '4.9',
      reviews: '214',
      web: 'pulsostudio.mx',
      time: '10:14',
      dateLabel: 'jueves, 19 de noviembre',
      copy: {webTitle: 'PULSO', webTagline: 'Tu primera clase te espera', webButton: 'Escríbenos', qrTitle: 'Escanea para reservar', qrWhere: 'en recepción', labels: {qr: 'QR EN RECEPCIÓN'}},
      subtitles: ['Tus clientes llegan de donde sea…', '…y todo empieza en tu WhatsApp.'],
    }),

    // ESCENA 1 — WhatsApp: menú y preguntas frecuentes
    whatsappChat({
      title: 'Pulso Studio',
      statusTime: '10:14',
      time: '10:14',
      notice: true,
      script: [
        {from: 'user', text: 'Hola', sub: '…y te escriben directo a tu WhatsApp.'},
        {
          from: 'bot',
          text: '¡Hola! 👋 Te damos la bienvenida a *Pulso Studio*. Elige una opción para continuar:',
          menu: {
            items: ['Reservar clase', 'Horarios', 'Paquetes y precios', 'Ubicación'],
            note: 'Si prefieres atención personalizada, escribe la palabra "asesor" y con gusto te atendemos.',
          },
          sub: 'Tu asistente les responde al instante.',
          pause: 50,
          tapMenu: 1,
        },
        {
          from: 'bot',
          text: 'Tenemos clases de lunes a viernes de 06:00 a 21:00 y sábados de 08:00 a 13:00 🕘',
          sub: 'Resuelve sus dudas sin que tú contestes.',
          buttons: ['Reservar clase', 'Ver paquetes'],
          tapButton: 0,
          pause: 34,
        },
        {
          from: 'bot',
          text: '*¡Perfecto! 💪*\nReserva en menos de un minuto: elige tu clase, tu horario y tu coach.',
          card: {image: A('photo-studio.jpg'), footer: 'reservas.pulsostudio.mx', button: 'Reservar mi clase'},
          tap: true,
          zoom: true,
          typing: 18,
          sub: 'Y los manda directo a reservar.',
        },
      ],
    }),

    // ESCENAS 2–8 — Storefront de clases
    classesStorefront({
      url: 'reservas.pulsostudio.mx',
      coverPhoto: A('photo-studio.jpg'),
      classPhoto: A('photo-class.jpg'),
      title: 'PULSO',
      subtitle: 'Studio · Fitness y bienestar',
      days: [
        ['HOY', '19'],
        ['VIE', '20'],
        ['SÁB', '21'],
        ['LUN', '23'],
        ['MAR', '24'],
      ],
      pickDay: 1,
      today: [
        {time: '18:00', name: 'Cycling', coach: 'Ana', spots: 6},
        {time: '19:05', name: 'Yoga Flow', coach: 'Sofía', spots: 3},
        {time: '20:10', name: 'Box Fit', coach: 'Diego', spots: 1},
      ],
      classes: [
        {time: '06:00', name: 'Funcional', coach: 'Diego', spots: 4, tags: ['Funcional']},
        {time: '07:05', name: 'Cycling', coach: 'Ana', spots: 2, tags: ['Cycling']},
        {time: '08:10', name: 'Yoga Flow', coach: 'Sofía', spots: 7},
        {time: '18:00', name: 'Funcional HIIT', coach: 'Ana', spots: 5, tags: ['Funcional']},
        {time: '19:05', name: 'Cycling', coach: 'Diego', spots: 0, tags: ['Cycling']},
      ],
      filters: ['Todas', 'Funcional', 'Cycling', 'Diego', 'Ana'],
      pickFilter: 1,
      pickClass: 0,
      detail: {
        duration: '50 min',
        level: 'Todos los niveles',
        focus: 'Fuerza',
        description: 'Fuerza y cardio con pesas, kettlebells y tu propio peso. Sales con energía para todo el día.',
        dayLong: 'Vie 20 nov',
        coachRole: 'Coach',
      },
      customer: {name: 'Andrea López', phone: '33 1987 6543', code: '4827'},
      codeFrom: 'Pulso Studio',
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
          {title: 'Clase suelta', sub: 'Solo esta clase', price: '$180'},
          {title: 'Paquete 5 clases', sub: '$160 por clase', price: '$800', badge: 'MÁS POPULAR'},
          {title: 'Paquete 10 clases', sub: '$145 por clase · vigencia 60 días', price: '$1,450'},
          {title: 'Mensualidad ilimitada', sub: 'Todas las clases que quieras por 30 días', price: '$1,890'},
        ],
        pick: 2,
        remainingAfter: 'Te quedan 4 clases en tu paquete',
      },
    }),
  ],

  addons: {
    kicker: 'Y PARA TU NEGOCIO',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '🔔', title: 'Recordatorios automáticos', desc: 'Confirmación y recordatorio de cada clase por WhatsApp, sin que muevas un dedo.'},
      {icon: '📣', title: 'Campañas y promociones', desc: 'Lanza descuentos, clases especiales y eventos a tus clientes en un clic.'},
      {icon: '👥', title: 'Notificaciones para tu equipo', desc: 'Cada coach recibe sus clases del día y avisos de cambios.'},
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Sellos y recompensas que hacen volver a tus clientes.'},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay), la misma de Detona. No va en el repo:
  // descárgala y guárdala como public/musica/sunset-groove.mp3
  music: {src: 'musica/sunset-groove.mp3', volume: 0.14, startAt: 0.25},

  // Voz en off: Sarah (ElevenLabs). Guion en ./narracion.json; se regenera con
  //   node scripts/narrate.mjs src/videos/pulso-studio/narracion.json public/narracion/pulso-studio
  // Escenas: 0 = puntos de entrada, 1 = WhatsApp, 2 = storefront (mismos tiempos que Detona)
  narration: {
    clips: [
      {src: 'narracion/pulso-studio/01.mp3', anchor: 'intro', offset: 0.4},
      {src: 'narracion/pulso-studio/02.mp3', anchor: 0, offset: 0.3},
      {src: 'narracion/pulso-studio/03.mp3', anchor: 1, offset: 1.1},
      {src: 'narracion/pulso-studio/04.mp3', anchor: 2, offset: 0.3},
      {src: 'narracion/pulso-studio/05.mp3', anchor: 2, offset: 11.9},
      {src: 'narracion/pulso-studio/06.mp3', anchor: 2, offset: 23.2},
      {src: 'narracion/pulso-studio/07.mp3', anchor: 2, offset: 30.7},
      {src: 'narracion/pulso-studio/08.mp3', anchor: 'addons', offset: 0.7},
      {src: 'narracion/pulso-studio/09.mp3', anchor: 'outro', offset: 0.4},
    ],
  },

  cover: {useOutro: true},

  outro: {
    tagline: ['Reservas, paquetes y recordatorios', 'para tu estudio o gimnasio.'],
    cta: 'Agendemos una llamada',
  },
};
