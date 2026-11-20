// Uso: npm run render:all -- [--formats 9x16,4x5,16x9] [Id Id ...]
// Renderiza todos los videos registrados en src/videos/index.ts (o solo los que se indiquen),
// uno tras otro, con el mismo post-proceso que `npm run render`.
import {bundle} from '@remotion/bundler';
import {getCompositions} from '@remotion/renderer';
import {execFileSync} from 'child_process';
import path from 'path';
import {findBrowser} from './browser.mjs';

const args = process.argv.slice(2);
const fi = args.indexOf('--formats');
const passFormats = fi >= 0 ? ['--formats', args[fi + 1]] : [];
const only = args.filter((a, i) => !a.startsWith('--') && (fi < 0 || i !== fi + 1));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const ids = (await getCompositions(serveUrl, {browserExecutable: findBrowser()})).map((c) => c.id).filter((id) => !only.length || only.includes(id));
console.log(`Renderizando ${ids.length}: ${ids.join(', ')}`);
const t0 = Date.now();
for (const id of ids) {
  console.log(`\n=== ${id}`);
  execFileSync('node', ['scripts/render.mjs', id, ...passFormats], {stdio: 'inherit'});
}
console.log(`\nListo en ${((Date.now() - t0) / 60000).toFixed(1)} min.`);
