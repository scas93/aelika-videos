import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Intro, Outro} from '../aelika/Aelika';
import {Addons, addonsDuration} from '../scenes/addons';
import {BrandProvider, useBrand} from './brand';
import {Finger, Phone} from './Phone';
import {FONT, H, SW, W, prog, rgba, toCanvas, win} from './theme';
import {Enter, Tap, VideoConfig, Zoom} from './types';

// Tiempos fijos de la plantilla (30 fps)
export const INTRO_LEN = 124;
export const FLOW_START = 110; // el flujo arranca mientras se desvanece el intro
export const OUTRO_LEN = 190;
const OVERLAP = 14; // cada pantalla nueva entra encima de la anterior

/** Calcula la línea de tiempo completa a partir de la configuración. */
export const buildTimeline = (cfg: VideoConfig) => {
  let t = 0;
  const scenes = cfg.scenes.map((s) => {
    const start = t;
    t += s.duration;
    return {...s, start};
  });
  const phoneEnd = t;
  const addonsLen = cfg.addons ? addonsDuration(cfg.addons.items.length) : 0;
  const outroStart = phoneEnd + addonsLen;
  const taps: Tap[] = scenes.flatMap((s) => (s.taps ?? []).map((tp) => ({...tp, f: tp.f + s.start})));
  const zooms: Zoom[] = scenes.flatMap((s) => (s.zooms ?? []).map((z) => ({...z, a: z.a + s.start, b: z.b + s.start})));
  const subs = scenes.flatMap((s) =>
    (s.subtitles ?? []).map((sub, i, arr) => ({a: s.start + sub.at, b: s.start + (arr[i + 1]?.at ?? s.duration), text: sub.text})),
  );
  return {scenes, phoneEnd, addonsLen, outroStart, taps, zooms, subs, total: FLOW_START + outroStart + OUTRO_LEN};
};

export const videoDuration = (cfg: VideoConfig) => buildTimeline(cfg).total;

// ------------------------------------------------------------------ piezas
const EnterAnim: React.FC<{kind: Enter; children: React.ReactNode}> = ({kind, children}) => {
  const f = useCurrentFrame();
  const p = kind === 'none' ? 1 : prog(f, 0, 12);
  const t = kind === 'left' ? `translateX(${(1 - p) * SW}px)` : kind === 'up' ? `translateY(${(1 - p) * 120}px)` : 'none';
  return <div style={{position: 'absolute', inset: 0, transform: t, opacity: kind === 'left' ? 1 : p}}>{children}</div>;
};

const Camera: React.FC<{zooms: Zoom[]; exitAt: number; children: React.ReactNode}> = ({zooms, exitAt, children}) => {
  const f = useCurrentFrame();
  let s = 1;
  let dx = 0;
  let dy = 0;
  let origin = '540px 900px';
  for (const z of zooms) {
    const p = Math.min(prog(f, z.a, z.a + 14), 1 - prog(f, z.b - 12, z.b));
    if (p > 0) {
      const P = toCanvas(z.x, z.y);
      origin = `${P.x}px ${P.y}px`;
      s = 1 + (z.s - 1) * p;
      dx = (540 - P.x) * p * 0.25;
      dy = (880 - P.y) * p;
    }
  }
  const out = prog(f, exitAt, exitAt + 24);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <AbsoluteFill style={{transform: `translate(${dx}px, ${dy + out * 240}px) scale(${s * (1 - out * 0.25)})`, transformOrigin: origin}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Subtitles: React.FC<{subs: {a: number; b: number; text: string}[]}> = ({subs}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const sc = subs.find((s) => f >= s.a && f < s.b);
  if (!sc || !sc.text) return null;
  const p = win(f, sc.a, sc.b, 8, 6);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1718, display: 'flex', justifyContent: 'center', zIndex: 20}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 44,
          color: colors.light,
          padding: '20px 40px',
          borderRadius: 999,
          background: rgba(colors.dark, 0.8),
          border: `1.5px solid ${rgba(colors.accentLight, 0.4)}`,
          boxShadow: '0 12px 30px rgba(0,0,0,.35)',
          opacity: p,
          transform: `translateY(${(1 - p) * 18}px)`,
          letterSpacing: -0.4,
          maxWidth: 980,
          textAlign: 'center',
        }}
      >
        {sc.text}
      </div>
    </div>
  );
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const gx = 50 + Math.sin(f / 90) * 12;
  return (
    <AbsoluteFill style={{background: `linear-gradient(165deg, ${colors.dark} 0%, ${colors.dark2} 38%, ${colors.accentDark} 85%, ${colors.accent} 125%)`}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${gx}% 72%, ${rgba(colors.accentLight, 0.28)}, transparent 55%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,.05), transparent 40%)'}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ video
const Flow: React.FC<{cfg: VideoConfig}> = ({cfg}) => {
  const tl = buildTimeline(cfg);
  const last = tl.scenes.length - 1;
  return (
    <AbsoluteFill>
      <Background />
      <Sequence durationInFrames={tl.phoneEnd + 30} layout="none">
        <Camera zooms={tl.zooms} exitAt={tl.phoneEnd}>
          <Phone>
            {tl.scenes.map((s, i) => (
              <Sequence key={s.id + i} from={s.start} durationInFrames={s.duration + (i === last ? 30 : OVERLAP)} layout="none">
                <EnterAnim kind={i === 0 ? 'none' : s.enter ?? 'up'}>
                  <s.Component />
                </EnterAnim>
              </Sequence>
            ))}
            <Finger taps={tl.taps} />
          </Phone>
        </Camera>
      </Sequence>
      {cfg.addons && (
        <Sequence from={tl.phoneEnd} durationInFrames={tl.addonsLen + 20} layout="none">
          <Addons {...cfg.addons} len={tl.addonsLen} />
        </Sequence>
      )}
      <Sequence from={tl.outroStart} layout="none">
        <Outro {...cfg.outro} />
      </Sequence>
      <Subtitles subs={tl.subs} />
    </AbsoluteFill>
  );
};

export const VideoTemplate: React.FC<{cfg: VideoConfig}> = ({cfg}) => (
  <BrandProvider brand={cfg.brand}>
    <AbsoluteFill style={{width: W, height: H, fontFamily: FONT, overflow: 'hidden', background: '#f3efe9'}}>
      <Sequence from={FLOW_START} layout="none">
        <Flow cfg={cfg} />
      </Sequence>
      <Sequence durationInFrames={INTRO_LEN} layout="none">
        <Intro len={INTRO_LEN} />
      </Sequence>
    </AbsoluteFill>
  </BrandProvider>
);
