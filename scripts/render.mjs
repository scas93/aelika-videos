// Uso: npm run render -- <Composicion> [salida.mp4]
import {execSync} from 'child_process';
const [id, out] = process.argv.slice(2);
if (!id) {
  console.error('Uso: npm run render -- <Composicion> [salida.mp4]');
  process.exit(1);
}
const output = out ?? `out/${id}.mp4`;
execSync(`npx remotion render src/index.ts ${id} ${output} --codec=h264 --crf=18`, {stdio: 'inherit'});
