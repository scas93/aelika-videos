// Uso: npm run render -- <Composicion> [--formats 9x16,4x5,16x9] [--no-norm]
//
// 1. Renderiza el video vertical con Remotion.
// 2. Normaliza el audio a -14 LUFS (el nivel que esperan Instagram, TikTok y YouTube).
// 3. Saca la miniatura (primer frame = portada) como PNG.
// 4. Opcional: versiones 4:5 (feed) y 16:9 (web, presentaciones), con el video vertical
//    centrado sobre el mismo fondo de la plantilla, extendido a lo ancho.
//
// Salidas en out/: <Id>.mp4, <Id>.png, <Id>-4x5.mp4, <Id>-16x9.mp4
import {execFileSync, spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) {
  console.error('Uso: npm run render -- <Composicion> [--formats 9x16,4x5,16x9] [--no-norm]');
  process.exit(1);
}
const fi = args.indexOf('--formats');
const formats = fi >= 0 ? args[fi + 1].split(',') : ['9x16'];
const norm = !args.includes('--no-norm');

fs.mkdirSync('out', {recursive: true});
const out = path.join('out', `${id}.mp4`);
const raw = path.join('out', `${id}.raw.mp4`);
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a], {stdio: 'inherit'});

// 1. render
execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, norm ? raw : out, '--codec=h264', '--crf=18'], {stdio: 'inherit'});

// 2. audio a -14 LUFS (dos pasadas de loudnorm; el video se copia sin recodificar)
const hasAudio = norm && execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', raw]).toString().trim() !== '';
if (norm && !hasAudio) {
  fs.renameSync(raw, out);
  console.log('audio: el video no tiene audio, no se normaliza');
}
if (hasAudio) {
  const target = 'I=-14:TP=-1.5:LRA=11';
  const probe = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', `loudnorm=${target}:print_format=json`, '-vn', '-f', 'null', '-'], {encoding: 'utf8'});
  const m = JSON.parse(probe.stderr.slice(probe.stderr.lastIndexOf('{')));
  const af = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  ff('-i', raw, '-c:v', 'copy', '-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out);
  fs.rmSync(raw);
  console.log(`audio: ${Number(m.input_i).toFixed(1)} LUFS → -14 LUFS`);
}

// 3. miniatura
ff('-ss', '0.1', '-i', out, '-frames:v', '1', path.join('out', `${id}.png`));

// 4. otros formatos
const SIZES = {'4x5': [1080, 1350], '16x9': [1920, 1080]};
for (const f of formats.filter((x) => SIZES[x])) {
  const [w, h] = SIZES[f];
  // el fondo de la plantilla es un degradado vertical: se estira el borde izquierdo a todo el ancho
  const vf = `[0:v]split[a][b];[a]crop=6:ih:0:0,scale=${w}:${h},setsar=1[bg];[b]scale=-2:${h}[fg];[bg][fg]overlay=(W-w)/2:0,format=yuv420p`;
  ff('-i', out, '-filter_complex', vf, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'copy', '-movflags', '+faststart', path.join('out', `${id}-${f}.mp4`));
}
console.log(`listo: ${['out/' + id + '.mp4', 'out/' + id + '.png', ...formats.filter((x) => SIZES[x]).map((x) => `out/${id}-${x}.mp4`)].join(', ')}`);
