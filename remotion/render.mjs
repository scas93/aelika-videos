// Renders the video. Usage: node render.mjs [out.mp4] [--stills]
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const out = process.argv.find((a) => a.endsWith('.mp4')) || path.join(root, 'out', (process.env.COMP === 'BanettoMayoreo' ? 'banetto_mayoreo_remotion.mp4' : 'karmele_pedido_remotion.mp4'));
const stills = process.argv.includes('--stills');
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';

const logo = ['aelika-logo.svg', 'aelika-logo.png'].find((f) => fs.existsSync(path.join(root, 'public', f))) || null;
const inputProps = { logo, closingText: process.env.CLOSING_TEXT || '' };

const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.jsx') });
const compId = process.env.COMP || 'KarmelePedido';
const composition = await selectComposition({ serveUrl, id: compId, inputProps, browserExecutable });
console.log('duration', (composition.durationInFrames / composition.fps).toFixed(2), 's', 'logo:', logo);

if (stills) {
  const frames = (process.env.FRAMES || '20,60,150,280,420,600,800,1000,1150,1190').split(',').map(Number);
  fs.mkdirSync(path.join(root, 'out', 'stills'), { recursive: true });
  for (const f of frames.filter((f) => f < composition.durationInFrames)) {
    await renderStill({ composition, serveUrl, frame: f, inputProps, browserExecutable, scale: 0.5,
      output: path.join(root, 'out', 'stills', `s${String(f).padStart(4, '0')}.png`) });
  }
} else {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await renderMedia({ composition, serveUrl, codec: 'h264', crf: 18, outputLocation: out, inputProps, browserExecutable,
    concurrency: 4, onProgress: ({ progress }) => { if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`\r${Math.round(progress * 100)}%`); } });
  console.log('\n->', out);
}
