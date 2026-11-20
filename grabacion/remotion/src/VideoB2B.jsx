import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import timeline from './timeline_b2b.json';
import LOGO from './logo.json';

// ---------------------------------------------------------------- layout
const FPS = 30;
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
  // chat -> (slide up) login -> (cut) order flow -> (fade) chat
  const [intro, login, app, outro] = timeline.segments;
  const out = [];
  let start = Math.round(TITLE_END * FPS);
  out.push({ ...intro, start, len: segLen(intro), enter: 'none' });
  start = start + segLen(intro) - Math.round(T_APP * FPS);
  out.push({ ...login, start, len: segLen(login), enter: 'slideup' });
  start = start + segLen(login);
  out.push({ ...app, start, len: segLen(app), enter: 'cut' });
  start = start + segLen(app) - Math.round(T_OUTRO * FPS);
  out.push({ ...outro, start, len: segLen(outro), enter: 'fade' });
  return out;
})();
const OUTRO = SEG[3];
const CLOSING_START = OUTRO.start + OUTRO.len - Math.round(CLOSING_OVERLAP * FPS);
export const DURATION_B2B = CLOSING_START + Math.round(CLOSING * FPS);

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
// "Igual que lun 16" highlights: one per spotlight clip, ends shortly after the tap on the button
const SPOTS = (() => {
  const app = SEG.find((s) => s.id === 'app');
  let acc = app.start;
  const out = [];
  for (const c of app.clips) {
    const len = clipLen(c);
    if (c.spotlight) {
      const tap = EVENTS.find((e) => e.seg === 'app' && e.type === 'tap' && e.f >= acc && e.f <= acc + len);
      out.push({ from: acc, tap: tap.f, x: tap.x, y: tap.y });
    }
    acc += len;
  }
  return out;
})();
const CAPTIONS = [
  { n: '1', text: 'El cliente escribe por WhatsApp', f: SEG[0].start + 16 },   // after the phone has landed
  { n: '2', text: 'Entra con un código por WhatsApp', f: SEG[1].start + 6 },
  { n: '3', text: 'Elige la semana y los días de entrega', f: markFrame('week') - 8 },
  { n: '4', text: 'Arma el pedido del lunes', f: markFrame('products') - 8 },
  { n: '5', text: 'Copia el lunes a los demás días', f: SPOTS[0].from - 6 },
  { n: '6', text: 'Revisa y envía el pedido', f: markFrame('summary') - 8 },
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
  const prodTaps = appTaps.filter((e) => e.f > markFrame('products') && e.f < markFrame('summary'));
  const [send, option, menu] = introTaps;
  return [
    // 1. whole WhatsApp conversation: stays zoomed in, only pans vertically
    //    composer/keyboard -> bot options ("Hacer pedido") -> "Ver menú"
    { a: keys[0].f - 0.3 * s, b: SEG[1].start, fyKeys: [
      [send.f + 0.5 * s, 640], [option.f - 0.6 * s, option.y + 20],
      [option.f + 0.7 * s, option.y + 20], [menu.f - 0.5 * s, menu.y]] },
    // 2. building the day's order: quantities + "Igual que lun 16"
    { a: prodTaps[0].f - 0.6 * s, b: prodTaps[prodTaps.length - 2].f + 0.5 * s, fy: 400 },
  ];
})();
const ease = Easing.inOut(Easing.cubic);
const CAMERA = (() => {
  const res = [];
  let fy = SHOTS[0].fy;
  for (let f = 0; f < DURATION_B2B; f++) {
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

const Logo = ({ width = 700 }) => (
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
        if (seg.enter === 'slideup') {
          const p = interpolate(local, [0, T_APP * FPS], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
          style = { transform: `translateY(${(1 - p) * 100}%)` };
        }
        if (seg.enter === 'fade') {
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
      <AutofillOverlay />
      <CopySpotlight />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- spotlight on "Igual que lun 16"
const CopySpotlight = () => {
  const frame = useCurrentFrame();
  const sp = SPOTS.find((s) => frame >= s.from - 2 && frame <= s.tap + 16);
  if (!sp) return null;
  const k = PT;
  const v = interpolate(frame, [sp.from, sp.from + 7, sp.tap + 5, sp.tap + 14], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulse = 0.5 + 0.5 * Math.sin(((frame - sp.from) / 14) * Math.PI * 2);
  const bw = 324, bh = 40;
  const left = (sp.x - bw / 2) * k, top = (sp.y - bh / 2) * k;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: v }}>
      <div style={{ position: 'absolute', left, top, width: bw * k, height: bh * k, borderRadius: 12 * k, boxShadow: '0 0 0 2000px rgba(10,10,12,.5)' }} />
      <div style={{ position: 'absolute', left: left - (4 + 4 * pulse) * k, top: top - (4 + 4 * pulse) * k, width: (bw + 8 + 8 * pulse) * k, height: (bh + 8 + 8 * pulse) * k,
        borderRadius: (15 + 4 * pulse) * k, border: `${2.5 * k}px solid rgba(255,214,90,${0.95 - 0.5 * pulse})`, boxShadow: `0 0 ${18 * k}px rgba(255,200,60,.55)` }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- simulated WhatsApp code notification + iOS one-time-code autofill
const LOGIN = SEG[1];
const AF_START = LOGIN.start + clipLen(LOGIN.clips[0]);           // freeze clip starts here
const AF_LEN = clipLen(LOGIN.clips[1]);
const AF = { bannerIn: 3, bannerOut: 38, fieldTap: 25, kbUp: 28, sugTap: 48, kbDown: AF_LEN + 2 };
const u = (pt) => pt * PT;                                        // iPhone points -> screen px
const Dot = ({ x, y, f, at }) => {
  const v = interpolate(f, [at - 6, at - 3, at, at + 3, at + 6], [0, 1, 0.82, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const press = f >= at - 1 && f <= at + 2;
  return <div style={{ position: 'absolute', left: u(x) - u(22), top: u(y) - u(22), width: u(44), height: u(44), borderRadius: '50%',
    background: press ? 'rgba(30,30,30,.4)' : 'rgba(30,30,30,.28)', border: `${u(2)}px solid rgba(255,255,255,.85)`, boxShadow: '0 2px 10px rgba(0,0,0,.25)',
    opacity: v > 0 ? 1 : 0, transform: `scale(${0.6 + 0.4 * Math.min(1, v * 1.4)})` }} />;
};
const AutofillOverlay = () => {
  const frame = useCurrentFrame();
  const f = frame - AF_START;
  if (f < 0 || f > AF_LEN + 14) return null;
  const field = LOGIN.field, code = LOGIN.code;
  const bannerY = interpolate(f, [AF.bannerIn, AF.bannerIn + 10, AF.bannerOut, AF.bannerOut + 9], [-140, 0, 0, -140],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.9, 0.2, 1) });
  const kb = interpolate(f, [AF.kbUp, AF.kbUp + 9, AF.kbDown, AF.kbDown + 9], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const KB_H = 300;                                              // pt, incl. suggestion bar + home area
  const sugPressed = f >= AF.sugTap - 1 && f <= AF.sugTap + 4;
  const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['', ''], ['0', ''], ['⌫', '']];
  return (
    <AbsoluteFill style={{ fontFamily: 'Inter, "Noto Color Emoji", sans-serif' }}>
      {/* notification banner */}
      <div style={{ position: 'absolute', left: u(9), top: u(52), width: u(372), transform: `translateY(${u(bannerY)}px)`, borderRadius: u(22),
        background: 'rgba(246,246,248,.97)', boxShadow: `0 ${u(8)}px ${u(24)}px rgba(0,0,0,.18)`, padding: `${u(12)}px ${u(14)}px`, display: 'flex', gap: u(10) }}>
        <div style={{ width: u(38), height: u(38), borderRadius: u(9), background: '#25D366', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={u(24)} height={u(24)} viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="#fff" /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: u(14.5), fontWeight: 600, color: '#111' }}>
            <span>Panadería Banetto</span><span style={{ fontWeight: 400, color: '#8a8a8e', fontSize: u(13) }}>ahora</span>
          </div>
          <div style={{ fontSize: u(14), color: '#222', lineHeight: 1.3, marginTop: u(1) }}><b>{code}</b> es tu código para entrar a Banetto Mayoreo. No lo compartas.</div>
        </div>
      </div>
      {/* iOS numeric keyboard with one-time-code suggestion */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: u(KB_H), transform: `translateY(${(1 - kb) * 100}%)`, background: '#D3D5DB' }}>
        <div style={{ height: u(46), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ padding: `${u(3)}px ${u(26)}px`, borderRadius: u(8), background: sugPressed ? 'rgba(255,255,255,.9)' : 'transparent', textAlign: 'center', lineHeight: 1.15 }}>
            <div style={{ fontSize: u(11.5), color: '#555' }}>De WhatsApp</div>
            <div style={{ fontSize: u(17), fontWeight: 600, color: '#000', letterSpacing: u(0.5) }}>{code}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: u(6), padding: `${u(2)}px ${u(6)}px` }}>
          {KEYS.map(([k, l], i) => (
            <div key={i} style={{ height: u(46), borderRadius: u(5), background: k && k !== '⌫' ? '#fff' : 'transparent', boxShadow: k && k !== '⌫' ? '0 1px 0 rgba(0,0,0,.3)' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
              <span style={{ fontSize: u(k === '⌫' ? 22 : 25), lineHeight: 1 }}>{k}</span>
              {l ? <span style={{ fontSize: u(9.5), fontWeight: 600, letterSpacing: u(1.5), marginTop: u(1) }}>{l}</span> : null}
            </div>
          ))}
        </div>
      </div>
      <Dot x={field.x} y={field.y} f={f} at={AF.fieldTap} />
      <Dot x={195} y={844 - KB_H + 23} f={f} at={AF.sugTap} />
      {/* sounds: notification, tap on the field, tap on the suggestion */}
      <Sequence from={AF_START + AF.bannerIn + 2} durationInFrames={20} layout="none"><Audio src={staticFile('receive.wav')} volume={0.7} /></Sequence>
      <Sequence from={AF_START + AF.fieldTap} durationInFrames={10} layout="none"><Audio src={staticFile('tap.wav')} volume={0.7} /></Sequence>
      <Sequence from={AF_START + AF.sugTap} durationInFrames={10} layout="none"><Audio src={staticFile('tap.wav')} volume={0.7} /></Sequence>
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
export const MainB2B = ({ closingText }) => {
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
