import React from 'react';
import {AbsoluteFill, Audio, Freeze, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AelikaMark, Intro, Outro} from '../aelika/Aelika';
import {BrandAvatar} from './Phone';
import {Addons, addonsDuration} from '../scenes/addons';
import {BrandProvider, useBrand} from './brand';
import {Finger, Phone} from './Phone';
import {FONT, H, SW, W, prog, rgba, toCanvas, win} from './theme';
import {Enter, NarrationAnchor, Tap, VideoConfig, Zoom} from './types';

// Tiempos fijos de la plantilla (30 fps)
export const INTRO_LEN = 124;
export const FLOW_START = 110; // el flujo arranca mientras se desvanece el intro
export const OUTRO_LEN = 190;
const OVERLAP = 14;
export const COVER_LEN = 18; // portada/miniatura al inicio // cada pantalla nueva entra encima de la anterior

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
  return {scenes, phoneEnd, addonsLen, outroStart, taps, zooms, subs, total: (cfg.cover ? COVER_LEN : 0) + FLOW_START + outroStart + OUTRO_LEN};
};

export const videoDuration = (cfg: VideoConfig) => buildTimeline(cfg).total;

/** Frame absoluto (en el video completo) de un ancla de narración. */
export const narrationAnchorFrame = (cfg: VideoConfig, a: NarrationAnchor) => {
  const tl = buildTimeline(cfg);
  const lead = cfg.cover ? COVER_LEN : 0;
  if (a === 'intro') return lead;
  if (a === 'addons') return lead + FLOW_START + tl.phoneEnd;
  if (a === 'outro') return lead + FLOW_START + tl.outroStart;
  if (typeof a === 'number') return lead + FLOW_START + tl.scenes[a].start;
  const sc = tl.scenes[a.scene];
  const m = sc.marks?.[a.mark];
  if (m === undefined) throw new Error(`La escena ${a.scene} (${sc.id}) no tiene la marca "${a.mark}". Marcas: ${Object.keys(sc.marks ?? {}).join(', ')}`);
  return lead + FLOW_START + sc.start + m;
};

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
          fontSize: sc.text.length > 36 ? 38 : 44,
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
  const {colors, canvas} = useBrand();
  const gx = 50 + Math.sin(f / 90) * 12;
  if (canvas === 'light') {
    return (
      <AbsoluteFill style={{background: `linear-gradient(165deg, ${colors.paper} 0%, ${colors.light} 45%, ${colors.accentLight} 120%)`}}>
        <AbsoluteFill style={{background: `radial-gradient(circle at ${gx}% 70%, ${rgba(colors.accent, 0.22)}, transparent 55%)`}} />
      </AbsoluteFill>
    );
  }
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
      {tl.scenes.map((s, i) =>
        s.Overlay ? (
          <Sequence key={'ov' + i} from={s.start} durationInFrames={s.duration + 20} layout="none">
            <s.Overlay />
          </Sequence>
        ) : null,
      )}
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

/** Música con entrada suave y salida desvanecida al final del video. */
const Music: React.FC<{cfg: VideoConfig}> = ({cfg}) => {
  if (!cfg.music) return null;
  const total = videoDuration(cfg);
  const vol = cfg.music.volume ?? 0.8;
  return (
    <Audio
      src={staticFile(cfg.music.src)}
      startFrom={Math.round((cfg.music.startAt ?? 0) * 30)}
      volume={(f) => vol * interpolate(f, [0, 15, total - 60, total - 2], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
  );
};

/** Narración: cada clip suena desde el inicio de su ancla (+ offset). */
const Narration: React.FC<{cfg: VideoConfig}> = ({cfg}) => {
  if (!cfg.narration) return null;
  const tl = buildTimeline(cfg);
  const lead = cfg.cover ? COVER_LEN : 0;
  const anchorFrame = (a: NarrationAnchor) => narrationAnchorFrame(cfg, a);
  return (
    <>
      {cfg.narration.clips.map((c, i) => (
        <Sequence key={i} from={anchorFrame(c.anchor) + Math.round((c.offset ?? 0) * 30)} layout="none">
          <Audio src={staticFile(c.src)} volume={cfg.narration!.volume ?? 1} />
        </Sequence>
      ))}
    </>
  );
};

/** Portada: primer frame del video (miniatura en WhatsApp). */
const Cover: React.FC<{cover: NonNullable<VideoConfig['cover']>; outro?: VideoConfig['outro']}> = ({cover, outro}) => {
  const f = useCurrentFrame();
  if (cover.useOutro) {
    return (
      <AbsoluteFill style={{opacity: 1 - prog(f, 10, COVER_LEN), zIndex: 50}}>
        <Freeze frame={OUTRO_LEN - 1}>
          <Outro {...outro} />
        </Freeze>
      </AbsoluteFill>
    );
  }
  const {colors, canvas, displayFont} = useBrand();
  const light = canvas === 'light';
  const out = prog(f, 10, COVER_LEN);
  const fg = light ? colors.dark : colors.light;
  return (
    <AbsoluteFill style={{opacity: 1 - out, zIndex: 50}}>
      <AbsoluteFill
        style={{
          background: light
            ? `linear-gradient(165deg, ${colors.paper} 0%, ${colors.light} 45%, ${colors.accentLight} 120%)`
            : `linear-gradient(165deg, ${colors.dark} 0%, ${colors.dark2} 40%, ${colors.accentDark} 90%, ${colors.accent} 130%)`,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', color: fg, padding: '0 80px', transform: `scale(${1 + out * 0.04})`}}>
        <BrandAvatar size={300} />
        {cover.kicker && <div style={{marginTop: 64, fontFamily: FONT, fontSize: 32, fontWeight: 600, letterSpacing: 10, color: light ? colors.accentDark : colors.accentLight}}>{cover.kicker}</div>}
        {cover.title && (
          <div style={{marginTop: 28, fontFamily: displayFont, fontSize: 92, fontWeight: light ? 300 : 700, lineHeight: 1.1, letterSpacing: -2}}>
            {cover.title[0]}
            <br />
            {cover.title[1]}
          </div>
        )}
        <div style={{position: 'absolute', bottom: 150, display: 'flex', alignItems: 'center', gap: 20, fontFamily: FONT, fontSize: 30, color: light ? colors.muted : colors.accentLight}}>
          con <AelikaMark size={0.42} color={light ? undefined : '#ffffff'} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const VideoTemplate: React.FC<{cfg: VideoConfig}> = ({cfg}) => {
  const lead = cfg.cover ? COVER_LEN : 0;
  return (
    <BrandProvider brand={cfg.brand}>
      <Music cfg={cfg} />
      <Narration cfg={cfg} />
      <AbsoluteFill style={{width: W, height: H, fontFamily: FONT, overflow: 'hidden', background: '#f3efe9'}}>
        <Sequence from={lead + FLOW_START} layout="none">
          <Flow cfg={cfg} />
        </Sequence>
        <Sequence from={lead} durationInFrames={INTRO_LEN} layout="none">
          <Intro len={INTRO_LEN} />
        </Sequence>
        {cfg.cover && (
          <Sequence durationInFrames={COVER_LEN} layout="none">
            <Cover cover={cfg.cover} outro={cfg.outro} />
          </Sequence>
        )}
      </AbsoluteFill>
    </BrandProvider>
  );
};
