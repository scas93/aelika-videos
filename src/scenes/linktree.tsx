import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {HomeIndicator, ICONS as I, Icon, StatusBar} from '../core/Phone';
import {SW} from '../core/theme';
import {PhoneScene} from '../core/types';

export type LinktreeData = {
  /** logo circular tal como aparece en su Linktree */
  avatar: string;
  name: string;
  tagline: string;
  heading?: string;
  buttons: string[];
  /** índice del botón que toca el cliente */
  pick: number;
  /** emoji antes de cada botón (por defecto 📍) */
  buttonIcon?: string;
  socials?: ('instagram' | 'tiktok' | 'facebook')[];
  time?: string;
  subtitle?: string;
};

const TAP = 55;
const BTN_TOP = 474;
const BTN_STEP = 78;

const Social: React.FC<{k: 'instagram' | 'tiktok' | 'facebook'}> = ({k}) =>
  k === 'instagram' ? (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="#000" />
    </svg>
  ) : k === 'tiktok' ? (
    <svg width="30" height="32" viewBox="0 0 24 26">
      <path d="M13 2h4a5 5 0 0 0 5 5v4a9 9 0 0 1-5-1.6V17a7 7 0 1 1-7-7v4.2a3 3 0 1 0 3 2.8z" fill="#000" />
    </svg>
  ) : (
    <svg width="33" height="33" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill="#000" />
      <path d="M13.5 22v-7.5h2.6l.4-3h-3V9.6c0-.9.3-1.5 1.5-1.5h1.6V5.4a21 21 0 0 0-2.3-.1c-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V22z" fill="#fff" />
    </svg>
  );

const LinktreeScreen: React.FC<{d: LinktreeData}> = ({d}) => {
  const f = useCurrentFrame();
  const circleBtn = (child: React.ReactNode, x: number) => (
    <div style={{position: 'absolute', top: 62, left: x, width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{child}</div>
  );
  const socialsTop = BTN_TOP + d.buttons.length * BTN_STEP + 20;
  return (
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 60% at 50% 45%, #f2f2f2 0%, #d6d6d6 70%, #cfcfcf 100%)', color: '#000'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 112, background: '#dadada'}}>
        <StatusBar time={d.time ?? '7:24'} />
        {circleBtn(<Icon d={I.close} color="#111" size={22} sw={2.2} />, 14)}
        <div style={{position: 'absolute', top: 64, left: 0, right: 0, textAlign: 'center', lineHeight: 1.2}}>
          <div style={{fontWeight: 600, fontSize: 15}}>🔒 linktr.ee</div>
          <div style={{fontSize: 13.5, color: '#666'}}>Instagram</div>
        </div>
        {circleBtn(<Icon d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1" color="#111" size={22} sw={2.6} />, 290)}
        {circleBtn(<Icon d={I.dots} color="#111" size={22} sw={3} />, 336)}
      </div>
      <div style={{position: 'absolute', top: 128, left: 14, width: 42, height: 42, borderRadius: 14, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800}}>✱</div>
      <div style={{position: 'absolute', top: 128, right: 14, width: 42, height: 42, borderRadius: 14, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon d={I.share} color="#111" size={20} sw={2} />
      </div>
      <div style={{position: 'absolute', top: 226, left: (SW - 104) / 2, width: 104, height: 104, borderRadius: '50%', overflow: 'hidden', background: '#000'}}>
        <Img src={staticFile(d.avatar)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.04)'}} />
      </div>
      <div style={{position: 'absolute', top: 344, left: 0, right: 0, textAlign: 'center', fontSize: 29, fontWeight: 700, letterSpacing: -0.5}}>{d.name}</div>
      <div style={{position: 'absolute', top: 386, left: 0, right: 0, textAlign: 'center', fontSize: 15.5}}>{d.tagline}</div>
      <div style={{position: 'absolute', top: 438, left: 0, right: 0, textAlign: 'center', fontSize: 16, fontWeight: 700}}>{d.heading ?? 'AGENDA TU CITA'}</div>
      {d.buttons.map((label, i) => {
        const active = i === d.pick && f >= TAP;
        return (
          <div key={label} style={{position: 'absolute', left: 14, right: 14, top: BTN_TOP + i * BTN_STEP, height: 66, borderRadius: 10, background: active ? '#ececec' : '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16.5, fontWeight: 500, color: '#111', transform: active ? 'scale(.98)' : 'none'}}>
            {d.buttonIcon ?? '📍'} {label}
            <div style={{position: 'absolute', right: 22, top: 22, display: 'flex', flexDirection: 'column', gap: 3}}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{width: 4, height: 4, borderRadius: 2, background: '#666'}} />
              ))}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: socialsTop, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22, alignItems: 'center'}}>
        {(d.socials ?? ['instagram', 'tiktok', 'facebook']).map((k) => (
          <Social key={k} k={k} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.55))'}} />
      <HomeIndicator dark />
    </div>
  );
};

/** Linktree del negocio: el cliente toca uno de los botones. 3 s. */
export const linktree = (d: LinktreeData): PhoneScene => ({
  id: 'linktree',
  duration: 90,
  enter: 'up',
  Component: () => <LinktreeScreen d={d} />,
  taps: [{f: TAP, x: 195, y: BTN_TOP + d.pick * BTN_STEP + 33}],
  subtitles: [{at: 0, text: d.subtitle ?? 'Un toque y eliges tu sede.'}],
});
