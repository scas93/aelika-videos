import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {useBrand} from '../core/brand';
import {BrandAvatar, HomeIndicator, StatusBar} from '../core/Phone';
import {FONT, SCREEN_Y, PS, lerp, prog, rgba} from '../core/theme';
import {PhoneScene} from '../core/types';

/**
 * "Llegan de donde sea, todo empieza en WhatsApp": tarjetas de Google Maps,
 * Instagram, sitio web y QR alrededor del teléfono; cada una toca su botón de
 * WhatsApp y converge en el teléfono. Después sigue la escena de WhatsApp.
 */
export type Channel = 'maps' | 'instagram' | 'web' | 'qr';

export type EntryPointsData = {
  channels?: Channel[];
  /** nombre del negocio como aparece en Maps / web */
  name: string;
  /** usuario de Instagram */
  handle: string;
  /** categoría en Google Maps, p. ej. "Estudio de fitness" */
  category: string;
  rating?: string;
  reviews?: string;
  /** dominio del sitio web */
  web?: string;
  time?: string;
  dateLabel?: string;
  subtitles?: [string, string];
};

const DUR = 180;
const W_CARD = 272;
const K = 1.2; // escala de las tarjetas
const SLOTS = [
  {x: 14, y: 290},
  {x: 1066 - W_CARD * K, y: 450},
  {x: 14, y: 990},
  {x: 1066 - W_CARD * K, y: 1150},
];
const TAP0 = 34;
const TAP_STEP = 20;
const MERGE = 126;
const PHONE_C = {x: 540, y: 900};
const WA = '#25d366';

const WaIcon: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill={color} />
  </svg>
);

const WaButton: React.FC<{label?: string; pressed: boolean; full?: boolean}> = ({label = 'WhatsApp', pressed, full}) => (
  <div style={{height: 44, borderRadius: 22, background: WA, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 19, fontWeight: 700, padding: '0 16px', flex: full ? 1 : undefined, transform: pressed ? 'scale(.92)' : 'none', boxShadow: pressed ? `0 0 0 6px ${rgba(WA, 0.25)}` : 'none'}}>
    <WaIcon size={20} />
    {label}
  </div>
);

// ------------------------------------------------------------------ tarjetas
const MapsCard: React.FC<{d: EntryPointsData; pressed: boolean}> = ({d, pressed}) => (
  <div style={{background: '#fff', color: '#202124'}}>
    <div style={{height: 108, position: 'relative', background: '#e8eaed', overflow: 'hidden'}}>
      <svg width={W_CARD} height="108" viewBox="0 0 272 108">
        <rect width="272" height="108" fill="#eef0e9" />
        <path d="M0 70 L272 40 M60 0 L100 108 M180 0 L150 108 M0 20 L272 95" stroke="#fff" strokeWidth="9" />
        <path d="M0 70 L272 40" stroke="#fbd96a" strokeWidth="5" />
        <rect x="200" y="62" width="50" height="34" rx="4" fill="#cfe8c3" />
      </svg>
      <svg style={{position: 'absolute', left: 120, top: 22}} width="32" height="44" viewBox="0 0 24 34">
        <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 34 12 34s12-13.6 12-22.3C24 5.2 18.6 0 12 0z" fill="#ea4335" />
        <circle cx="12" cy="11.5" r="4.5" fill="#a50e0e" />
      </svg>
    </div>
    <div style={{padding: '12px 14px 14px'}}>
      <div style={{fontSize: 21, fontWeight: 600}}>{d.name}</div>
      <div style={{fontSize: 16, color: '#70757a', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5}}>
        {d.rating ?? '4.9'} <span style={{color: '#fbbc04', letterSpacing: 1}}>★★★★★</span> ({d.reviews ?? '128'})
      </div>
      <div style={{fontSize: 15.5, color: '#70757a', marginTop: 2}}>
        {d.category} · <span style={{color: '#188038', fontWeight: 600}}>Abierto</span>
      </div>
      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
        <div style={{height: 44, borderRadius: 22, border: '1.5px solid #dadce0', color: '#1a73e8', fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', padding: '0 14px'}}>Cómo llegar</div>
        <WaButton pressed={pressed} full />
      </div>
    </div>
  </div>
);

const InstagramCard: React.FC<{d: EntryPointsData; pressed: boolean}> = ({d, pressed}) => (
  <div style={{background: '#0c1014', color: '#f5f5f5', padding: '16px 14px 16px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <BrandAvatar size={62} ring />
      <div>
        <div style={{fontSize: 16, fontWeight: 700}}>{d.handle}</div>
        <div style={{fontSize: 15, color: '#a8a8a8', marginTop: 2}}>{d.category}</div>
      </div>
    </div>
    <div style={{display: 'flex', gap: 6, marginTop: 16}}>
      <div style={{flex: 1, height: 44, borderRadius: 10, background: '#4a5df9', fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Seguir</div>
      <WaButton pressed={pressed} full />
    </div>
  </div>
);

const WebCard: React.FC<{d: EntryPointsData; pressed: boolean}> = ({d, pressed}) => {
  const {colors} = useBrand();
  return (
    <div style={{background: colors.paper, color: colors.dark}}>
      <div style={{height: 34, background: '#ececec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14.5, color: '#555'}}>🔒 {d.web}</div>
      <div style={{padding: '18px 14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <BrandAvatar size={56} />
        <div style={{marginTop: 10, fontSize: 22, fontWeight: 300, letterSpacing: 6}}>{d.name.split(' ')[0].toUpperCase()}</div>
        <div style={{fontSize: 14.5, color: colors.muted, marginTop: 4, marginBottom: 14}}>¿Lista para tu primera clase?</div>
        <WaButton label="Escríbenos" pressed={pressed} />
      </div>
    </div>
  );
};

const QrCard: React.FC<{scan: number}> = ({scan}) => {
  const {colors} = useBrand();
  const N = 21;
  const finder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    for (const [r0, c0] of [
      [0, 0],
      [0, N - 7],
      [N - 7, 0],
    ]) {
      if (inBox(r0, c0)) {
        const rr = r - r0;
        const cc = c - c0;
        return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) ? 1 : 0;
      }
    }
    return -1;
  };
  const cell = 7.4;
  return (
    <div style={{background: '#fff', color: colors.dark, padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{fontSize: 18, fontWeight: 600, letterSpacing: 0.3}}>Escanea para reservar</div>
      <div style={{position: 'relative', marginTop: 12, width: N * cell, height: N * cell}}>
        <svg width={N * cell} height={N * cell}>
          {Array.from({length: N * N}).map((_, i) => {
            const r = Math.floor(i / N);
            const c = i % N;
            const fv = finder(r, c);
            const on = fv === -1 ? random(`qr${i}`) > 0.52 : fv === 1;
            return on ? <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill={colors.dark} /> : null;
          })}
        </svg>
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', padding: 3, background: '#fff', borderRadius: '50%'}}>
          <BrandAvatar size={34} />
        </div>
        {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: -6, right: -6, top: scan * N * cell, height: 3, background: WA, boxShadow: `0 0 12px ${WA}`}} />}
      </div>
      <div style={{fontSize: 14, color: colors.muted, marginTop: 10}}>en recepción</div>
    </div>
  );
};

const LABELS: Record<Channel, string> = {maps: 'GOOGLE MAPS', instagram: 'INSTAGRAM', web: 'TU SITIO WEB', qr: 'QR EN TU ESTUDIO'};
// posición aprox. del botón de WhatsApp dentro de cada tarjeta (relativa a la tarjeta)
const BTN: Record<Channel, {x: number; y: number}> = {maps: {x: 205, y: 209}, instagram: {x: 180, y: 114}, web: {x: 135, y: 189}, qr: {x: 137, y: 116}};

const Overlay: React.FC<{d: EntryPointsData}> = ({d}) => {
  const f = useCurrentFrame();
  const {colors, canvas} = useBrand();
  const chans = (d.channels ?? ['maps', 'instagram', 'web', 'qr']).slice(0, 4);
  const labelColor = canvas === 'light' ? colors.accentDark : colors.accentLight;
  const merge = prog(f, MERGE, MERGE + 22);
  const glow = Math.max(0, Math.min(prog(f, MERGE + 14, MERGE + 22), 1 - prog(f, MERGE + 26, MERGE + 40)));
  return (
    <AbsoluteFill style={{fontFamily: FONT, pointerEvents: 'none'}}>
      {/* líneas hacia el teléfono */}
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
        {chans.map((c, i) => {
          const s = SLOTS[i];
          const tap = TAP0 + i * TAP_STEP;
          const p = prog(f, tap + 4, tap + 22);
          const from = {x: s.x + BTN[c].x * K, y: s.y + (46 + BTN[c].y) * K};
          const len = Math.hypot(PHONE_C.x - from.x, PHONE_C.y - from.y);
          return (
            <line key={c} x1={from.x} y1={from.y} x2={PHONE_C.x} y2={PHONE_C.y} stroke={WA} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${len}`} strokeDashoffset={len * (1 - p)} opacity={0.75 * (1 - merge)} />
          );
        })}
      </svg>
      {glow > 0 && <div style={{position: 'absolute', left: PHONE_C.x - 260, top: PHONE_C.y - 260, width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(WA, 0.45 * glow)}, transparent 65%)`}} />}
      {chans.map((c, i) => {
        const s = SLOTS[i];
        const appear = prog(f, 4 + i * 6, 18 + i * 6);
        const tap = TAP0 + i * TAP_STEP;
        const pressed = c !== 'qr' && f >= tap - 1 && f < tap + 8;
        const x = lerp(s.x, PHONE_C.x - (W_CARD * K) / 2, merge);
        const y = lerp(s.y, PHONE_C.y - 160, merge);
        const ripple = prog(f, tap, tap + 14);
        const btn = {x: s.x + BTN[c].x * K, y: s.y + (46 + BTN[c].y) * K};
        return (
          <React.Fragment key={c}>
            <div style={{position: 'absolute', left: x, top: y, width: W_CARD, opacity: appear * (1 - merge), transform: `scale(${K * (0.9 + 0.1 * appear) * (1 - 0.7 * merge)}) translateY(${(1 - appear) * 20}px)`, transformOrigin: 'left top'}}>
              <div style={{fontSize: 18, fontWeight: 700, letterSpacing: 3, color: labelColor, marginBottom: 10, textAlign: 'center'}}>{LABELS[c]}</div>
              <div style={{borderRadius: 22, overflow: 'hidden', boxShadow: '0 18px 40px rgba(0,0,0,.18)'}}>
                {c === 'maps' && <MapsCard d={d} pressed={pressed} />}
                {c === 'instagram' && <InstagramCard d={d} pressed={pressed} />}
                {c === 'web' && <WebCard d={d} pressed={pressed} />}
                {c === 'qr' && <QrCard scan={prog(f, tap - 10, tap + 10)} />}
              </div>
            </div>
            {/* dedo sobre el botón de WhatsApp de cada tarjeta */}
            {c !== 'qr' && f >= tap - 12 && f < tap + 14 && merge === 0 && (
              <>
                <div style={{position: 'absolute', left: btn.x - 30, top: btn.y - 30, width: 60, height: 60, borderRadius: '50%', border: '3px solid rgba(255,255,255,.95)', transform: `scale(${0.6 + ripple * 1.2})`, opacity: f >= tap ? (1 - ripple) * 0.9 : 0}} />
                <div style={{position: 'absolute', left: btn.x - 26 + (1 - prog(f, tap - 12, tap - 2)) * 40, top: btn.y - 26 + (1 - prog(f, tap - 12, tap - 2)) * 60, width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.6)', border: '2.5px solid rgba(255,255,255,.95)', boxShadow: '0 4px 14px rgba(0,0,0,.3)', transform: `scale(${f >= tap - 2 && f <= tap + 3 ? 0.8 : 1})`, opacity: Math.min(prog(f, tap - 12, tap - 6), 1 - prog(f, tap + 8, tap + 14))}} />
              </>
            )}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** Pantalla del teléfono mientras tanto: pantalla de bloqueo con la marca. */
const LockScreen: React.FC<{d: EntryPointsData}> = ({d}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const notif = prog(f, MERGE + 14, MERGE + 26);
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg, ${colors.light}, ${colors.accentLight} 70%, ${colors.accent})`, color: colors.dark}}>
      <StatusBar time={d.time ?? '10:14'} />
      <div style={{position: 'absolute', top: 96, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontSize: 19, fontWeight: 500, opacity: 0.8}}>{d.dateLabel ?? 'miércoles, 18 de noviembre'}</div>
        <div style={{fontSize: 92, fontWeight: 300, letterSpacing: -3, lineHeight: 1.05}}>{d.time ?? '10:14'}</div>
      </div>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 0.85}}>
        <BrandAvatar size={110} />
      </div>
      {notif > 0 && (
        <div style={{position: 'absolute', left: 14, right: 14, top: 560, transform: `translateY(${(1 - notif) * 40}px) scale(${0.9 + 0.1 * notif})`, opacity: notif, borderRadius: 22, background: 'rgba(255,255,255,.85)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 30px rgba(0,0,0,.12)'}}>
          <div style={{width: 40, height: 40, borderRadius: 11, background: WA, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <WaIcon size={22} />
          </div>
          <div style={{fontSize: 16, fontWeight: 600}}>Abriendo chat con {d.name}…</div>
        </div>
      )}
      <HomeIndicator />
    </div>
  );
};

export const entryPoints = (d: EntryPointsData): PhoneScene => {
  // zoom inicial: el teléfono se hace chico para dejar espacio a las tarjetas
  const center = {x: 195, y: (PHONE_C.y - SCREEN_Y) / PS};
  return {
    id: 'entry-points',
    duration: DUR,
    enter: 'none',
    Component: () => <LockScreen d={d} />,
    Overlay: () => <Overlay d={d} />,
    zooms: [{a: -14, b: DUR + 4, ...center, s: 0.58}],
    subtitles: [
      {at: 0, text: d.subtitles?.[0] ?? 'Tus clientes llegan de donde sea…'},
      {at: MERGE, text: d.subtitles?.[1] ?? '…y todo empieza en tu WhatsApp.'},
    ],
  };
};
