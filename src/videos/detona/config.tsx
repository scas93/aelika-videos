import {VideoConfig} from '../../core/types';
import {aelikaPanel} from '../../scenes/aelika-panel';
import {instagramProfile} from '../../scenes/instagram';
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
    // ESCENA 1 — Gancho: perfil de Instagram y toque al link de la bio
    instagramProfile({
      username: 'detona_bodyworkout',
      name: 'Detona',
      stats: ['510', '16.4 mil', '154'],
      bio: ['Movimiento que detona tu mejor versión', 'Estudio solo para mujeres 🧘‍♀️', '🤍 Gdl, Jalisco. Rubén Dario 425-108', 'Barre, Intensity Mat, Burn Up, Flow & Force'],
      link: 'reservas.detonabodywork.com',
      buttons: ['Seguir', 'Mensaje'],
      ring: true,
      highlights: [
        {image: A('hl0.png'), label: 'Horarios'},
        {image: A('hl1.png'), label: 'Breakfast'},
        {image: A('hl2.png'), label: 'Ustedes 💗'},
        {image: A('hl3.png'), label: 'POCARI 💦'},
        {image: A('hl4.png'), label: 'HM 🍯'},
      ],
      grid: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => A(`feed${i}.jpg`)),
      time: '10:14',
      subtitle: '¿Reservar tu clase en 20 segundos?',
    }),

    // ESCENAS 2–8 — Storefront de clases
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
      pay: {
        packageNote: 'No tienes un paquete activo',
        single: '$240',
        pack: {name: 'Paquete 5 clases', price: '$1,140', per: '$228 por clase', badge: 'MÁS POPULAR'},
        remainingAfter: 'Te quedan 4 clases en tu paquete',
      },
    }),

    // ESCENA 9 — WhatsApp: confirmación + recordatorio
    whatsappChat({
      title: 'Detona Body Work',
      statusTime: '10:17',
      time: '10:17 a. m.',
      script: [
        {
          from: 'bot',
          text: '*¡Lugar apartado, Valeria!* ✅\n🔥 Intensity Mat con Mayte\n📅 Jueves 19 de nov · 06:00\n📍 Rubén Darío 425-108, Gdl\n\nSi no puedes venir, cancela sin costo hasta 12 h antes.',
          typing: 14,
          pause: 40,
          sub: 'Confirmación y recordatorio automáticos.',
        },
        {from: 'jump', label: 'Miércoles · 20:00', statusTime: '20:00'},
        {
          from: 'bot',
          text: 'Mañana tienes *Intensity Mat* a las 06:00 💪 ¿Confirmas?',
          time: '8:00 p. m.',
          typing: 16,
          buttons: ['Sí, ahí estaré', 'Cancelar'],
          tapButton: 0,
        },
      ],
    }),

    // ESCENA 10 — Lado del estudio
    aelikaPanel({
      business: 'Detona',
      dateLabel: 'Jueves 19 de noviembre',
      item: {time: '06:00', name: 'Intensity Mat', who: 'Mayte', booked: 8, capacity: 10},
      attendees: ['Valeria G.', 'Ximena M.', 'Paola R.', 'Fernanda L.', 'Mariana C.', 'Daniela S.', 'Regina T.', 'Lucía H.'],
      highlight: 0,
      notification: {title: 'Buenos días, Mayte ☀️ Tus clases de hoy:', lines: ['06:00 · Intensity Mat · 8/10', '18:00 · Flow & Force · 6/10']},
      statusTime: '5:30',
      subtitle: 'Y tu equipo sabe a quién le toca.',
    }),
  ],

  outro: {
    tagline: ['Reservas, paquetes y recordatorios', 'para tu estudio.'],
    cta: 'Agenda tu demo',
  },
};
