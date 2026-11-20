// Uso: npm run new -- <base> <carpeta-nueva> <IdNuevo> ["Nombre del negocio"] [--tipo demos]
//   p. ej.  npm run new -- pulso-studio gym-titan GymTitan "Gym Titán"
//
// Trabaja dentro de un tipo de video (por defecto `demos`): copia src/videos/<tipo>/<base>/ a
// src/videos/<tipo>/<carpeta-nueva>/, cambia el id, el nombre de la variable,
// la carpeta de fotos y (si se da) el nombre del negocio, crea public/<carpeta-nueva>/ y registra el
// video en src/videos/<tipo>/index.ts. La narración sigue apuntando a la del video base (no se regenera):
// si el guion menciona al negocio, regenérala con scripts/narrate.mjs.
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const ti = argv.indexOf('--tipo');
const tipo = ti >= 0 ? argv[ti + 1] : 'demos';
const [base, dest, id, name] = argv.filter((_, i) => ti < 0 || (i !== ti && i !== ti + 1));
if (!base || !dest || !id || !/^[A-Za-z][A-Za-z0-9]*$/.test(id)) {
  console.error('Uso: npm run new -- <base> <carpeta-nueva> <IdNuevo> ["Nombre del negocio"] [--tipo demos]\n  (IdNuevo sin espacios, p. ej. GymTitan)');
  process.exit(1);
}
const src = path.join('src/videos', tipo, base);
const out = path.join('src/videos', tipo, dest);
if (!fs.existsSync(path.join(src, 'config.tsx'))) throw new Error(`No existe ${src}/config.tsx`);
if (fs.existsSync(out)) throw new Error(`Ya existe ${out}`);

const varName = id[0].toLowerCase() + id.slice(1);
let cfg = fs.readFileSync(path.join(src, 'config.tsx'), 'utf8');
const oldVar = cfg.match(/export const (\w+): VideoConfig/)[1];
const oldId = cfg.match(/id: '([^']+)'/)[1];
cfg = cfg
  .replace(`export const ${oldVar}: VideoConfig`, `export const ${varName}: VideoConfig`)
  .replace(`id: '${oldId}'`, `id: '${id}'`)
  .replace(new RegExp('`' + base + '/\\$\\{f\\}`', 'g'), '`' + dest + '/${f}`');
if (name) {
  const oldName = cfg.match(/brand: \{\s*name: '([^']+)'/)[1];
  cfg = cfg.split(oldName).join(name);
}
fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(path.join(out, 'config.tsx'), `// Copiado de ${base} con \`npm run new\`. Revisa marca, fotos, textos y precios.\n` + cfg);
if (fs.existsSync(path.join(src, 'narracion.json'))) fs.copyFileSync(path.join(src, 'narracion.json'), path.join(out, 'narracion.json'));

// fotos: se copian las del base como punto de partida (hay que cambiarlas por las del negocio)
const pubSrc = path.join('public', base);
const pubOut = path.join('public', dest);
fs.mkdirSync(pubOut, {recursive: true});
if (fs.existsSync(pubSrc)) for (const f of fs.readdirSync(pubSrc)) fs.copyFileSync(path.join(pubSrc, f), path.join(pubOut, f));

// registro
const idx = path.join('src/videos', tipo, 'index.ts');
if (!fs.existsSync(idx)) throw new Error(`No existe ${idx}: crea el registro del tipo "${tipo}" primero (ver src/videos/index.ts)`);
let reg = fs.readFileSync(idx, 'utf8');
const lastImport = [...reg.matchAll(/^import .*$/gm)].pop();
reg = reg.slice(0, lastImport.index + lastImport[0].length) + `\nimport {${varName}} from './${dest}/config';` + reg.slice(lastImport.index + lastImport[0].length);
reg = reg.replace(/export const (\w+): VideoConfig\[\] = \[([^\]]*)\]/, (_, n, l) => `export const ${n}: VideoConfig[] = [${l.trim()}, ${varName}]`);
fs.writeFileSync(idx, reg);

console.log(`Listo: ${out}/config.tsx (id ${id}), fotos en ${pubOut}/, registrado en ${idx}.
Siguientes pasos:
  1. Cambia el logo y las fotos en ${pubOut}/ (mismos nombres o actualiza config.tsx).
  2. Ajusta en config.tsx colores, textos del chat, productos/clases y precios.
  3. npm run check -- ${id} --sheet   (revisa y arma la hoja de cuadros)
  4. npm run render -- ${id} --formats 9x16,4x5,16x9`);
