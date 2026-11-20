// Records the WhatsApp-style chat scenes (intro + outro) from chat.html at 1170x2532.
// usage: node record_chat.js intro|outro [folio] [total]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const REC = process.env.REC_DIR || path.resolve(__dirname, '../../recordings/karmele');
fs.mkdirSync(REC, { recursive: true });

const scene = process.argv[2] || 'intro';
const folio = process.argv[3] || '10';
const total = process.argv[4] || '$740.00';
const OUT = path.join(REC, 'frames_' + scene);
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=3'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('file://' + path.join(__dirname, 'chat.html') + (scene === 'outro' ? '#outro' : ''));
  await p.evaluate(() => document.fonts.ready);
  await sleep(400);

  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  let n = 0;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const f = path.join(OUT, `f${String(n++).padStart(5, '0')}.jpg`);
    fs.writeFileSync(f, Buffer.from(data, 'base64'));
    frames.push({ f, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1170, maxHeight: 2532 });
  // force a repaint every 80ms so static moments still produce frames
  await p.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:.01'; document.body.appendChild(d); let i = 0; setInterval(() => d.style.background = (i++ % 2) ? '#000' : '#010101', 80); });

  const events = [];
  const ev = (type, o = {}) => events.push({ t: Date.now() / 1000, type, ...o });
  const ui = (fn, ...a) => p.evaluate(([fn, a]) => window.ui[fn](...a), [fn, a]);
  async function tapAt(x, y, action, hold = 110) {
    await ui('dot', x, y, 'on'); await sleep(200);
    await ui('dot', x, y, 'on press'); ev('tap', { x, y }); await sleep(hold);
    if (action) await action();
    await ui('dot', x, y, 'on'); await sleep(120);
    await ui('dot', x, y, '');
  }
  async function tapSel(sel, action, after = 300) {
    const b = await p.locator(sel).last().boundingBox();
    await tapAt(b.x + b.width / 2, b.y + b.height / 2, action);
    await sleep(after);
  }
  async function typeWord(word) {
    let v = '';
    for (const ch of word) {
      const key = ch.toUpperCase();
      const b = await p.locator(`[data-k="${key}"]`).boundingBox();
      v += ch;
      await ui('dot', b.x + b.width / 2, b.y + b.height / 2, 'on press');
      await ui('keyDown', key, true); await ui('setText', v); ev('key', { x: b.x + b.width / 2, y: b.y + b.height / 2 });
      await sleep(95);
      await ui('keyDown', key, false); await ui('dot', b.x + b.width / 2, b.y + b.height / 2, '');
      await sleep(80);
    }
  }

  if (scene === 'intro') {
    await sleep(700);
    await typeWord('Hola');
    await sleep(200);
    await tapSel('#send', () => ui('setText', '').then(() => (ev('msg_out'), ui('out', 'Hola', '9:41 a.m.'))), 450);
    await ui('typing', true); await sleep(1100);
    ev('msg_in'); await ui('card', '¡Hola! Bienvenido a <b>Karmele</b> <span class="emoji">🥐</span> ¿En qué podemos ayudarte?', '9:41 a.m.',
      ['<span class="emoji">🛒</span> Hacer pedido', '<span class="emoji">📍</span> Facturación', '<span class="emoji">💬</span> Ayuda']);
    await sleep(900);
    await ui('hideKb'); await sleep(650);
    await tapSel('.card [data-b="0"]', () => (ev('msg_out'), p.evaluate(() => {
      document.querySelector('.card [data-b="0"]').classList.add('used');
      ui.out('<div class="quote"><b>Karmele</b>¡Hola! Bienvenido a Karmele <span class="emoji">🥐</span> ¿En qué podemos ayudarte?</div><span class="emoji">🛒</span> Hacer pedido', '9:41 a.m.');
    })), 450);
    await ui('typing', true); await sleep(1000);
    ev('msg_in'); await ui('card', '¡Perfecto! <span class="emoji">🧁</span> Arma tu pedido en nuestro menú en línea. Recuerda pedir con <b>24 h de anticipación</b>.', '9:41 a.m.', ['Ver menú'], 'link');
    await sleep(1300);
    await tapSel('.card:last-of-type [data-b="0"]', null, 150);
  } else {
    await sleep(700);
    await ui('typing', true); await sleep(900);
    ev('msg_in'); await ui('card',
      `<span class="emoji">✅</span> <b>¡Pedido confirmado!</b><br>Folio <b>#${folio}</b> · Total <b>${total}</b><br><span class="emoji">🚚</span> A domicilio, <b>mañana 12 nov a las 5:00 p. m.</b><br><span class="emoji">📍</span> Chapultepec 480, Americana<br><br>Te avisaremos por aquí cuando salga a reparto. ¡Gracias por tu compra! <span class="emoji">🧁</span>`,
      '9:43 a.m.', []);
    await sleep(3000);
  }

  fs.writeFileSync(path.join(REC, `events_${scene}.json`), JSON.stringify({ start: null, events }));
  await cdp.send('Page.stopScreencast');
  await sleep(200);
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    const d = i + 1 < frames.length ? frames[i + 1].t - frames[i].t : 0.1;
    list += `file '${frames[i].f}'\nduration ${Math.max(d, 0.001).toFixed(4)}\n`;
  }
  list += `file '${frames.at(-1).f}'\n`;
  fs.writeFileSync(path.join(REC, `frames_${scene}.txt`), list);
  fs.writeFileSync(path.join(REC, `events_${scene}.json`), JSON.stringify({ start: frames[0].t, events }));
  console.log(scene, 'frames', frames.length, 'seconds', (frames.at(-1).t - frames[0].t).toFixed(1));
  await browser.close();
})();
