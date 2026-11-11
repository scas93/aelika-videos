import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import timeline from './timeline.json';
import LOGO from './logo.json';

// ---------------------------------------------------------------- layout
export const FPS = 30;
const W = 1080, H = 1920;
const PT = 574 / 390;                 // screen px per iPhone point
const SCR_W = 574, SCR_H = Math.round(844 * PT);
const BEZ = 18;
const PHONE_W = SCR_W + BEZ * 2, PHONE_H = SCR_H + BEZ * 2;
// phone sits above the step caption; even at full zoom (scaled from PHONE_CY) the whole phone stays in frame
const PHONE_CY = 862;
const PHONE_X = (W - PHONE_W) / 2, PHONE_Y = PHONE_CY - PHONE_H / 2;
const SCR_X = PHONE_X + BEZ, SCR_Y = PHONE_Y + BEZ;

const C = { bg: '#F4F1EC', ink: '#141414', muted: '#6b665f', accent: '#076986' };

// ---------------------------------------------------------------- timing
const TITLE_END = 3.1;          // intro chat starts here (after the logo intro)
const T_APP = 0.4;              // slide-up overlap chat -> app
const T_OUTRO = 0.35;           // crossfade app -> chat
const CLOSING = 1.6;            // closing card length
const CLOSING_OVERLAP = 0.5;

const clipLen = (c) => Math.round(((c.to - c.from) / c.speed) * FPS);
const segLen = (s) => s.clips.reduce((a, c) => a + clipLen(c), 0);

const SEG = (() => {
  const [intro, app, outro] = timeline.segments;
  const out = [];
  let start = Math.round(TITLE_END * FPS);
  out.push({ ...intro, start, len: segLen(intro) });
  start = start + segLen(intro) - Math.round(T_APP * FPS);
  out.push({ ...app, start, len: segLen(app) });
  start = start + segLen(app) - Math.round(T_OUTRO * FPS);
  out.push({ ...outro, start, len: segLen(outro) });
  return out;
})();
const OUTRO = SEG[2];
const CLOSING_START = OUTRO.start + OUTRO.len - Math.round(CLOSING_OVERLAP * FPS);
export const DURATION = CLOSING_START + Math.round(CLOSING * FPS);

// source time (s) inside a segment -> global frame (or null if cut out)
function toFrame(seg, t) {
  let acc = seg.start;
  for (const c of seg.clips) {
    if (t >= c.from && t <= c.to) return acc + ((t - c.from) / c.speed) * FPS;
    acc += clipLen(c);
  }
  return null;
}
const EVENTS = SEG.flatMap((s) => s.events.map((e) => ({ ...e, seg: s.id, f: toFrame(s, e.t) })))
  .filter((e) => e.f !== null).sort((a, b) => a.f - b.f);

// ---------------------------------------------------------------- captions
const markFrame = (label) => EVENTS.find((e) => e.label === label)?.f;
const CAPTIONS = [
  { n: '1', text: 'El cliente escribe por WhatsApp', f: SEG[0].start + 16 },   // after the phone has landed
  { n: '2', text: 'Elige sus productos en el menú', f: SEG[1].start + 4 },
  { n: '3', text: 'Deja sus datos de contacto', f: markFrame('data') - 12 },
  { n: '4', text: 'Elige entrega, día y hora', f: markFrame('delivery') - 12 },
  { n: '5', text: 'Paga con tarjeta', f: markFrame('pay') - 12 },
  { n: '✓', text: 'Recibe la confirmación por WhatsApp', f: OUTRO.start + 6 },
].map((c) => ({ ...c, f: Math.round(c.f) }));

// ---------------------------------------------------------------- camera (precomputed, deterministic)
// A few deliberate, static close-ups ("shots") instead of following every tap.
const ZOOM = 1.25;
const RAMP = Math.round(0.7 * FPS);          // slow ease in/out of each close-up
const FOCUS_TO = { x: W / 2, y: 1120 };
const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const SHOTS = (() => {
  const s = FPS;
  const keys = EVENTS.filter((e) => e.seg === 'intro' && e.type === 'key');
  const introTaps = EVENTS.filter((e) => e.seg === 'intro' && e.type === 'tap');
  const appTaps = EVENTS.filter((e) => e.seg === 'app' && e.type === 'tap');
  const payTaps = appTaps.filter((e) => e.f > markFrame('pay'));
  const card = payTaps.slice(2);               // card number, expiry, cvc, "Pagar"
  const [send, option, menu] = introTaps;
  return [
    // 1. whole WhatsApp conversation: stays zoomed in, only pans vertically
    //    composer/keyboard -> bot options ("Hacer pedido") -> "Ver menú"
    { a: keys[0].f - 0.3 * s, b: SEG[1].start, fyKeys: [
      [send.f + 0.5 * s, 640], [option.f - 0.6 * s, option.y + 20],
      [option.f + 0.7 * s, option.y + 20], [menu.f - 0.5 * s, menu.y]] },
    // 3. adding the two products
    { a: appTaps[0].f - 0.6 * s, b: appTaps[1].f + 0.6 * s, fy: avg(appTaps.slice(0, 2).map((e) => e.y)) },
    // 4. filling in the card and paying
    { a: card[0].f - 0.5 * s, b: card[card.length - 1].f + 0.5 * s, fy: avg(card.map((e) => e.y)) },
  ];
})();
const ease = Easing.inOut(Easing.cubic);
const CAMERA = (() => {
  const res = [];
  let fy = SHOTS[0].fy;
  for (let f = 0; f < DURATION; f++) {
    let w = 0;
    for (const sh of SHOTS) {
      const v = interpolate(f, [sh.a - RAMP, sh.a, sh.b, sh.b + RAMP], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
      if (v > w) {
        w = v;
        fy = sh.fyKeys
          ? interpolate(f, sh.fyKeys.map((k) => k[0]), sh.fyKeys.map((k) => k[1]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
          : sh.fy;
      }
    }
    res.push({ s: 1 + (ZOOM - 1) * w, fx: 195, fy });
  }
  return res;
})();

// ---------------------------------------------------------------- components
const Background = () => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 55%, #FBF9F6 0%, ${C.bg} 60%, #EDE8E0 100%)` }} />
);

export const Logo = ({ width = 700 }) => (
  <Img src={staticFile('logo/aelika_full.png')} style={{ width, height: width * LOGO.h / LOGO.w }} />
);

// ---------------------------------------------------------------- logo intro (playful drop + bounce + letter pops + shine)
const L_LAND = 13;                    // frame the icon hits the "floor"
const L_SLIDE = L_LAND + 9;           // icon slides left, letters pop out
const L_SHINE = L_LAND + 28;          // shine sweep + chime
const L_OUT = 84;                     // logo leaves as the phone comes in
const INTRO_SFX = [
  { f: L_LAND, src: 'intro_land.wav', v: 0.9 },
  ...LOGO.parts.slice(1).map((p, i) => ({ f: L_SLIDE + 3 + i * 3, src: `intro_pop${i}.wav`, v: 0.75 })),
  { f: L_SHINE, src: 'intro_chime.wav', v: 0.8 },
];
const LogoIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const K = 820 / LOGO.w;                         // logo display scale
  const LW = LOGO.w * K, LH = LOGO.h * K;
  const icon = LOGO.parts[0];
  // icon: gravity fall, landing squash, one small hop
  const fall = interpolate(frame, [3, L_LAND], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) });
  const hop = frame > L_LAND && frame < L_LAND + 9 ? Math.sin(Math.PI * (frame - L_LAND) / 9) : 0;
  const iy = -1100 * (1 - fall) - 70 * hop;
  const squash = interpolate(frame, [L_LAND - 1, L_LAND + 2, L_LAND + 5, L_LAND + 9, L_LAND + 11, L_LAND + 14], [1, 0.74, 1.1, 1, 0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // icon starts centered, then springs to its place on the left
  const slide = spring({ frame: frame - L_SLIDE, fps, config: { damping: 13, stiffness: 160 } });
  const iconCenteredX = (LW - icon.w * K) / 2;
  const ix = iconCenteredX + (icon.x * K - iconCenteredX) * slide;
  // whole logo exits
  const out = interpolate(frame, [L_OUT, L_OUT + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const shine = interpolate(frame, [L_SHINE - 2, L_SHINE + 12], [-0.4, 1.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - out, transform: `translateY(${-90 * out}px) scale(${1 - 0.1 * out})` }}>
      <div style={{ position: 'relative', width: LW, height: LH, marginTop: -60 }}>
        {/* soft contact shadow under the icon */}
        <div style={{ position: 'absolute', left: ix + icon.w * K * 0.1, top: LH - 6, width: icon.w * K * 0.8, height: 22, borderRadius: '50%',
          background: 'rgba(40,30,20,.18)', filter: 'blur(6px)', opacity: fall * (1 - slide * 0.6), transform: `scaleX(${0.6 + 0.4 * fall + (1 - squash) * 0.8})` }} />
        <Img src={staticFile('logo/icon.png')} style={{ position: 'absolute', left: ix, top: 0, width: icon.w * K, height: LH,
          transform: `translateY(${iy}px) scale(${2 - squash}, ${squash})`, transformOrigin: '50% 100%' }} />
        {LOGO.parts.slice(1).map((p, i) => {
          const s = spring({ frame: frame - (L_SLIDE + 3 + i * 3), fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
          return (
            <Img key={p.name} src={staticFile(`logo/${p.name}.png`)} style={{ position: 'absolute', left: p.x * K, top: 0, width: p.w * K, height: LH,
              opacity: Math.min(1, s * 3), transform: `translateY(${(1 - s) * 50}px) scale(${s})`, transformOrigin: '50% 100%' }} />
          );
        })}
        {/* shine sweep, masked to the logo shape */}
        <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${staticFile('logo/aelika_full.png')})`, WebkitMaskSize: '100% 100%',
          maskImage: `url(${staticFile('logo/aelika_full.png')})`, maskSize: '100% 100%', opacity: frame >= L_SHINE - 2 ? 1 : 0,
          background: `linear-gradient(105deg, transparent ${shine * 100 - 18}%, rgba(255,255,255,.85) ${shine * 100}%, transparent ${shine * 100 + 18}%)` }} />
      </div>
    </AbsoluteFill>
  );
};

const Screen = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SEG.map((seg) => {
        let acc = 0;
        const local = frame - seg.start;
        let style = {};
        if (seg.id === 'app') {
          const p = interpolate(local, [0, T_APP * FPS], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
          style = { transform: `translateY(${(1 - p) * 100}%)` };
        }
        if (seg.id === 'outro') {
          style = { opacity: interpolate(local, [0, T_OUTRO * FPS], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) };
        }
        return (
          <Sequence key={seg.id} from={seg.start} durationInFrames={seg.len + (seg.id === 'outro' ? 999 : 0)} layout="none">
            <AbsoluteFill style={style}>
              {seg.clips.map((c, i) => {
                const from = acc; acc += clipLen(c);
                const last = i === seg.clips.length - 1;
                return (
                  <Sequence key={i} from={from} durationInFrames={clipLen(c) + (last && seg.id === 'outro' ? 999 : 0)} layout="none">
                    <OffthreadVideo src={staticFile(seg.src)} trimBefore={Math.round(c.from * FPS)} playbackRate={c.speed} muted
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                  </Sequence>
                );
              })}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const Phone = () => (
  <div style={{ position: 'absolute', left: PHONE_X, top: PHONE_Y, width: PHONE_W, height: PHONE_H }}>
    {/* side buttons */}
    {[[-6, 240, 78], [-6, 340, 78], [PHONE_W, 300, 136]].map(([x, y, h], i) => (
      <div key={i} style={{ position: 'absolute', left: x, top: y, width: 6, height: h, borderRadius: 3, background: '#3a3a3c' }} />
    ))}
    <div style={{ position: 'absolute', inset: 0, borderRadius: 92, background: '#0c0c0d', boxShadow: '0 0 0 4px #3b3b3e, 0 60px 90px -30px rgba(80,60,40,.45), 0 20px 40px -20px rgba(0,0,0,.35)' }} />
    <div style={{ position: 'absolute', left: BEZ, top: BEZ, width: SCR_W, height: SCR_H, borderRadius: 75, overflow: 'hidden', background: '#000' }}>
      <Screen />
      <div style={{ position: 'absolute', left: SCR_W / 2 - 92, top: 16, width: 184, height: 54, borderRadius: 27, background: '#000' }} />
    </div>
  </div>
);

const Caption = ({ n, text, enter, exit, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pin = spring({ frame: frame - enter, fps, config: { damping: 18, stiffness: 140 } });
  const pout = exit == null ? 0 : interpolate(frame, [exit, exit + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const done = n === '✓';
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center',
      opacity: pin * (1 - pout), transform: `translateY(${(1 - pin) * 40 - pout * 30}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '16px 34px 16px 18px', borderRadius: 999, background: '#fff',
        boxShadow: '0 10px 30px -12px rgba(60,40,20,.25)' }}>
        <div style={{ width: 66, height: 66, borderRadius: 33, background: done ? '#1f9d55' : C.ink, color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter Display', fontWeight: 700, fontSize: 34 }}>{n}</div>
        <div style={{ fontFamily: 'Inter Display', fontWeight: 650, fontSize: 42, color: C.ink, letterSpacing: -0.5, whiteSpace: 'nowrap' }}>{text}</div>
      </div>
    </div>
  );
};

const Sfx = () => (
  <>
    {EVENTS.map((e, i) => {
      const map = { tap: ['tap.wav', 0.7], key: ['key.wav', 0.5], msg_out: ['send.wav', 0.6], msg_in: ['receive.wav', 0.7] }[e.type];
      if (!map || e.f >= CLOSING_START) return null;
      return (
        <Sequence key={i} from={Math.round(e.f)} durationInFrames={15} layout="none">
          <Audio src={staticFile(map[0])} volume={map[1]} />
        </Sequence>
      );
    })}
  </>
);

// ---------------------------------------------------------------- main
export const Main = ({ logo, closingText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // phone entrance (right after the logo intro)
  const enter = spring({ frame: frame - Math.round(3.05 * fps), fps, config: { damping: 16, stiffness: 90, mass: 0.9 } });
  // closing
  const close = interpolate(frame, [CLOSING_START, CLOSING_START + 0.5 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const closeIn = spring({ frame: frame - CLOSING_START - 6, fps, config: { damping: 18 } });

  const cam = CAMERA[Math.min(frame, CAMERA.length - 1)];
  const enterY = (1 - enter) * 1900;
  // step caption hugs the bottom edge of the phone (follows the zoom)
  const capTop = PHONE_CY + (PHONE_H / 2) * cam.s + 40;
  const closeScale = 1 - close * 0.12;

  return (
    <AbsoluteFill>
      <Background />
      {/* phone with camera */}
      <AbsoluteFill style={{ opacity: 1 - close, transform: `translateY(${enterY + close * 80}px) scale(${closeScale})`, transformOrigin: '50% 60%' }}>
        <AbsoluteFill style={{ transform: `scale(${cam.s})`, transformOrigin: `${W / 2}px ${PHONE_CY}px` }}>
          <Phone />
        </AbsoluteFill>
      </AbsoluteFill>
      {/* step captions */}
      {CAPTIONS.map((c, i) => {
        const next = CAPTIONS[i + 1];
        const exit = next ? next.f - 10 : CLOSING_START;
        if (frame < c.f - 2 || frame > exit + 10) return null;
        return <Caption key={i} {...c} enter={c.f} exit={exit} top={capTop} />;
      })}
      {/* logo intro */}
      {frame < L_OUT + 12 && <LogoIntro />}
      {INTRO_SFX.map((e, i) => (
        <Sequence key={'isfx' + i} from={e.f} durationInFrames={40} layout="none"><Audio src={staticFile(e.src)} volume={e.v} /></Sequence>
      ))}
      {/* closing */}
      {frame >= CLOSING_START && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 40, opacity: closeIn, transform: `scale(${0.92 + closeIn * 0.08})` }}>
          <Logo width={720} />
          {closingText ? <div style={{ fontFamily: 'Inter Display', fontWeight: 600, fontSize: 52, color: C.muted, textAlign: 'center' }}>{closingText}</div> : null}
        </AbsoluteFill>
      )}
      <Sfx />
    </AbsoluteFill>
  );
};
