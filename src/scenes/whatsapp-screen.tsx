import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {BrandAvatar, HomeIndicator, StatusBar} from '../core/Phone';
import {useBrand} from '../core/brand';
import {SW, prog, typed} from '../core/theme';

export type Msg = {
  at: number;
  out?: boolean;
  text: React.ReactNode;
  raw: string; // para estimar alto
  time: string;
  date?: string; // separador de fecha antes del mensaje
  highlight?: number; // frame en que se resalta
  card?: {image: string; footer: string; button: string; pressAt?: number}; // mensaje tipo tarjeta con botón
  /** botones de respuesta rápida bajo la burbuja */
  buttons?: {labels: string[]; pressAt?: number; pressIndex?: number};
  /** menú numerado en una segunda burbuja (1 Reservar, 2 Horarios…) */
  menu?: {items: string[]; note?: string; pressAt?: number; pressIndex?: number};
  /** aviso del sistema (cifrado de extremo a extremo) */
  system?: boolean;
};
/** salto de tiempo: cortinilla dentro del chat */
export type Jump = {a: number; b: number; label: string};
export type Typing = [number, number];
export type InputStep = {text: string; a: number; b: number; sent: number};

export const INPUT_BAR = 84;
export const MENU_ROW = 40;
/** alto aprox. de la nota en cursiva del menú (13px, ~42 caracteres por línea) */
export const menuNoteH = (note: string) => Math.ceil(note.length / 42) * 18 + 6;

export const estH = (m: Msg) => {
  const lines = m.raw.split('\n').reduce((s, l) => s + Math.max(1, Math.ceil(l.length / 31)), 0);
  return lines * 21 + 30 + 6 + (m.date ? 40 : 0) + (m.card ? 140 + 20 + 46 : 0) + (m.buttons ? m.buttons.labels.length * 44 : 0) + (m.menu ? m.menu.items.length * MENU_ROW + (m.menu.note ? menuNoteH(m.menu.note) : 0) + 26 : 0);
};

const Ticks = () => (
  <svg width="17" height="11" viewBox="0 0 17 11" style={{marginLeft: 3}}>
    <path d="M1 6l3 3 6-7M7 8.5l1 .5 6-7" fill="none" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const TypingBubble: React.FC<{f: number}> = ({f}) => (
  <div style={{alignSelf: 'flex-start', background: '#fff', borderRadius: 14, borderTopLeftRadius: 4, padding: '12px 14px', display: 'flex', gap: 5, boxShadow: '0 1px .5px rgba(0,0,0,.13)'}}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{width: 8, height: 8, borderRadius: '50%', background: '#8c8c8c', opacity: 0.4 + 0.6 * Math.abs(Math.sin((f + i * 5) / 6)), transform: `translateY(${-2 * Math.abs(Math.sin((f + i * 5) / 6))}px)`}} />
    ))}
  </div>
);

export const ChatScreen: React.FC<{
  title: string;
  avatar?: React.ReactNode;
  statusTime: (f: number) => string;
  messages: Msg[];
  typing?: Typing[];
  inputs?: InputStep[];
  jumps?: Jump[];
}> = ({title, avatar, statusTime, messages, typing = [], inputs = [], jumps = []}) => {
  const f = useCurrentFrame();
  const brand = useBrand();
  const visible = messages.filter((m) => f >= m.at);
  const isTyping = typing.some(([a, b]) => f >= a && f < b);
  // desplazamiento suave: los mensajes que van entrando empujan hacia arriba
  let offset = 0;
  visible.forEach((m) => {
    offset += (1 - prog(f, m.at, m.at + 8)) * estH(m);
  });
  const step = inputs.find((s) => f >= s.a && f < s.sent);
  const inputText = step ? (step.a < 0 ? step.text : typed(step.text, f, step.a, step.b)) : '';

  return (
    <div style={{position: 'absolute', inset: 0, background: '#efe7dd', color: '#111'}}>
      {/* wallpaper */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(rgba(150,120,90,.18) 1.2px, transparent 1.3px)', backgroundSize: '18px 18px'}} />
      {/* mensajes */}
      <div style={{position: 'absolute', top: 108, bottom: INPUT_BAR, left: 0, right: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 10, right: 10, bottom: 10, display: 'flex', flexDirection: 'column', gap: 6, transform: `translateY(${offset}px)`}}>
          {visible.map((m, i) => {
            const p = prog(f, m.at, m.at + 8);
            const hl = m.highlight !== undefined ? prog(f, m.highlight, m.highlight + 8) : 0;
            return (
              <React.Fragment key={i}>
                {m.date && (
                  <div style={{alignSelf: 'center', background: '#fff', borderRadius: 8, padding: '5px 12px', fontSize: 12.5, color: '#54656f', margin: '6px 0', opacity: p, boxShadow: '0 1px .5px rgba(0,0,0,.1)'}}>{m.date}</div>
                )}
                {m.system ? (
                  <div style={{alignSelf: 'center', maxWidth: 330, background: '#fcf3c7', borderRadius: 10, padding: '7px 12px', fontSize: 12.5, lineHeight: '17px', color: '#5b5440', textAlign: 'center', margin: '2px 0 8px', boxShadow: '0 1px .5px rgba(0,0,0,.08)'}}>{m.text}</div>
                ) : (
                <div
                  style={{
                    alignSelf: m.out ? 'flex-end' : 'flex-start',
                    maxWidth: 292,
                    width: m.card ? 292 : undefined,
                    background: m.out ? '#d9fdd3' : '#fff',
                    borderRadius: 14,
                    [m.out ? 'borderTopRightRadius' : 'borderTopLeftRadius']: 4,
                    padding: m.card ? '4px 4px 0' : '7px 10px 5px',
                    fontSize: 15.5,
                    lineHeight: '21px',
                    whiteSpace: 'pre-wrap',
                    boxShadow: `0 1px .5px rgba(0,0,0,.13), 0 0 0 ${hl * 3}px rgba(176,122,67,${hl * 0.6})`,
                    opacity: p,
                    transform: `translateY(${(1 - p) * 10}px) scale(${0.94 + 0.06 * p})`,
                    transformOrigin: m.out ? 'right bottom' : 'left bottom',
                    overflow: 'hidden',
                  }}
                >
                  {m.card && <Img src={staticFile(m.card.image)} style={{width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, display: 'block'}} />}
                  <div style={{padding: m.card ? '7px 7px 4px' : 0}}>
                    {m.text}
                    {m.card && <div style={{fontSize: 13, color: '#667781', marginTop: 4}}>{m.card.footer}</div>}
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 11, color: '#667781', marginTop: 1}}>
                      {m.time}
                      {m.out && <Ticks />}
                    </div>
                  </div>
                  {m.card && (
                    <div style={{borderTop: '1px solid #e9edef', margin: '0 -4px', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: '#027eb5', fontSize: 16, fontWeight: 500, background: m.card.pressAt !== undefined && f >= m.card.pressAt && f < m.card.pressAt + 10 ? '#eef3f6' : 'transparent'}}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#027eb5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                      </svg>
                      {m.card.button}
                    </div>
                  )}
                </div>
                )}
                {m.menu && (
                  <div style={{alignSelf: 'flex-start', width: 292, background: '#fff', borderRadius: 14, borderTopLeftRadius: 4, padding: '10px 14px 10px', boxShadow: '0 1px .5px rgba(0,0,0,.13)', opacity: prog(f, m.at + 4, m.at + 12), transform: `translateY(${(1 - prog(f, m.at + 4, m.at + 12)) * 8}px)`}}>
                    {m.menu.items.map((it, k) => {
                      const pressed = m.menu!.pressAt !== undefined && k === m.menu!.pressIndex && f >= m.menu!.pressAt && f < m.menu!.pressAt + 12;
                      return (
                        <div key={it} style={{display: 'flex', alignItems: 'center', gap: 10, height: MENU_ROW, fontSize: 16, color: '#027eb5', fontWeight: 500, borderTop: k === 0 ? 'none' : '1px solid #eef0f1', margin: '0 -14px', padding: '0 14px', background: pressed ? '#eef3f6' : 'transparent'}}>
                          <div style={{width: 22, height: 22, borderRadius: 5, background: brand.colors.accentDark, color: '#fff', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{k + 1}</div>
                          <div style={{flex: 1}}>{it}</div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#027eb5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
                          </svg>
                        </div>
                      );
                    })}
                    {m.menu.note && <div style={{fontSize: 13, fontStyle: 'italic', color: '#7a7a7a', lineHeight: '18px', marginTop: 6}}>{m.menu.note}</div>}
                  </div>
                )}
                {m.buttons && (
                  <div style={{alignSelf: 'flex-start', width: 292, display: 'flex', flexDirection: 'column', gap: 4, marginTop: -2, opacity: p}}>
                    {m.buttons.labels.map((l, bi) => {
                      const pressed = m.buttons!.pressAt !== undefined && bi === m.buttons!.pressIndex && f >= m.buttons!.pressAt && f < m.buttons!.pressAt + 10;
                      return (
                        <div key={l} style={{height: 40, borderRadius: 10, background: pressed ? '#eef3f6' : '#fff', boxShadow: '0 1px .5px rgba(0,0,0,.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#027eb5', fontSize: 15.5, fontWeight: 500}}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#027eb5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
                          </svg>
                          {l}
                        </div>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
          {isTyping && <TypingBubble f={f} />}
        </div>
      </div>
      {/* header */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 108, background: 'rgba(247,247,247,.97)', borderBottom: '1px solid #ddd'}}>
        <StatusBar time={statusTime(f)} />
        <div style={{position: 'absolute', top: 58, left: 8, right: 12, height: 44, display: 'flex', alignItems: 'center', gap: 8}}>
          <svg width="14" height="24" viewBox="0 0 14 24">
            <path d="M12 2 3 12l9 10" fill="none" stroke="#007aff" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          {avatar ?? <BrandAvatar size={38} />}
          <div style={{flex: 1, marginLeft: 2}}>
            <div style={{fontWeight: 600, fontSize: 16.5}}>{title}</div>
            <div style={{fontSize: 12.5, color: isTyping ? '#25a35a' : '#667781'}}>{isTyping ? 'escribiendo…' : 'en línea'}</div>
          </div>
          <svg width="26" height="20" viewBox="0 0 26 20" style={{marginRight: 16}}>
            <rect x="1" y="3" width="16" height="14" rx="3" fill="none" stroke="#007aff" strokeWidth="2" />
            <path d="M18 8l6-4v12l-6-4z" fill="none" stroke="#007aff" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" fill="none" stroke="#007aff" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {/* barra de entrada */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: INPUT_BAR, background: 'rgba(247,247,247,.98)', borderTop: '1px solid #ddd'}}>
        <div style={{position: 'absolute', top: 9, left: 10, right: 10, height: 36, display: 'flex', alignItems: 'center', gap: 10}}>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M12 4v16M4 12h16" stroke="#007aff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <div style={{flex: 1, minHeight: 34, borderRadius: 18, background: '#fff', border: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 15.5, overflow: 'hidden', whiteSpace: 'nowrap'}}>
            {inputText}
            {step && f % 30 < 18 && <span style={{display: 'inline-block', width: 2, height: 19, background: '#25a35a', marginLeft: 1}} />}
          </div>
          <div style={{width: 34, height: 34, borderRadius: '50%', background: inputText ? '#25a35a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {inputText ? (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M3 12 21 4l-6 17-3-7z" fill="#fff" />
              </svg>
            ) : (
              <svg width="20" height="22" viewBox="0 0 20 24">
                <rect x="6" y="2" width="8" height="13" rx="4" fill="none" stroke="#007aff" strokeWidth="2" />
                <path d="M2 11a8 8 0 0 0 16 0M10 19v4" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </div>
      </div>
      <HomeIndicator />
      {jumps.map((j) => {
        if (f < j.a || f >= j.b) return null;
        const p = Math.min(prog(f, j.a, j.a + 7), 1 - prog(f, j.b - 8, j.b));
        return (
          <div key={j.a} style={{position: 'absolute', inset: 0, zIndex: 85, background: `rgba(20,20,18,${0.82 * p})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: p}}>
            <div style={{fontSize: 13, letterSpacing: 4, opacity: 0.75, fontWeight: 600}}>MÁS TARDE…</div>
            <div style={{fontSize: 30, fontWeight: 300, marginTop: 8, letterSpacing: -0.5, transform: `translateY(${(1 - p) * 10}px)`}}>{j.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// posición del botón de enviar (coords de pantalla)
export const SEND_BTN = {x: SW - 10 - 17, y: 9 + 18};
export const SEND_Y_ABS = 844 - INPUT_BAR + SEND_BTN.y;

