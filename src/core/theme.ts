import {Easing, interpolate} from 'remotion';

// ---------- Lienzo (vertical 9:16) ----------
export const FPS = 30;
export const W = 1080;
export const H = 1920;

// Pantalla del teléfono en px lógicos (iPhone 390x844) y escala al lienzo
export const SW = 390;
export const SH = 844;
export const PS = 1.78;
export const BEZEL = 14;
export const PHONE_W = (SW + BEZEL * 2) * PS;
export const PHONE_LEFT = (W - PHONE_W) / 2;
export const PHONE_TOP = 112;
export const SCREEN_X = PHONE_LEFT + BEZEL * PS;
export const SCREEN_Y = PHONE_TOP + BEZEL * PS;

export const toCanvas = (x: number, y: number) => ({x: SCREEN_X + x * PS, y: SCREEN_Y + y * PS});

export const FONT = 'Inter, "Noto Color Emoji", sans-serif';

// ---------- Utilidades de animación ----------
const ease = Easing.bezier(0.33, 1, 0.68, 1);

export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const typed = (text: string, f: number, a: number, b: number) => {
  if (f < a) return '';
  const chars = Array.from(text);
  const t = Math.min(1, (f - a) / Math.max(1, b - a));
  return chars.slice(0, Math.round(chars.length * t)).join('');
};

/** ventana visible con entrada/salida suave */
export const win = (f: number, a: number, b: number, fadeIn = 8, fadeOut = 8) =>
  Math.min(prog(f, a, a + fadeIn), 1 - prog(f, b - fadeOut, b));

/** Evita que "5:00 p. m." se parta en dos líneas */
export const nb = (t: string) => t.replace(/ ([ap])\. m\./g, ' $1. m.');

/** Convierte un hex (#rrggbb) en rgba() */
export const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
