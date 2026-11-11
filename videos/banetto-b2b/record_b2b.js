// Records the B2B weekly order flow (already logged in via state.json).
// usage: node record_b2b.js [--send]     (without --send it stops at the summary: dry run)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const REC = process.env.REC_DIR || path.resolve(__dirname, '../../recordings/banetto-b2b');
fs.mkdirSync(REC, { recursive: true });

const DIR = REC;
const SEND = process.argv.includes('--send');
const URL = 'https://pide.staging.aelika.com/banetto-mayorista';
const OUT = path.join(DIR, 'frames_app');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
const W = 390, H = 800, DSF = 3;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const CSS = `
#__tap{position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
 background:rgba(30,30,30,.28);border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 10px rgba(0,0,0,.25);
 pointer-events:none;z-index:2147483647;opacity:0;transform:scale(.6);transition:opacity .12s, transform .12s}
#__tap.on{opacity:1;transform:scale(1)} #__tap.press{transform:scale(.82);background:rgba(30,30,30,.4)}
*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`;

(async () => {
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=3'] });
  const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: W, height: H }, screen: { width: W, height: H },
    deviceScaleFactor: DSF, locale: 'es-MX', timezoneId: 'America/Mexico_City', storageState: path.join(DIR, 'state.json') });
  await ctx.addInitScript((css) => {
    const add = () => {
      if (window.top !== window || document.getElementById('__tap')) return;
      const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
      const d = document.createElement('div'); d.id = '__tap'; document.body.appendChild(d);
      const px = document.createElement('div'); px.style.cssText = 'position:fixed;left:0;bottom:0;width:2px;height:2px;z-index:2147483646;pointer-events:none;opacity:.02'; document.body.appendChild(px);
      let i = 0; setInterval(() => { px.style.background = (i++ % 2) ? '#000' : '#111'; }, 33);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
  }, CSS);
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await sleep(800);

  const cdp = await ctx.newCDPSession(p);
  const frames = []; let n = 0;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const f = path.join(OUT, `f${String(n++).padStart(5, '0')}.jpg`);
    fs.writeFileSync(f, Buffer.from(data, 'base64')); frames.push({ f, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W * DSF, maxHeight: H * DSF });

  const events = [];
  const mark = (label) => events.push({ t: Date.now() / 1000, type: 'mark', label });
  const dot = (x, y, cls) => p.evaluate(([x, y, cls]) => { const d = document.getElementById('__tap'); if (!d) return; d.style.left = x + 'px'; d.style.top = y + 'px'; d.className = cls; }, [x, y, cls]);
  async function tap(loc, after = 350) {
    await loc.scrollIntoViewIfNeeded();
    let b = await loc.boundingBox();
    for (let i = 0; i < 20; i++) { await sleep(70); const c = await loc.boundingBox(); if (c && b && Math.abs(c.y - b.y) < 0.5) break; b = c; }
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await dot(x, y, 'on'); await sleep(130);
    await dot(x, y, 'on press'); events.push({ t: Date.now() / 1000, type: 'tap', x, y }); await sleep(110);
    await loc.click();
    await dot(x, y, 'on'); await sleep(100); await dot(x, y, ''); await sleep(after);
  }
  async function typeQty(label, qty) {
    const inp = p.locator(`input[aria-label="${label}"]`);
    await tap(inp, 80);
    await inp.press('Control+A'); await inp.pressSequentially(String(qty), { delay: 90 });
    await sleep(250);
  }
  const btn = (re) => p.locator('button', { hasText: re }).first();

  // ===== home -> create order
  mark('home');
  await sleep(700);
  await tap(btn('Crear pedido'), 500);
  // ===== week
  mark('week');
  await sleep(500);
  await tap(btn(/^Hacer pedido$/), 450);
  // ===== delivery days
  for (const d of ['Lun 16', 'Mié 18', 'Vie 20']) await tap(btn(d), 220);
  await sleep(250);
  await tap(btn(/^Continuar/), 600);
  // ===== products per day
  mark('products');
  await typeQty('Croissant natural el Lun 16 nov', 24);
  await typeQty('Facturita de guayaba el Lun 16 nov', 12);
  await p.keyboard.press('Tab').catch(() => {}); await sleep(200);
  await tap(btn(/^Siguiente/), 500);
  await tap(btn(/^Igual que/), 450);
  await tap(btn(/^Siguiente/), 500);
  await tap(btn(/^Igual que/), 450);
  await tap(btn(/^Ver resumen/), 900);
  // ===== summary
  mark('summary');
  await sleep(500);
  const total = (await p.innerText('body')).match(/Enviar pedido · (\$[\d,.]+)/)?.[1];
  await p.evaluate(() => window.scrollTo({ top: 260, behavior: 'smooth' })); await sleep(900);
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await sleep(500);
  let confirmText = null;
  if (SEND) {
    await tap(btn(/^Enviar pedido/), 300);
    await p.waitForFunction(() => !/Revisa tu pedido/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => console.log('no change after send'));
    await sleep(1200);
    mark('confirm');
    confirmText = (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 800);
    await sleep(3000);
  } else {
    // dry run: just show where the tap would go
    const b = await btn(/^Enviar pedido/).boundingBox();
    events.push({ t: Date.now() / 1000, type: 'tap', x: b.x + b.width / 2, y: b.y + b.height / 2, dry: true });
    mark('confirm');
    await sleep(2000);
  }
  await p.screenshot({ path: path.join(DIR, 'final_screen.png'), scale: 'css' });
  console.log('TOTAL', total, '\nCONFIRM', confirmText);

  await cdp.send('Page.stopScreencast'); await sleep(200);
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    const d = i + 1 < frames.length ? frames[i + 1].t - frames[i].t : 0.1;
    list += `file '${frames[i].f}'\nduration ${Math.max(d, 0.001).toFixed(4)}\n`;
  }
  list += `file '${frames.at(-1).f}'\n`;
  fs.writeFileSync(path.join(DIR, 'frames_app.txt'), list);
  fs.writeFileSync(path.join(DIR, 'events_app.json'), JSON.stringify({ start: frames[0].t, events, total, sent: SEND, confirmText }));
  console.log('frames', frames.length, 'seconds', (frames.at(-1).t - frames[0].t).toFixed(1));
  await browser.close();
})();
