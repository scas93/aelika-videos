import {VideoConfig} from '../core/types';
import {DEMOS} from './demos';

/**
 * Registro de videos por TIPO. Cada tipo vive en su carpeta (src/videos/<tipo>/) con su propio index.ts.
 *  - demos:     demos comerciales para prospectos (simulan el flujo con su marca).
 *  - marketing: (próximamente) videos para redes y anuncios.
 */
export const VIDEO_GROUPS: {name: string; videos: VideoConfig[]}[] = [{name: 'Demos', videos: DEMOS}];

/** Todos los videos, sin importar el tipo (lo usan los scripts de render y revisión). */
export const VIDEOS: VideoConfig[] = VIDEO_GROUPS.flatMap((g) => g.videos);
