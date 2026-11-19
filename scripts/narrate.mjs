// Uso: node scripts/narrate.mjs <guion.json> <carpeta-salida>
// guion.json: {"voiceId": "...", "speed": 1.05, "lines": ["frase 1", "frase 2", ...]}
// Genera 01.mp3, 02.mp3… con ElevenLabs. La API key la inyecta el proxy del entorno
// (o defínela en ELEVENLABS_API_KEY si corres esto en tu computadora).
import fs from 'fs';
import path from 'path';
import {execSync} from 'child_process';

const [scriptPath, outDir] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
fs.mkdirSync(outDir, {recursive: true});
const key = process.env.ELEVENLABS_API_KEY ?? 'proxy-injected';
for (const [i, text] of cfg.lines.entries()) {
  const file = path.join(outDir, `${String(i + 1).padStart(2, '0')}.mp3`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${cfg.voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {'xi-api-key': key, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      text,
      model_id: cfg.model ?? 'eleven_multilingual_v2',
      voice_settings: {stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true, speed: cfg.speed ?? 1},
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  const dur = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`).toString().trim();
  console.log(`${file}  ${Number(dur).toFixed(2)} s  ${text}`);
}
