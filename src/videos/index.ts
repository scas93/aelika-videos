import {VideoConfig} from '../core/types';
import {casaOccidente} from './casa-occidente/config';
import {detona} from './detona/config';
import {lacarniceriaLira} from './lacarniceria-lira/config';
import {pulsoStudio} from './pulso-studio/config';

/** Registro de videos. Para agregar uno nuevo: crea src/videos/<negocio>/config.tsx y agrégalo aquí. */
export const VIDEOS: VideoConfig[] = [casaOccidente, detona, lacarniceriaLira, pulsoStudio];
