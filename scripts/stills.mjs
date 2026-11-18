// Uso: node scripts/stills.mjs <Composicion> <carpeta> <frame> [frame...]
// Renderiza capturas a 50% para revisar antes de exportar el video.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';

const [id, out, ...rest] = process.argv.slice(2);
if (!id || !out || rest.length === 0) {
  console.error('Uso: node scripts/stills.mjs <Composicion> <carpeta> <frame> [frame...]');
  process.exit(1);
}
fs.mkdirSync(out, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id, browserExecutable});
for (const frame of rest.map(Number)) {
  await renderStill({composition, serveUrl, frame, output: `${out}/f${String(frame).padStart(4, '0')}.png`, scale: 0.5, browserExecutable});
}
console.log(`ok · ${composition.durationInFrames} frames`);
