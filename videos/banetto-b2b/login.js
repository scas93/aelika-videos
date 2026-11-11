// Records the B2B login (phone -> WhatsApp code) and saves the logged-in session for the rest of the recording.
// Waits for the code in ./code.txt (written once the user shares it).
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const REC = process.env.REC_DIR || path.resolve(__dirname, '../../recordings/banetto-b2b');
fs.mkdirSync(REC, { recursive: true });

const DIR = REC;
const URL = 'https://pide.staging.aelika.com/banetto-mayorista';
const PHONE = process.env.B2B_PHONE;   // authorized test-business phone (never committed)
if (!PHONE) { console.error('Set B2B_PHONE=<10 digits>'); process.exit(1); }
const OUT = path.join(DIR, 'frames_login');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
fs.rmSync(path.join(DIR, 'code.txt'), { force: true });
const W = 390, H = 800, DSF = 3;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const log = (...a) => { console.log(new Date().toISOString().slice(11, 19), ...a); };

const CSS = `
#__tap{position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
 background:rgba(30,30,30,.28);border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 10px rgba(0,0,0,.25);
 pointer-events:none;z-index:2147483647;opacity:0;transform:scale(.6);transition:opacity .12s, transform .12s}
#__tap.on{opacity:1;transform:scale(1)} #__tap.press{transform:scale(.82);background:rgba(30,30,30,.4)}
*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`;

(async () => {
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=3'] });
  const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: W, height: H }, screen: { width: W, height: H },
    deviceScaleFactor: DSF, locale: 'es-MX', timezoneId: 'America/Mexico_City' });
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
  await sleep(600);

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
  async function tap(loc, after = 400) {
    await loc.scrollIntoViewIfNeeded();
    let b = await loc.boundingBox();
    for (let i = 0; i < 20; i++) { await sleep(70); const c = await loc.boundingBox(); if (c && b && Math.abs(c.y - b.y) < 0.5) break; b = c; }
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await dot(x, y, 'on'); await sleep(130);
    await dot(x, y, 'on press'); events.push({ t: Date.now() / 1000, type: 'tap', x, y }); await sleep(110);
    await loc.click();
    await dot(x, y, 'on'); await sleep(100); await dot(x, y, ''); await sleep(after);
  }
  const dump = async (tag) => {
    await p.screenshot({ path: path.join(DIR, `login_${tag}.png`), scale: 'css' });
    log(tag, (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 600));
    log('ELEMENTS', JSON.stringify(await p.$$eval('button, input', es => es.filter(e => e.offsetParent).map(e => e.tagName + '[' + (e.type || '') + ']:' + (e.getAttribute('aria-label') || e.innerText || e.placeholder || '').trim().slice(0, 40)))));
  };

  mark('login');
  await sleep(900);
  const phone = p.getByPlaceholder('10 dígitos');
  await tap(phone, 80);
  await phone.pressSequentially(PHONE, { delay: 45 });
  await sleep(300);
  await tap(p.locator('button', { hasText: 'Enviar código' }), 1500);
  mark('code_sent');
  await dump('code_screen');
  await sleep(800);
  await cdp.send('Page.stopScreencast');   // pause while waiting for the code
  log('WAITING FOR CODE (code.txt)');
  let code = null;
  for (let i = 0; i < 1200 && !code; i++) {           // up to 20 min
    const f = path.join(DIR, 'code.txt');
    if (fs.existsSync(f)) code = fs.readFileSync(f, 'utf8').trim();
    else await sleep(1000);
  }
  if (!code) { log('NO CODE'); process.exit(2); }
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W * DSF, maxHeight: H * DSF });
  mark('code_ready');
  await sleep(600);
  const inputs = p.locator('input:visible');
  const count = await inputs.count();
  log('code inputs', count);
  if (count === 1) {
    await tap(inputs.first(), 80);
    await inputs.first().pressSequentially(code, { delay: 110 });
  } else {
    await tap(inputs.first(), 80);
    await p.keyboard.type(code, { delay: 110 });   // separate boxes usually auto-advance
  }
  await sleep(500);
  const submit = p.locator('button:visible', { hasText: /Verificar|Entrar|Continuar|Ingresar|Confirmar/ });
  if (await submit.count()) await tap(submit.first(), 300);
  await p.waitForLoadState('networkidle').catch(() => {});
  await sleep(2500);
  mark('logged_in');
  await dump('after_login');
  await ctx.storageState({ path: path.join(DIR, 'state.json') });

  await cdp.send('Page.stopScreencast'); await sleep(200);
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    let d = i + 1 < frames.length ? frames[i + 1].t - frames[i].t : 0.1;
    if (d > 2) d = 0.05;   // the paused wait for the code is cut out
    list += `file '${frames[i].f}'\nduration ${Math.max(d, 0.001).toFixed(4)}\n`;
  }
  list += `file '${frames.at(-1).f}'\n`;
  fs.writeFileSync(path.join(DIR, 'frames_login.txt'), list);
  fs.writeFileSync(path.join(DIR, 'events_login.json'), JSON.stringify({ start: frames[0].t, events }));
  log('DONE frames', frames.length);
  await browser.close();
})();
