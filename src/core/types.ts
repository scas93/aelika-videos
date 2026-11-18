import React from 'react';
import {Brand} from './brand';

/** Toque del dedo. Frames locales a la escena; x/y en px de pantalla (390x844). */
export type Tap = {f: number; x: number; y: number; to?: {x: number; y: number; d: number}};

/** Zoom de cámara 🔍. a/b = frames locales de inicio y fin; x/y = punto de la pantalla a enfocar. */
export type Zoom = {a: number; b: number; x: number; y: number; s: number};

/** Subtítulo que aparece en el frame local `at` y dura hasta el siguiente o el fin de la escena. */
export type Sub = {at: number; text: string};

export type Enter = 'none' | 'left' | 'up' | 'fade';

/** Una escena dentro del teléfono. Las "fábricas" de src/scenes devuelven esto. */
export type PhoneScene = {
  id: string;
  duration: number;
  /** cómo entra esta pantalla sobre la anterior */
  enter?: Enter;
  Component: React.FC;
  taps?: Tap[];
  zooms?: Zoom[];
  subtitles?: Sub[];
};

export type Addon = {icon: string; title: string; desc: string};

export type VideoConfig = {
  /** Id de la composición (sin espacios): se usa para renderizar */
  id: string;
  brand: Brand;
  /** El flujo dentro del teléfono, en orden */
  scenes: PhoneScene[];
  addons?: {
    kicker?: string;
    title?: string;
    titleAccent?: string;
    items: Addon[];
    more?: string;
  };
  outro?: {tagline?: [string, string]; email?: string; phone?: string; cta?: string};
  /** música de fondo (archivo en /public, p. ej. "musica/pista.mp3") */
  music?: {
    src: string;
    /** volumen 0–1 (por defecto 0.8) */
    volume?: number;
    /** segundo de la canción en que empieza el video (por defecto 0) */
    startAt?: number;
  };
};
