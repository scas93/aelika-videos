import React from 'react';
import {nb} from '../core/theme';
import {PhoneScene, Sub, Tap, Zoom} from '../core/types';
import {ChatScreen, InputStep, Msg, SEND_BTN, SEND_Y_ABS, Typing, estH} from './whatsapp-screen';

export type ChatCard = {
  /** imagen de encabezado de la tarjeta, dentro de /public */
  image: string;
  /** texto pequeño gris, p. ej. el dominio */
  footer?: string;
  /** texto del botón, p. ej. "Agendar mi cita" */
  button: string;
};

export type Turn =
  | {
      from: 'user';
      text: string;
      /** el texto ya viene escrito (p. ej. desde el link del Linktree) */
      prefilled?: boolean;
      sub?: string;
      pause?: number;
    }
  | {
      from: 'bot';
      /** admite *negritas* y saltos de línea \n */
      text: string;
      sub?: string;
      pause?: number;
      typing?: number;
      card?: ChatCard;
      /** el cliente toca el botón de la tarjeta */
      tap?: boolean;
      /** 🔍 zoom a este mensaje */
      zoom?: boolean;
      /** resalta el mensaje con un borde del color de la marca */
      highlight?: boolean;
      time?: string;
    };

export type HistoryMsg = {from: 'user' | 'bot'; text: string; card?: ChatCard; time?: string};

export type WhatsAppData = {
  /** nombre del contacto en el encabezado */
  title: string;
  /** hora de la barra de estado */
  statusTime?: string;
  /** hora que se muestra en las burbujas */
  time?: string;
  /** mensajes que ya estaban en el chat */
  history?: HistoryMsg[];
  script: Turn[];
  /** frames extra al final de la escena */
  hold?: number;
  enter?: 'none' | 'left' | 'up' | 'fade';
};

/** *negritas* → <b> */
const rich = (text: string): React.ReactNode => {
  const parts = nb(text).split(/(\*[^*]+\*)/g);
  return parts.map((p, i) => (p.startsWith('*') && p.endsWith('*') ? <b key={i} style={{fontWeight: 700}}>{p.slice(1, -1)}</b> : <React.Fragment key={i}>{p}</React.Fragment>));
};
const plain = (text: string) => nb(text).replace(/\*/g, '');

const CARD_BUTTON = {x: 156, y: 729};
const CARD_CENTER = {x: 160, y: 610};
const SEND = {x: SEND_BTN.x, y: SEND_Y_ABS};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const toMsg = (m: {from: 'user' | 'bot'; text: string; card?: ChatCard; time?: string}, at: number, time: string, extra: Partial<Msg> = {}): Msg => ({
  at,
  out: m.from === 'user',
  raw: plain(m.text),
  text: rich(m.text),
  time: m.time ?? time,
  card: m.card ? {image: m.card.image, footer: m.card.footer ?? '', button: m.card.button} : undefined,
  ...extra,
});

/** Calcula los tiempos de cada mensaje, tecleo, toques, zooms y subtítulos. */
const schedule = (d: WhatsAppData) => {
  const time = d.time ?? '7:25 p. m.';
  const messages: Msg[] = (d.history ?? []).map((h) => toMsg(h, -100, time));
  const inputs: InputStep[] = [];
  const typing: Typing[] = [];
  const taps: Tap[] = [];
  const zooms: Zoom[] = [];
  const subtitles: Sub[] = [];
  let t = 0;
  for (const turn of d.script) {
    if (turn.sub) subtitles.push({at: t, text: turn.sub});
    if (turn.from === 'user') {
      if (turn.prefilled) {
        inputs.push({text: turn.text, a: -1, b: -1, sent: t + 32});
        taps.push({f: t + 30, ...SEND});
        messages.push(toMsg(turn, t + 32, time));
        t += 32 + (turn.pause ?? 18);
      } else {
        const a = t + 2;
        const b = a + clamp(Math.round(turn.text.length * 1.1), 18, 30);
        inputs.push({text: turn.text, a, b, sent: b + 6});
        taps.push({f: b + 4, ...SEND});
        messages.push(toMsg(turn, b + 6, time));
        t = b + 6 + (turn.pause ?? 6);
      }
    } else {
      const ty = turn.typing ?? 26;
      typing.push([t, t + ty]);
      const at = t + ty;
      const msg = toMsg(turn, at, time, turn.highlight ? {highlight: at + 8} : {});
      if (turn.card && turn.tap) msg.card!.pressAt = at + 30;
      messages.push(msg);
      let pause = turn.pause ?? clamp(Math.round(plain(turn.text).length * 0.5), 16, 70);
      if (turn.zoom) {
        const center = turn.card ? CARD_CENTER : {x: 170, y: 750 - (estH(msg) - 6) / 2};
        const len = turn.card ? 42 : 74;
        zooms.push({a: at + 2, b: at + len, ...center, s: turn.card ? 1.35 : 1.4});
        pause = Math.max(pause, len - 2);
      }
      if (turn.card && turn.tap) {
        taps.push({f: at + 30, ...CARD_BUTTON});
        pause = Math.max(pause, 42);
      }
      t = at + pause;
    }
  }
  return {messages, inputs, typing, taps, zooms, subtitles, duration: t + (d.hold ?? 0)};
};

/**
 * Chat de WhatsApp a partir de un guion. Los tiempos (tecleo, "escribiendo…",
 * envío, zooms y toques) se calculan solos; se ajustan con `pause` y `typing`.
 */
export const whatsappChat = (d: WhatsAppData): PhoneScene => {
  const s = schedule(d);
  const status = d.statusTime ?? '7:25';
  return {
    id: 'whatsapp',
    duration: s.duration,
    enter: d.enter ?? 'up',
    Component: () => <ChatScreen title={d.title} statusTime={() => status} messages={s.messages} typing={s.typing} inputs={s.inputs} />,
    taps: s.taps,
    zooms: s.zooms,
    subtitles: s.subtitles,
  };
};
