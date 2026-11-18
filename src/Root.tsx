import React from 'react';
import {Composition} from 'remotion';
import {VideoTemplate, videoDuration} from './core/Composer';
import {FPS, H, W} from './core/theme';
import {VideoConfig} from './core/types';
import {VIDEOS} from './videos';

// La configuración trae componentes (no serializables), así que se envuelve en vez de pasarse como props.
const make = (cfg: VideoConfig) => {
  const Comp: React.FC = () => <VideoTemplate cfg={cfg} />;
  return Comp;
};
const ENTRIES = VIDEOS.map((cfg) => ({cfg, Comp: make(cfg)}));

export const RemotionRoot: React.FC = () => (
  <>
    {ENTRIES.map(({cfg, Comp}) => (
      <Composition key={cfg.id} id={cfg.id} component={Comp} durationInFrames={videoDuration(cfg)} fps={FPS} width={W} height={H} />
    ))}
  </>
);
