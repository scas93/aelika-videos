import {VideoConfig} from '../../core/types';
import {instagramPost, instagramProfile} from '../../scenes/instagram';
import {linktree} from '../../scenes/linktree';
import {appointmentsStorefront} from '../../scenes/storefront/appointments';
import {whatsappChat} from '../../scenes/whatsapp';

// Fotos y logos en public/casa-occidente/
const A = (f: string) => `casa-occidente/${f}`;

const card = {image: A('feed4.jpg'), footer: 'pide.aelika.com', button: 'Agendar mi cita'};
const cardText = '*¡Perfecto! 🙌*\nAgenda en menos de un minuto: elige tu servicio, tu barbero y el horario que más te acomode.';
const servicios = 'Tenemos corte, barba, corte y barba, y tratamientos. Si quieres, te agendo una cita para que elijas tu servicio y a tu barbero.';

export const casaOccidente: VideoConfig = {
  id: 'CasaOccidente',

  brand: {
    name: 'Casa Occidente',
    logo: A('logo.png'),
    colors: {
      dark: '#16130f',
      dark2: '#211d19',
      dark3: '#2d2722',
      accent: '#b07a43',
      accentLight: '#d6a774',
      accentDark: '#7c5229',
      light: '#f4ede3',
      paper: '#f7f2eb',
      line: '#e5dccf',
      muted: '#8a7f73',
    },
    displayFont: '"Playfair Display", Georgia, serif',
  },

  scenes: [
    instagramPost({
      image: A('post.jpg'),
      username: 'casa.occidente',
      caption: 'Detrás de cada buen corte hay años de experiencia, técnica y atención a cada detalle…',
      likes: 1284,
      date: '19 de junio',
    }),

    instagramProfile({
      username: 'casa.occidente',
      name: 'Casa Occidente | Barbería & Bar',
      stats: ['246', '17.7 mil', '979'],
      bio: ['Donde el estilo se convierte en experiencia.', 'EST. 2015', 'Barbería | Bar CO | Bottega Tenreiro', 'L–V 9AM–9PM · S 10AM–5PM'],
      link: 'linktr.ee/casaoccidente',
      chips: ['@ casa.occidente', '💬 CANAL CO 📣'],
      highlights: [
        {image: A('hl0.png'), label: 'BAR CO'},
        {image: A('hl1.png'), label: 'BARBERÍA'},
        {image: A('hl2.png'), label: 'CO SELECT'},
        {image: A('hl3.png'), label: 'SASTRERÍA'},
        {image: A('hl4.png'), label: 'VISÍTANOS'},
      ],
      grid: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => A(`feed${i}.jpg`)),
    }),

    linktree({
      avatar: A('logo-linktree.png'),
      name: 'Casa Occidente',
      tagline: 'Alta peluquería, alta sastrería y CO bar.',
      buttons: ['Guadalajara', 'Puebla'],
      pick: 0,
    }),

    whatsappChat({
      title: 'Casa Occidente Gdl',
      script: [
        {from: 'user', text: 'Hola, me gustaría obtener información', prefilled: true, sub: 'Y ya estás en su WhatsApp.'},
        {from: 'bot', text: '¡Hola! Qué gusto saludarte, bienvenido a Casa Occidente Guadalajara 👋 Soy el asistente virtual. Cuéntame, ¿en qué te puedo ayudar?', sub: 'Te contesta al instante.', pause: 55},
        {from: 'user', text: '¿Qué horario tienen?', sub: 'Resuelve tus dudas sin esperar.'},
        {from: 'bot', text: 'Abrimos de lunes a viernes de 9:00 a. m. a 9:00 p. m., y los sábados de 10:00 a. m. a 5:00 p. m. 🕘', pause: 24},
        {from: 'user', text: '¿Qué servicios manejan?'},
        {from: 'bot', text: servicios, pause: 50},
        {from: 'user', text: 'Sí, quiero agendar una cita.', sub: 'Y te manda directo a agendar.'},
        {from: 'bot', text: cardText, card, tap: true, zoom: true, typing: 18},
      ],
    }),

    appointmentsStorefront({
      header: {title: 'CASA OCCIDENTE', subtitle: 'BARBERÍA & BAR · GUADALAJARA', note: '🕘 Abierto hoy · 9:00 a. m. – 9:00 p. m.'},
      menu: [
        {icon: '📅', title: 'Agendar cita', desc: 'Elige servicio, barbero y horario'},
        {icon: '🏷️', title: 'Ver promociones', desc: 'Paquetes y descuentos del mes'},
        {icon: '🧴', title: 'Comprar productos', desc: 'Ceras, aceites y más'},
      ],
      services: [
        {name: 'Corte', duration: '45 min', price: '$280'},
        {name: 'Barba', duration: '30 min', price: '$220'},
        {name: 'Corte y barba', duration: '75 min', price: '$450'},
        {name: 'Tratamiento facial', duration: '40 min', price: '$350'},
      ],
      pickService: 2,
      extras: [
        {name: 'Ceja', price: '+$80'},
        {name: 'Facial', price: '+$120'},
        {name: 'Lavado', price: '+$60'},
      ],
      pickExtra: 0,
      total: '$530',
      staffLabel: 'barbero',
      staff: [
        {name: 'Diego', desc: 'Fades y barba · ★ 4.9', hair: '#3b2a1e', skin: '#c58e63'},
        {name: 'Luis', desc: 'Clásicos · ★ 4.8', hair: '#141414', skin: '#a87454'},
        {name: 'Andrés', desc: 'Diseños · ★ 4.9', hair: '#5a3a22', skin: '#d2a07a'},
        {name: 'Marco', desc: 'Barba · ★ 4.7', hair: '#2a2a2a', skin: '#8f5f40'},
        {name: 'Iván', desc: 'Tijera · ★ 4.8', hair: '#6b4a2b', skin: '#e0b48e'},
      ],
      pickStaff: 0,
      monthLabel: 'NOVIEMBRE 2026',
      days: [
        ['MIÉ', '18'],
        ['JUE', '19'],
        ['VIE', '20'],
        ['SÁB', '21'],
        ['LUN', '23'],
      ],
      pickDay: 2,
      dayLong: 'Viernes 20 de noviembre',
      slots: ['10:00 a. m.', '11:30 a. m.', '1:00 p. m.', '3:30 p. m.', '5:00 p. m.', '6:30 p. m.'],
      pickSlot: 4,
      customer: {name: 'Santiago Ramírez', phone: '33 1234 5678'},
      location: 'Casa Occidente Guadalajara',
      payNote: 'Pagas en la barbería',
    }),

    whatsappChat({
      title: 'Casa Occidente Gdl',
      statusTime: '7:27',
      enter: 'fade',
      history: [
        {from: 'bot', text: servicios},
        {from: 'user', text: 'Sí, quiero agendar una cita.'},
        {from: 'bot', text: cardText, card},
      ],
      script: [
        {
          from: 'bot',
          text: '*¡Listo, Santiago! Tu cita quedó confirmada ✅*\n\n💈 Corte y barba + ceja\n👤 Diego\n📅 Viernes 20 de noviembre, 5:00 p. m.\n\nTe esperamos.',
          time: '7:27 p. m.',
          typing: 14,
          zoom: true,
          highlight: true,
          sub: 'Te confirma por WhatsApp.',
        },
      ],
      hold: 4,
    }),
  ],

  // Primer frame del video = miniatura en WhatsApp
  cover: {kicker: 'CASA OCCIDENTE', title: ['De Instagram', 'a la silla']},

  addons: {
    items: [
      {icon: '🔔', title: 'Notificaciones de seguimiento', desc: 'Confirmación, recordatorio y «califica tu servicio» por WhatsApp, en automático.'},
      {icon: '📣', title: 'Promociones y campañas', desc: 'Lanza descuentos y promociones a tus clientes en un clic.'},
      {icon: '👥', title: 'Notificaciones para tu equipo', desc: 'Su agenda al iniciar el día y un aviso cada vez que una cita cambia.'},
      {icon: '🎁', title: 'Programa de lealtad', desc: 'Sellos y recompensas que hacen volver a tus clientes.'},
    ],
  },
};
