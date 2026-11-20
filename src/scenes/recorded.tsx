import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {Enter, PhoneScene, Sub, Tap, Zoom} from '../core/types';

/**
 * Grabación REAL de la app dentro del teléfono (p. ej. las de grabacion/: 1170×2532 = 390×844 a 3×,
 * con la barra de estado incluida). Sirve para mezclar la app real con escenas simuladas.
 *
 * Los tiempos de `taps`, `zooms`, `subtitles` y `marks` son en SEGUNDOS desde el inicio del clip
 * (ya con `speed` aplicado). La grabación suele traer su propio indicador de toques; agrega `taps`
 * solo si no lo trae.
 */
export type RecordedData = {
  /** video dentro de /public */
  src: string;
  /** segundo del video donde empieza el clip */
  from?: number;
  /** cuántos segundos del video original usar */
  length: number;
  /** velocidad (1.25 = 25 % más rápido) */
  speed?: number;
  enter?: Enter;
  taps?: {at: number; x: number; y: number}[];
  zooms?: {a: number; b: number; x: number; y: number; s: number}[];
  subtitles?: {at: number; text: string}[];
  marks?: Record<string, number>;
  id?: string;
};

export const recordedClip = (d: RecordedData): PhoneScene => {
  const FPS = 30;
  const speed = d.speed ?? 1;
  const f = (s: number) => Math.round(s * FPS);
  return {
    id: d.id ?? 'grabacion',
    duration: f(d.length / speed),
    enter: d.enter ?? 'up',
    Component: () => (
      <div style={{position: 'absolute', inset: 0, background: '#000'}}>
        <OffthreadVideo src={staticFile(d.src)} trimBefore={f(d.from ?? 0)} playbackRate={speed} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    ),
    taps: (d.taps ?? []).map((t): Tap => ({f: f(t.at), x: t.x, y: t.y})),
    zooms: (d.zooms ?? []).map((z): Zoom => ({...z, a: f(z.a), b: f(z.b)})),
    subtitles: (d.subtitles ?? []).map((s): Sub => ({at: f(s.at), text: s.text})),
    marks: Object.fromEntries(Object.entries(d.marks ?? {}).map(([k, v]) => [k, f(v)])),
  };
};
