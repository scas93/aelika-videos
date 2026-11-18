import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, prog} from '../core/theme';

export const NAVY = '#101a33';
const LIGHT_BG = '#f3efe9';

// Ícono: triángulo con tres nodos (recreado a partir de la referencia)
const Icon: React.FC<{size: number; sheen: number}> = ({size, sheen}) => {
  const x = -80 + sheen * 300;
  const shapes = (fill: string, stroke: string) => (
    <>
      <path d="M60 22 L22 88 L98 88 Z" fill="none" stroke={stroke} strokeWidth="15" strokeLinejoin="round" />
      <ellipse cx="60" cy="21" rx="17" ry="18.5" fill={fill} />
      <circle cx="21" cy="88" r="17.5" fill={fill} />
      <circle cx="99" cy="88" r="17.5" fill={fill} />
    </>
  );
  return (
    <svg width={size} height={size * (112 / 120)} viewBox="0 0 120 112" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="ag" x1="40" y1="0" x2="105" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0b8cf3" />
          <stop offset=".5" stopColor="#13bcc9" />
          <stop offset="1" stopColor="#9be03a" />
        </linearGradient>
        <linearGradient id="ag2" x1="0" y1="40" x2="70" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#13a8df" stopOpacity="0" />
          <stop offset="1" stopColor="#12c3bf" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id="sheen" x1={x} y1="0" x2={x + 50} y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {shapes('url(#ag)', 'url(#ag)')}
      <circle cx="21" cy="88" r="17.5" fill="url(#ag2)" />
      {sheen > 0 && sheen < 1 && shapes('url(#sheen)', 'url(#sheen)')}
    </svg>
  );
};

/** Logo animado. t = frames desde el inicio de la animación. */
export const AelikaLogo: React.FC<{t: number; scale?: number}> = ({t, scale = 1}) => {
  const {fps} = useVideoConfig();
  const ICON = 160 * scale;
  const FS = 150 * scale;
  const GAP = 30 * scale;
  const TEXT_W = 440 * scale;
  const drop = spring({frame: t - 8, fps, config: {damping: 9, stiffness: 130, mass: 0.9}});
  const land = t - 8 - 10; // aprox. primer contacto
  const squash = land > 0 && land < 10 ? Math.sin((land / 10) * Math.PI) * 0.12 : 0;
  const slide = prog(t, 34, 52);
  const sheen = prog(t, 66, 90);
  const shadowP = prog(t, 2, 22);
  const letters = Array.from('Aelika');
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: GAP, transform: `translateX(${(1 - slide) * (TEXT_W + GAP) / 2}px)`}}>
      <div style={{position: 'relative', width: ICON, height: ICON * (112 / 120)}}>
        <div
          style={{
            position: 'absolute',
            left: ICON * 0.1,
            right: ICON * 0.1,
            bottom: -ICON * 0.16,
            height: ICON * 0.09,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(60,40,30,.28), transparent)',
            opacity: shadowP,
            transform: `scaleX(${0.4 + 0.6 * drop})`,
          }}
        />
        <div style={{transform: `translateY(${(1 - drop) * -520 * scale}px) scale(${1 + squash}, ${1 - squash})`, transformOrigin: '50% 100%', opacity: t < 6 ? 0 : 1}}>
          <Icon size={ICON} sheen={sheen} />
        </div>
      </div>
      <div style={{display: 'flex', fontFamily: FONT, fontWeight: 500, fontSize: FS, color: NAVY, letterSpacing: -2 * scale, lineHeight: 1, width: TEXT_W}}>
        {letters.map((ch, i) => {
          const s = spring({frame: t - 40 - i * 4, fps, config: {damping: 10, stiffness: 160}});
          return (
            <span key={i} style={{display: 'inline-block', opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 50 * scale}px) scale(${0.4 + 0.6 * s})`, transformOrigin: '50% 100%'}}>
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const LightBg: React.FC = () => (
  <AbsoluteFill style={{background: LIGHT_BG}}>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 48%, #fbf9f6 0%, rgba(251,249,246,0) 45%)'}} />
  </AbsoluteFill>
);

export const Intro: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const out = prog(f, len - 14, len);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <LightBg />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + out * 0.08})`}}>
        <AelikaLogo t={f} scale={1.25} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Contact: React.FC<{icon: 'mail' | 'phone'; text: string; p: number}> = ({icon, text, p}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
    <div style={{width: 76, height: 76, borderRadius: 22, background: 'linear-gradient(135deg,#0b8cf3,#13bcc9 55%,#9be03a)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {icon === 'mail' ? (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
          <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" />
        </svg>
      )}
    </div>
    <div style={{fontFamily: FONT, fontSize: 52, fontWeight: 600, color: NAVY, letterSpacing: -0.5}}>{text}</div>
  </div>
);

export const AELIKA_CONTACT = {email: 'ventas@aelika.com', phone: '33 3100 6915'};

export const Outro: React.FC<{tagline?: [string, string]; email?: string; phone?: string; cta?: string}> = ({
  cta,
  tagline = ['El mostrador digital', 'de tu negocio.'],
  email = AELIKA_CONTACT.email,
  phone = AELIKA_CONTACT.phone,
}) => {
  const f = useCurrentFrame();
  const bg = prog(f, 0, 16);
  const tag = prog(f, 84, 104);
  return (
    <AbsoluteFill style={{opacity: bg}}>
      <LightBg />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <AelikaLogo t={f - 10} scale={0.95} />
        </div>
        <div style={{position: 'absolute', top: 960, left: 60, right: 60, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: Math.max(...tagline.map((t) => t.length)) > 26 ? 54 : 66, lineHeight: 1.18, letterSpacing: -1.5, color: NAVY, opacity: tag, transform: `translateY(${(1 - tag) * 26}px)`}}>
          {tagline[0]}
          <br />
          <span style={{background: 'linear-gradient(90deg,#0b8cf3,#13bcc9 50%,#7fcf33)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{tagline[1]}</span>
        </div>
        {cta && (
          <div style={{position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: prog(f, 96, 112), transform: `scale(${0.9 + 0.1 * prog(f, 96, 112)})`}}>
            <div style={{padding: '22px 56px', borderRadius: 999, background: 'linear-gradient(90deg,#0b8cf3,#13bcc9 55%,#7fcf33)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 44, boxShadow: '0 16px 36px rgba(19,140,200,.3)'}}>{cta}</div>
          </div>
        )}
        <div style={{position: 'absolute', top: cta ? 1330 : 1270, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
          <div style={{width: 120, height: 3, borderRadius: 2, background: 'rgba(16,26,51,.15)', opacity: prog(f, 100, 112)}} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 30}}>
            <Contact icon="mail" text={email} p={prog(f, 106, 124)} />
            <Contact icon="phone" text={phone} p={prog(f, 116, 134)} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Logo de Aelika estático (para interfaces dentro del teléfono). */
export const AelikaMark: React.FC<{size: number}> = ({size}) => <AelikaLogo t={300} scale={size} />;
