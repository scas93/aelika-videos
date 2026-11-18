import {VideoConfig} from '../../core/types';
import {entryPoints} from '../../scenes/entry-points';
import {classesStorefront} from '../../scenes/storefront/classes';
import {whatsappChat} from '../../scenes/whatsapp';

// Fotos y logo en public/detona/
const A = (f: string) => `detona/${f}`;

export const detona: VideoConfig = {
  id: 'Detona',

  brand: {
    name: 'Detona',
    logo: A('logo.png'),
    colors: {
      dark: '#2e2c29',
      dark2: '#3b3935',
      dark3: '#4a4743',
      accent: '#9aa597',
      accentLight: '#c9cfc3',
      accentDark: '#6d7869',
      light: '#efeee9',
      paper: '#f7f6f2',
      line: '#e4e2dc',
      muted: '#8d8a83',
    },
    displayFont: 'Inter, sans-serif',
    canvas: 'light',
  },

  scenes: [
    // ESCENA 1 — Llegan de donde sea (Maps, Instagram, web, QR) y todo empieza en WhatsApp
    entryPoints({
      name: 'Detona Body Work',
      handle: 'detona_bodyworkout',
      category: 'Estudio de fitness',
      rating: '4.9',
      reviews: '128',
      web: 'detonabodywork.com',
      subtitles: ['Tus alumnas llegan de donde sea…', '…y todo empieza en tu WhatsApp.'],
    }),

    // ESCENA 2 — WhatsApp: menú y preguntas frecuentes
    whatsappChat({
      title: 'Detona Body Work',
      statusTime: '10:14',
      time: '10:14',
      notice: true,
      script: [
        {from: 'user', text: 'Hola', sub: '…y te escriben directo a tu WhatsApp.'},
        {
          from: 'bot',
          text: '¡Hola! Bienvenida a *Detona Body Work* 🤍 Elige una opción para continuar:',
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
          text: '*¡Perfecto! 💪*\nReserva en menos de un minuto: elige tu clase, tu horario y tu instructora.',
          card: {image: A('photo-studio.jpg'), footer: 'reservas.detonabodywork.com', button: 'Reservar mi clase'},
          tap: true,
          zoom: true,
          typing: 18,
          sub: 'Y las manda directo a reservar.',
        },
      ],
    }),

    // ESCENAS 3–9 — Storefront de clases
    classesStorefront({
      url: 'reservas.detonabodywork.com',
      coverPhoto: A('photo-studio.jpg'),
      classPhoto: A('photo-class.jpg'),
      title: 'DETONA',
      subtitle: 'Body Work · Guadalajara',
      days: [
        ['HOY', '18'],
        ['JUE', '19'],
        ['VIE', '20'],
        ['SÁB', '21'],
        ['LUN', '23'],
      ],
      pickDay: 1,
      today: [
        {time: '18:00', name: 'Burn Up', coach: 'Ines', spots: 6},
        {time: '19:05', name: 'Flow & Force', coach: 'Mayte', spots: 3},
        {time: '20:10', name: 'Barre', coach: 'Ines', spots: 1},
      ],
      classes: [
        {time: '06:00', name: 'Intensity Mat', coach: 'Mayte', spots: 4, tags: ['Full Body']},
        {time: '07:05', name: 'Sculpt & Barre (Lower)', coach: 'Ines', spots: 2, tags: ['Lower Body', 'Barre']},
        {time: '08:10', name: 'Burn Up', coach: 'Ines', spots: 7},
        {time: '18:00', name: 'Flow & Force', coach: 'Mayte', spots: 5},
        {time: '19:05', name: 'Barre', coach: 'Ines', spots: 0, tags: ['Barre']},
      ],
      filters: ['Todas', 'Mayte', 'Ines', 'Lower Body', 'Barre'],
      pickFilter: 1,
      pickClass: 0,
      detail: {
        duration: '50 min',
        level: 'Nivel intermedio',
        focus: 'Full body',
        description: 'Fuerza y cardio en mat con intervalos de alta intensidad. Sales fuerte, sudada y con energía para todo el día.',
        dayLong: 'Jue 19 nov',
      },
      customer: {name: 'Valeria Gómez', phone: '33 1987 6543', code: '4827'},
      codeFrom: 'Detona Body Work',
      subtitles: {
        cover: 'Tu propia página de reservas, con tu marca.',
        schedule: 'Ven clases y lugares disponibles en tiempo real.',
        filter: 'Filtran por clase o instructora.',
        detail: 'Conocen la clase antes de reservar.',
        identify: 'Se identifican con su WhatsApp. Sin contraseñas.',
        pay: 'Compran su paquete y reservan en un solo paso.',
        done: 'Y les llega la confirmación por WhatsApp.',
      },
      pay: {
        options: [
          {title: 'Usar mi paquete', sub: 'No tienes un paquete activo', disabled: true},
          {title: 'Clase suelta', sub: 'Solo esta clase', price: '$240'},
          {title: 'Paquete 5 clases', sub: '$228 por clase', price: '$1,140', badge: 'MÁS POPULAR'},
          {title: 'Paquete 10 clases', sub: '$209 por clase · vigencia 60 días', price: '$2,090'},
          {title: 'Ilimitado mensual', sub: 'Todas las clases que quieras por 30 días', price: '$2,690'},
        ],
        pick: 2,
        remainingAfter: 'Te quedan 4 clases en tu paquete',
      },
    }),
  ],

  addons: {
    kicker: 'Y PARA TU ESTUDIO',
    title: 'Todo lo que',
    titleAccent: 'puedes sumar',
    items: [
      {icon: '🔔', title: 'Recordatorios automáticos', desc: 'Confirmación y recordatorio de cada clase por WhatsApp, sin que muevas un dedo.'},
      {icon: '📣', title: 'Campañas y promociones', desc: 'Lanza descuentos, clases especiales y eventos a tus alumnas en\u00a0un\u00a0clic.'},
      {icon: '👥', title: 'Notificaciones para tu equipo', desc: 'Cada instructora recibe sus clases del día y avisos de cambios.'},
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Sellos y recompensas que hacen volver a tus alumnas.'},
    ],
  },

  // Chill House · Sunset Groove (TurtleBeats, Pixabay) · ~112 BPM
  music: {src: 'musica/sunset-groove.mp3', volume: 0.8, startAt: 0.25},

  // Primer frame del video = miniatura en WhatsApp
  cover: {useOutro: true},

  outro: {
    tagline: ['Reservas, paquetes y recordatorios', 'para tu estudio.'],
    cta: 'Agendemos una llamada',
  },
};
