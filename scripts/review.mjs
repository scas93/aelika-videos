// Uso: npm run review -- <Composicion>
// Arma out/revision/<Id>/ para revisar o aprobar con el cliente:
//   video.mp4  (720p, liviano para compartir), hoja.png (hoja de cuadros), portada.png e index.html.
// Requiere haber renderizado antes (npm run render -- <Id>). La hoja se genera con `npm run check -- <Id> --sheet`.
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const id = process.argv[2];
if (!id) {
  console.error('Uso: npm run review -- <Composicion>');
  process.exit(1);
}
const src = path.join('out', `${id}.mp4`);
if (!fs.existsSync(src)) throw new Error(`Primero renderiza: npm run render -- ${id}`);
const dir = path.join('out', 'revision', id);
fs.mkdirSync(dir, {recursive: true});

execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', 'scale=720:-2', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', path.join(dir, 'video.mp4')]);
if (fs.existsSync(path.join('out', `${id}.png`))) fs.copyFileSync(path.join('out', `${id}.png`), path.join(dir, 'portada.png'));
const check = execFileSync('node', ['scripts/check.mjs', id, '--sheet']).toString();
fs.copyFileSync(path.join('out', `${id}-hoja.png`), path.join(dir, 'hoja.png'));

const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).toString());
const mb = (fs.statSync(path.join(dir, 'video.mp4')).size / 1e6).toFixed(1);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'})[c]);
const fecha = new Date().toLocaleDateString('es-MX', {day: 'numeric', month: 'long', year: 'numeric'});
fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(id)} · revisión</title>
<style>
  :root{--bg:#f6f5f2;--ink:#18181b;--muted:#6b6b72;--card:#fff;--line:#e4e2dd}
  @media (prefers-color-scheme: dark){:root{--bg:#141416;--ink:#f3f1ee;--muted:#a1a1aa;--card:#1e1e22;--line:#2e2e34}}
  body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 Inter,system-ui,sans-serif}
  main{max-width:1100px;margin:0 auto;padding:32px 16px 64px}
  h1{font-size:28px;margin:0}.sub{color:var(--muted);margin:4px 0 24px}
  .top{display:grid;grid-template-columns:minmax(0,360px) 1fr;gap:24px;align-items:start}
  video{width:100%;border-radius:16px;background:#000}
  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
  pre{white-space:pre-wrap;font-size:13px;margin:0;color:var(--muted)}
  img{width:100%;border-radius:12px;border:1px solid var(--line);margin-top:24px}
  @media (max-width:760px){.top{grid-template-columns:1fr}}
</style></head>
<body><main>
  <h1>${esc(id)}</h1>
  <p class="sub">Revisión del ${fecha} · ${dur.toFixed(1)} s · video para compartir de ${mb} MB</p>
  <div class="top">
    <video src="video.mp4" poster="portada.png" controls playsinline></video>
    <div class="card"><b>Revisión automática</b><pre>${esc(check.trim())}</pre></div>
  </div>
  <img src="hoja.png" alt="Hoja de cuadros: inicio de cada escena y momentos clave">
</main></body></html>
`);
console.log(`Listo: ${dir}/index.html (video ${mb} MB, hoja de cuadros y revisión automática)`);
