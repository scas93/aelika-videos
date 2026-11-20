import {VideoConfig} from '../../core/types';
import {casaOccidente} from './casa-occidente/config';
import {detona} from './detona/config';
import {lacarniceriaLira} from './lacarniceria-lira/config';
import {pulsoStudio} from './pulso-studio/config';

/**
 * DEMOS COMERCIALES: simulan el flujo de un cliente con la marca de un prospecto para venderle Aelika.
 * Para agregar uno: `npm run new -- <base> <carpeta> <Id> "Nombre"` (lo registra aquí solo).
 */
export const DEMOS: VideoConfig[] = [casaOccidente, detona, lacarniceriaLira, pulsoStudio];
