import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useBrand} from '../core/brand';
import {FONT, prog, rgba} from '../core/theme';
import {Addon} from '../core/types';

const HEAD = 34; // frame en que aparece la primera tarjeta
const STEP = 30; // frames entre tarjetas
const HOLD = 110; // tiempo de lectura al final

export const addonsDuration = (n: number) => HEAD + n * STEP + HOLD;

/** Escena a pantalla completa con la lista de add-ons. */
export const Addons: React.FC<{
  kicker?: string;
  title?: string;
  titleAccent?: string;
  items: Addon[];
  more?: string;
  len: number;
}> = ({kicker = 'Y HAY MÁS', title = 'Add-ons para tu', titleAccent = 'mostrador digital', items, more = '…y mucho más', len}) => {
  const f = useCurrentFrame();
  const {colors, displayFont, canvas} = useBrand();
  const onLight = canvas === 'light';
  const titleColor = onLight ? colors.dark : colors.light;
  const accentText = onLight ? colors.accentDark : colors.accentLight;
  const outP = prog(f, len - 10, len + 10);
  const head = prog(f, 14, 32);
  const cardH = 178;
  const gap = 28;
  const listH = items.length * (cardH + gap) - gap;
  const top = Math.max(560, 1060 - listH / 2);
  return (
    <AbsoluteFill style={{opacity: 1 - outP, transform: `translateY(${-outP * 40}px)`}}>
      <div style={{position: 'absolute', top: top - 370, left: 0, right: 0, textAlign: 'center', color: titleColor, opacity: head, transform: `translateY(${(1 - head) * 24}px)`}}>
        <div style={{fontFamily: FONT, fontSize: 28, letterSpacing: 8, color: accentText, fontWeight: 600}}>{kicker}</div>
        <div style={{fontFamily: displayFont, fontSize: 74, fontWeight: 700, marginTop: 14, lineHeight: 1.1}}>
          {title}
          <br />
          <span style={{fontStyle: 'italic', color: accentText}}>{titleAccent}</span>
        </div>
      </div>
      {items.map((it, i) => {
        const s0 = HEAD + i * STEP;
        const p = prog(f, s0, s0 + 16);
        const glow = Math.max(0, 1 - prog(f, s0 + 10, s0 + 40));
        return (
          <div
            key={it.title}
            style={{
              position: 'absolute',
              left: 70,
              right: 70,
              top: top + i * (cardH + gap),
              height: cardH,
              borderRadius: 36,
              background: onLight ? rgba('#ffffff', 0.85) : rgba(colors.dark, 0.72),
              border: `2px solid ${rgba(colors.accentLight, 0.25 + glow * 0.6)}`,
              boxShadow: `0 16px 40px rgba(0,0,0,${onLight ? 0.08 : 0.3}), 0 0 ${glow * 40}px ${rgba(colors.accentLight, glow * 0.35)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 34,
              padding: '0 40px',
              opacity: p,
              transform: `translateX(${(1 - p) * 80}px)`,
            }}
          >
            <div style={{width: 92, height: 92, flexShrink: 0, borderRadius: 26, background: `linear-gradient(145deg, ${colors.accent}, ${colors.accentDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48}}>{it.icon}</div>
            <div style={{color: onLight ? colors.dark : colors.light}}>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 42, letterSpacing: -0.6}}>{it.title}</div>
              <div style={{fontFamily: FONT, fontSize: 28, opacity: 0.72, marginTop: 6, lineHeight: 1.25}}>{it.desc}</div>
            </div>
          </div>
        );
      })}
      {more && (
        <div style={{position: 'absolute', top: top + listH + 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: prog(f, HEAD + items.length * STEP + 4, HEAD + items.length * STEP + 20)}}>
          <div style={{fontFamily: displayFont, fontStyle: 'italic', fontSize: 52, color: accentText, padding: '14px 44px', borderRadius: 999, border: `2px dashed ${rgba(accentText, 0.5)}`}}>{more}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
