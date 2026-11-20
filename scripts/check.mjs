// Uso: npm run check -- <Composicion | --all> [--sheet]
//
// Revisa un video ANTES de renderizarlo:
//  · cada archivo que usa la configuración existe en public/ (fotos, logo, narración, música);
//  · las frases de la narración no se enciman, no empiezan antes del video ni terminan después;
//  · huecos largos sin voz (aviso);
//  · subtítulos demasiado largos para el teléfono (aviso);
//  · con --sheet, renderiza una hoja de cuadros (out/<Id>-hoja.png) con el inicio de cada escena y momentos clave.
// Sale con código 1 si hay errores.
import {build} from 'esbuild';
import {execFileSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const args = process.argv.slice(2);
const all = args.includes('--all');
const sheet = args.includes('--sheet');
const only = args.filter((a) => !a.startsWith('--'));
if (!all && !only.length) {
  console.error('Uso: npm run check -- <Composicion | --all> [--sheet]');
  process.exit(1);
}
const MAX_GAP = 4.5; // s sin voz que ya merecen aviso
const MAX_SUB = 58; // caracteres por subtítulo (≈2 líneas)
const FPS = 30;

// 1) Evaluar las configuraciones (TypeScript) con esbuild
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aelika-check-'));
const entry = path.join(tmp, 'entry.ts');
fs.writeFileSync(entry, `
import {VIDEOS} from '${path.resolve('src/videos/index.ts')}';
import {buildTimeline, narrationAnchorFrame} from '${path.resolve('src/core/Composer.tsx')}';
export const data = VIDEOS.map((cfg) => {
  const tl = buildTimeline(cfg);
  return {
    id: cfg.id,
    total: tl.total,
    lead: cfg.cover ? 18 : 0,
    scenes: tl.scenes.map((s) => ({id: s.id, start: s.start, duration: s.duration, marks: s.marks ?? {}})),
    subs: tl.subs.map((s) => s.text),
    narration: (cfg.narration?.clips ?? []).map((c) => {
      let at = null, err = null;
      try { at = narrationAnchorFrame(cfg, c.anchor) + Math.round((c.offset ?? 0) * 30); } catch (e) { err = e.message; }
      return {src: c.src, at, err};
    }),
    music: cfg.music?.src ?? null,
    cfg,
  };
});`);
const outFile = path.join(tmp, 'bundle.cjs');
await build({entryPoints: [entry], bundle: true, platform: 'node', format: 'cjs', outfile: outFile, logLevel: 'error', loader: {'.css': 'empty', '.woff': 'empty', '.woff2': 'empty'}, jsx: 'automatic'});
const {data} = await import(outFile);

const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const files = (obj, acc = new Set()) => {
  if (typeof obj === 'string' && /\.(png|jpe?g|webp|mp3|wav|mp4)$/i.test(obj)) acc.add(obj);
  else if (obj && typeof obj === 'object') for (const v of Object.values(obj)) files(v, acc);
  return acc;
};

let errors = 0;
for (const v of data.filter((d) => all || only.includes(d.id))) {
  const E = [], W = [];
  console.log(`\n■ ${v.id} · ${(v.total / FPS).toFixed(1)} s · escenas: ${v.scenes.map((s) => `${s.id} @${((v.lead + 110 + s.start) / FPS).toFixed(1)}s`).join(', ')}`);

  // archivos
  for (const f of files(v.cfg)) {
    if (fs.existsSync(path.join('public', f))) continue;
    if (f === v.music) W.push(`falta la música public/${f} (no va en el repo: descárgala de nuevo)`);
    else E.push(`falta public/${f}`);
  }

  // narración
  const clips = v.narration
    .map((c) => {
      if (c.err) { E.push(`${c.src}: ${c.err}`); return null; }
      const p = path.join('public', c.src);
      if (!fs.existsSync(p)) return null;
      return {...c, s: c.at / FPS, e: c.at / FPS + dur(p)};
    })
    .filter(Boolean)
    .sort((a, b) => a.s - b.s);
  for (const [i, c] of clips.entries()) {
    const name = path.basename(c.src);
    if (c.s < 0) E.push(`${name} empieza antes del video`);
    if (c.e > v.total / FPS) E.push(`${name} termina ${(c.e - v.total / FPS).toFixed(2)} s después del final`);
    const prev = clips[i - 1];
    if (prev && c.s < prev.e - 0.02) E.push(`${name} se encima ${(prev.e - c.s).toFixed(2)} s con ${path.basename(prev.src)}`);
    if (prev && c.s - prev.e > MAX_GAP) W.push(`${(c.s - prev.e).toFixed(1)} s sin voz antes de ${name} (${prev.e.toFixed(1)}–${c.s.toFixed(1)} s)`);
  }
  if (clips.length) console.log('  voz: ' + clips.map((c) => `${path.basename(c.src, '.mp3')} ${c.s.toFixed(1)}–${c.e.toFixed(1)}`).join(' · '));

  // subtítulos
  for (const t of v.subs) if (t.length > MAX_SUB) W.push(`subtítulo largo (${t.length} car.): "${t}"`);

  for (const e of E) console.log('  ✗ ' + e);
  for (const w of W) console.log('  ⚠ ' + w);
  if (!E.length && !W.length) console.log('  ✓ sin problemas');
  errors += E.length;

  // hoja de cuadros
  if (sheet) {
    const frames = new Set([v.lead + 60]);
    for (const s of v.scenes) {
      frames.add(v.lead + 110 + s.start + 20);
      for (const m of Object.values(s.marks)) frames.add(v.lead + 110 + s.start + m + 12);
    }
    frames.add(v.total - 40);
    const list = [...frames].filter((f) => f < v.total).sort((a, b) => a - b);
    const dir = path.join(tmp, v.id);
    execFileSync('node', ['scripts/stills.mjs', v.id, dir, ...list.map(String)], {stdio: 'ignore'});
    const pngs = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(dir, f));
    fs.mkdirSync('out', {recursive: true});
    const cols = Math.min(8, pngs.length);
    const rows = Math.ceil(pngs.length / cols);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...pngs.flatMap((p) => ['-i', p]), '-filter_complex',
      pngs.map((_, i) => `[${i}:v]scale=270:480,drawtext=text='${Math.round(list[i] / FPS * 10) / 10}s':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(';') + ';' +
      pngs.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${pngs.length}:layout=${pngs.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|')}:fill=white`,
      path.join('out', `${v.id}-hoja.png`)]);
    console.log(`  hoja de cuadros: out/${v.id}-hoja.png (${pngs.length} cuadros, ${cols}×${rows})`);
  }
}
fs.rmSync(tmp, {recursive: true, force: true});
process.exit(errors ? 1 : 0);
