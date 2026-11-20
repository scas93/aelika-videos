import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Main, DURATION, FPS } from './Video';
import { MainB2B, DURATION_B2B } from './VideoB2B';

const Root = () => (
  <Composition
    id="KarmelePedido"
    component={Main}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ logo: null, closingText: '' }}
  />
);
const RootAll = () => (
  <>
    <Root />
    <Composition id="BanettoMayoreo" component={MainB2B} durationInFrames={DURATION_B2B} fps={FPS} width={1080} height={1920} defaultProps={{ closingText: '' }} />
  </>
);

registerRoot(RootAll);
