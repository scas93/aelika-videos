import {Config} from '@remotion/cli/config';
import fs from 'fs';
import path from 'path';

// Chromium: REMOTION_BROWSER si está definido; si no, el headless shell de Playwright de la nube
// de Claude (/opt/pw-browsers); si no, Remotion descarga el suyo. (Misma lógica que scripts/browser.mjs.)
const findBrowser = () => {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const root = '/opt/pw-browsers';
  if (!fs.existsSync(root)) return undefined;
  for (const dir of fs.readdirSync(root).filter((d) => d.startsWith('chromium_headless_shell')).sort().reverse()) {
    const exe = path.join(root, dir, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
    if (fs.existsSync(exe)) return exe;
  }
  return undefined;
};
const browser = findBrowser();
if (browser) Config.setBrowserExecutable(browser);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
