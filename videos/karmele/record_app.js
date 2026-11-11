// Records the Karmele ordering flow on an emulated iPhone using CDP screencast (high quality frames).
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const REC = process.env.REC_DIR || path.resolve(__dirname, '../../recordings/karmele');
fs.mkdirSync(REC, { recursive: true });

const OUT = path.join(REC, 'frames');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);

const W = 390, H = 800, DSF = 3;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const TOUCH_CSS = `
#__tap{position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
 background:rgba(30,30,30,.28);border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 10px rgba(0,0,0,.25);
 pointer-events:none;z-index:2147483647;opacity:0;transform:scale(.6);transition:opacity .12s, transform .12s}
#__tap.on{opacity:1;transform:scale(1)}
#__tap.press{transform:scale(.82);background:rgba(30,30,30,.4)}
/* hide Stripe test-mode dev badge */
iframe[src*="elements-inner-easel"]{opacity:0!important}
/* recording only: the sheet backdrop is 85% black, its 8px blur is barely visible but very slow to paint without a GPU */
*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
`;

(async () => {
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=3'] });
  const ctx = await browser.newContext({
    ...devices['iPhone 13'],
    viewport: { width: W, height: H },
    screen: { width: W, height: H },
    deviceScaleFactor: DSF,
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
  });
  await ctx.addInitScript((css) => {
    const add = () => {
      if (window.top !== window) return;
      const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
      const d = document.createElement('div'); d.id = '__tap'; document.body.appendChild(d);
      // 1px near-invisible pixel that changes every 33ms so the screencast keeps emitting frames
      const px = document.createElement('div'); px.style.cssText = 'position:fixed;left:0;bottom:0;width:2px;height:2px;z-index:2147483646;pointer-events:none;opacity:.02'; document.body.appendChild(px);
      let i = 0; setInterval(() => { px.style.background = (i++ % 2) ? '#000' : '#111'; }, 33);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
  }, TOUCH_CSS);

  const p = await ctx.newPage();
  await p.goto('https://pide.staging.aelika.com/karmele', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);

  // --- start screencast
  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  let n = 0;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const f = path.join(OUT, `f${String(n++).padStart(5, '0')}.jpg`);
    fs.writeFileSync(f, Buffer.from(data, 'base64'));
    frames.push({ f, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W * DSF, maxHeight: H * DSF, everyNthFrame: 1 });
  // keep frames flowing even when the page is static
  const ticker = setInterval(() => p.evaluate(() => { const d = document.getElementById('__tap'); if (d) d.style.outline = d.style.outline ? '' : '0px solid transparent'; }).catch(() => {}), 100);

  const events = [];
  const mark = (label) => events.push({ t: Date.now() / 1000, type: 'mark', label });
  const dot = (x, y, cls) => p.evaluate(([x, y, cls]) => { const d = document.getElementById('__tap'); d.style.left = x + 'px'; d.style.top = y + 'px'; d.className = cls; }, [x, y, cls]);
  async function tap(loc, { after = 600 } = {}) {
    await loc.scrollIntoViewIfNeeded();
    let b = await loc.boundingBox();
    for (let i = 0; i < 20; i++) { await sleep(70); const c = await loc.boundingBox(); if (c && b && Math.abs(c.y - b.y) < 0.5 && Math.abs(c.x - b.x) < 0.5) break; b = c; }
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await dot(x, y, 'on'); await sleep(130);
    await dot(x, y, 'on press'); events.push({ t: Date.now() / 1000, type: 'tap', x, y }); await sleep(110);
    await loc.click();
    await dot(x, y, 'on'); await sleep(100);
    await dot(x, y, ''); await sleep(after);
  }
  async function type(loc, text, delay = 30) {
    await tap(loc, { after: 80 });
    await loc.pressSequentially(text, { delay });
    await sleep(120);
  }
  const smoothScroll = (y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), y);

  // ===== 1. Menu
  mark('menu');
  await sleep(700);
  await smoothScroll(420); await sleep(800);
  const addFor = async (name) => {
    const hs = await p.locator('button[aria-label="Agregar"]').elementHandles();
    for (const h of hs) {
      const t = await h.evaluate(b => { let c = b; for (let i = 0; i < 6; i++) { c = c.parentElement; if (c.innerText.includes('$')) break; } return c.innerText; });
      if (t.includes(name)) return h;
    }
    throw new Error('no add button for ' + name);
  };
  const caja6 = await addFor('Caja con 6 Karmelitos'), gianduja = await addFor('Pastel de Karmelito con gianduja');
  await tap(caja6, { after: 350 });          // Caja con 6 Karmelitos
  await tap(gianduja, { after: 500 });       // Pastel de Karmelito con gianduja

  const btn = (re) => p.locator('button', { hasText: re }).last();

  // ===== 2. Cart ("Confirma tu pedido")
  await tap(p.getByText(/artículos?$/).first(), { after: 900 });
  await tap(btn(/^Continuar/), { after: 350 });

  // ===== 3. Customer data
  mark('data');
  await type(p.getByPlaceholder('Tu nombre'), 'Mariana López', 25);
  await type(p.getByPlaceholder('55 1234 5678'), '33 1234 5678', 25);
  await tap(btn(/^Continuar$/), { after: 350 });

  // ===== 4. Delivery: address + day + time
  mark('delivery');
  await tap(btn(/^Envío a domicilio$/), { after: 300 });
  await type(p.getByLabel('Calle'), 'Chapultepec', 25);
  await type(p.getByLabel('Número'), '480');
  await type(p.getByLabel('Colonia'), 'Americana', 25);
  await tap(btn(/Mañana/), { after: 300 });
  await tap(btn(/^5 p\. m\.$/), { after: 350 });
  await tap(btn(/^Continuar$/), { after: 600 });

  // ===== 5. Payment method
  mark('pay');
  await tap(btn(/^Tarjeta$/), { after: 400 });
  console.log('PAY BUTTONS', await p.$$eval('button', bs => bs.filter(b => b.offsetParent).map(b => b.innerText.trim()).slice(-4)));
  await tap(btn(/Continuar al pago|Pagar|Confirmar/), { after: 300 });

  // ===== 6. Stripe card form
  let sf;
  for (let i = 0; i < 60 && !sf; i++) {
    for (const f of p.frames()) if (await f.$('input[name="number"]').catch(() => null)) { sf = f; break; }
    if (!sf) await sleep(250);
  }
  if (!sf) throw new Error('Stripe card frame not found');
  const country = sf.locator('select[name="country"]');
  await country.selectOption('MX').catch(e => console.log('country', e.message));
  await sleep(500);
  mark('stripe_ready');
  await type(sf.locator('input[name="number"]'), '4242424242424242', 25);
  await type(sf.locator('input[name="expiry"]'), '1230', 45);
  await type(sf.locator('input[name="cvc"]'), '123', 45);
  const zip = sf.locator('input[name="postalCode"]');
  if (await zip.count() && await zip.isVisible()) await type(zip, '44160', 70);
  await sleep(250);
  await tap(p.getByRole('button', { name: /Pagar/ }), { after: 300 });
  const tPaid = Date.now() / 1000;

  // ===== 7. Confirmation
  await p.waitForFunction(() => /Pedido recibido|[Ff]olio es/.test(document.body.innerText) && !/Confirmando tu pago/.test(document.body.innerText), null, { timeout: 45000 }).catch(() => console.log('no confirmation'));
  await p.evaluate(() => { window.__confirmedAt = performance.now(); });
  const tConfirm = Date.now() / 1000; mark('confirm');
  await sleep(4000);
  fs.writeFileSync(path.join(REC, 'marks.json'), JSON.stringify({ events, start: frames[0].t, paid: tPaid, confirm: tConfirm, folio: ((await p.innerText('body')).match(/folio es #(\d+)/) || [])[1], total: ((await p.innerText('body')).match(/Total\s*(\$[\d,.]+)\s*Cerrar/) || [])[1] }));
  console.log('FINAL TEXT:', (await p.innerText('body')).replace(/\s+/g, ' ').slice(-600));

  clearInterval(ticker);
  await cdp.send('Page.stopScreencast');
  await sleep(300);
  // duration list for ffmpeg concat
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    const d = i + 1 < frames.length ? frames[i + 1].t - frames[i].t : 0.5;
    list += `file '${frames[i].f}'\nduration ${Math.max(d, 0.001).toFixed(4)}\n`;
  }
  list += `file '${frames[frames.length - 1].f}'\n`;
  fs.writeFileSync(path.join(REC, 'frames.txt'), list);
  console.log('frames', frames.length, 'seconds', (frames.at(-1).t - frames[0].t).toFixed(1));
  await browser.close();
})();
