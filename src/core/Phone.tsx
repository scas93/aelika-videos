import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {useBrand} from './brand';
import {BEZEL, FONT, PHONE_LEFT, PHONE_TOP, PS, SH, SW, lerp, prog} from './theme';
import {Tap} from './types';

export const Phone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: 'absolute',
      left: PHONE_LEFT,
      top: PHONE_TOP,
      width: SW + BEZEL * 2,
      height: SH + BEZEL * 2,
      transform: `scale(${PS})`,
      transformOrigin: '0 0',
    }}
  >
    {/* botones laterales */}
    <div style={{position: 'absolute', left: -3, top: 150, width: 4, height: 30, borderRadius: 2, background: '#2b2724'}} />
    <div style={{position: 'absolute', left: -3, top: 200, width: 4, height: 56, borderRadius: 2, background: '#2b2724'}} />
    <div style={{position: 'absolute', left: -3, top: 268, width: 4, height: 56, borderRadius: 2, background: '#2b2724'}} />
    <div style={{position: 'absolute', right: -3, top: 230, width: 4, height: 86, borderRadius: 2, background: '#2b2724'}} />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 66,
        background: 'linear-gradient(150deg,#4a4540 0%,#151311 45%,#2d2926 100%)',
        boxShadow: '0 30px 60px rgba(0,0,0,.55), 0 8px 18px rgba(0,0,0,.35), inset 0 0 0 1.5px #6b645c',
      }}
    />
    <div style={{position: 'absolute', left: BEZEL, top: BEZEL, width: SW, height: SH, borderRadius: 53, overflow: 'hidden', background: '#000', fontFamily: FONT}}>
      {children}
      <div style={{position: 'absolute', top: 11, left: (SW - 124) / 2, width: 124, height: 36, borderRadius: 20, background: '#000', zIndex: 80}} />
    </div>
  </div>
);

export const StatusBar: React.FC<{time: string; dark?: boolean}> = ({time, dark}) => {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 70, color: c, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, width: 140, top: 19, textAlign: 'center', fontSize: 17, fontWeight: 600, letterSpacing: -0.3}}>{time}</div>
      <svg style={{position: 'absolute', right: 26, top: 21}} width="78" height="13" viewBox="0 0 78 13">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 5} y={9 - i * 3} width="3.4" height={3 + i * 3} rx="1" fill={c} />
        ))}
        <path d="M31 4.2a9 9 0 0 1 12 0l-1.3 1.4a7 7 0 0 0-9.4 0zM33.6 7a5 5 0 0 1 6.8 0L37 10.5z" fill={c} />
        <rect x="51" y="1" width="23" height="11" rx="3.2" fill="none" stroke={c} strokeOpacity=".45" />
        <rect x="53" y="3" width="17" height="7" rx="1.6" fill={c} />
        <rect x="75" y="4.5" width="1.6" height="4" rx=".8" fill={c} fillOpacity=".5" />
      </svg>
    </div>
  );
};

export const HomeIndicator: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{position: 'absolute', bottom: 8, left: (SW - 134) / 2, width: 134, height: 5, borderRadius: 3, background: dark ? '#fff' : '#000', zIndex: 70}} />
);

/** Logo redondo de la marca (o el que se pase en `src`). */
export const BrandAvatar: React.FC<{size: number; ring?: boolean; src?: string}> = ({size, ring, src}) => {
  const brand = useBrand();
  const file = src ?? brand.logo;
  const inner = (
    <div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: brand.colors.dark, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: brand.colors.accentLight, fontFamily: brand.displayFont, fontWeight: 700, fontSize: size * 0.36}}>
      {file ? <Img src={staticFile(file)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.06)'}} /> : brand.name.slice(0, 2).toUpperCase()}
    </div>
  );
  if (!ring) return inner;
  return (
    <div style={{padding: 3, borderRadius: '50%', background: 'linear-gradient(45deg,#f7b733,#e1306c,#8a3ab9)'}}>
      <div style={{padding: 2.5, borderRadius: '50%', background: '#0c1014'}}>{inner}</div>
    </div>
  );
};

// ---------- Dedo / indicador de toque ----------
export const Finger: React.FC<{taps: Tap[]}> = ({taps}) => {
  const f = useCurrentFrame();
  const endOf = (t: Tap) => t.f + (t.to ? t.to.d : 0) + 12;
  for (let i = 0; i < taps.length; i++) {
    const t = taps[i];
    const prev = taps[i - 1];
    const next = taps[i + 1];
    const start = t.f - 16;
    let end = endOf(t);
    if (next) end = Math.min(end, next.f - 16);
    if (f < start || f >= end) continue;
    const chained = prev && start - endOf(prev) < 4 && t.f - prev.f < 40;
    const from = chained ? (prev.to ? prev.to : prev) : {x: t.x + 34, y: t.y + 60};
    let x = lerp(from.x, t.x, prog(f, start, t.f - 2));
    let y = lerp(from.y, t.y, prog(f, start, t.f - 2));
    if (t.to && f > t.f) {
      const p = prog(f, t.f, t.f + t.to.d);
      x = lerp(t.x, t.to.x, p);
      y = lerp(t.y, t.to.y, p);
    }
    const nextChained = next && next.f - 16 - endOf(t) < 4 && next.f - t.f < 40;
    const opacity = Math.min(chained ? 1 : prog(f, start, start + 7), nextChained ? 1 : 1 - prog(f, endOf(t) - 7, endOf(t)));
    const pressEnd = t.f + (t.to ? t.to.d : 0) + 3;
    const pressed = f >= t.f - 2 && f <= pressEnd;
    const r = prog(f, t.f, t.f + 14);
    const showRipple = f >= t.f && f < t.f + 14 && !t.to;
    return (
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 90}}>
        {showRipple && (
          <div style={{position: 'absolute', left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.95)', boxShadow: '0 0 0 1px rgba(0,0,0,.15)', transform: `scale(${0.6 + r * 1.3})`, opacity: (1 - r) * 0.9}} />
        )}
        <div
          style={{
            position: 'absolute',
            left: x - 21,
            top: y - 21,
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.55)',
            border: '2px solid rgba(255,255,255,.9)',
            boxShadow: '0 4px 14px rgba(0,0,0,.35), inset 0 0 0 1px rgba(0,0,0,.08)',
            transform: `scale(${pressed ? 0.8 : 1})`,
            opacity,
          }}
        />
      </div>
    );
  }
  return null;
};

// ---------- Íconos de línea compartidos ----------
export const Icon: React.FC<{d: string; size?: number; color?: string; fill?: boolean; sw?: number}> = ({d, size = 26, color = '#fff', fill, sw = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={fill ? 'none' : color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const ICONS = {
  heart: 'M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z',
  bubble: 'M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z',
  send: 'M22 3 11 13M22 3l-7 18-4-8-8-4z',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  home: 'M3 11 12 3l9 8v10h-6v-6H9v6H3z',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-5-5',
  reels: 'M4 4h16v16H4zM4 9h16M9 4l3 5M15 4l3 5M10 12.5v5l4.5-2.5z',
  bag: 'M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0',
  back: 'M15 5l-7 7 7 7',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  repost: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3',
  bookmark: 'M6 3h12v18l-6-5-6 5z',
  addUser: 'M15 19a6 6 0 0 0-12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M16 11h6',
  close: 'M6 6l12 12M18 6 6 18',
  share: 'M12 3v12M8 7l4-4 4 4M5 12v8h14v-8',
};
