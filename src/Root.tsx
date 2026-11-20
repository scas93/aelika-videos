import React from 'react';
import {Composition, Folder} from 'remotion';
import {VideoTemplate, videoDuration} from './core/Composer';
import {FPS, H, W} from './core/theme';
import {VideoConfig} from './core/types';
import {VIDEO_GROUPS} from './videos';

// La configuración trae componentes (no serializables), así que se envuelve en vez de pasarse como props.
const make = (cfg: VideoConfig) => {
  const Comp: React.FC = () => <VideoTemplate cfg={cfg} />;
  return Comp;
};
// En Remotion Studio, cada tipo de video (demos, marketing…) es una carpeta.
const GROUPS = VIDEO_GROUPS.map((g) => ({name: g.name, entries: g.videos.map((cfg) => ({cfg, Comp: make(cfg)}))}));

export const RemotionRoot: React.FC = () => (
  <>
    {GROUPS.map((g) => (
      <Folder key={g.name} name={g.name}>
        {g.entries.map(({cfg, Comp}) => (
          <Composition key={cfg.id} id={cfg.id} component={Comp} durationInFrames={videoDuration(cfg)} fps={FPS} width={W} height={H} />
        ))}
      </Folder>
    ))}
  </>
);
