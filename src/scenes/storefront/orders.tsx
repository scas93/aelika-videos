import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {useBrand} from '../../core/brand';
import {BrandAvatar, HomeIndicator, StatusBar} from '../../core/Phone';
import {SW, prog, rgba, typed} from '../../core/theme';
import {PhoneScene, Tap, Zoom} from '../../core/types';
import {WaBanner} from './classes';

/**
 * Storefront de PEDIDOS DE COMIDA (restaurantes, carnicerías, taquerías…).
 * Flujo: menú con fotos → agrega productos → carrito → a domicilio (cotización de Uber) o para recoger
 *        → resumen con productos y envío por separado → Apple Pay → pedido confirmado + seguimiento.
 */
export type MenuItem = {
  name: string;
  /** línea pequeña, p. ej. "Importado · 300 g" */
  detail: string;
  price: number;
  /** foto cuadrada dentro de /public */
  photo: string;
  /** cuántas veces toca "+" el cliente (0 = no lo pide) */
  qty?: number;
};

export type OrdersData = {
  url: string;
  coverPhoto: string;
  title: string;
  subtitle: string;
  /** chips de categorías del menú (decorativos) */
  categories?: string[];
  items: MenuItem[];
  /** nombre del cliente (ya lo conoce por WhatsApp) */
  customer: string;
  /** línea bajo el total del carrito, p. ej. "3.3 kg para tu carne asada 🔥" */
  cartNote?: string;
  delivery: {
    address: string;
    /** cotización de Uber */
    uberPrice: number;
    uberEta: string;
    /** hora estimada de llegada en la confirmación, p. ej. "1:45 p. m." */
    arrival: string;
  };
  pickup: {address: string; ready: string};
  orderNumber: string;
  /** de quién llega la confirmación por WhatsApp */
  from: string;
  statusTime?: string;
  subtitles?: Partial<Record<'menu' | 'add' | 'cart' | 'delivery' | 'quote' | 'pay' | 'done', string>>;
};

// ------------------------------------------------------------------ tiempos (frames locales)
export const ORDERS_T = {
  menu: [0, 300],
  cart: [300, 420],
  delivery: [420, 660],
  pay: [660, 860],
  done: [860, 1010],
  firstAdd: 56,
  addStep: 13,
  scrollAt: 150,
  tapCart: 278,
  tapContinue: 396,
  tapDelivery: 452,
  typeAddr: [470, 500],
  quoting: 506,
  quoteIn: 548,
  tapContinue2: 636,
  tapApplePay: 730,
  paySheet: 740,
  payOk: 800,
} as const;
const T = ORDERS_T;

const LIST_TOP = 392;
const ROW = 86;
const SCROLL = 300;
const CART_BAR = 696;
const OPT_TOP = 168;

export const money = (n: number) => '$' + n.toLocaleString('en-US');

// ------------------------------------------------------------------ piezas
const Back: React.FC<{title: string; sub?: string}> = ({title, sub}) => {
  const brand = useBrand();
  const {colors} = brand;
  return (
    <>
      <div style={{position: 'absolute', top: 60, left: 16, right: 16, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <svg width="12" height="20" viewBox="0 0 12 20">
          <path d="M10 2 2 10l8 8" fill="none" stroke={colors.dark} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <BrandAvatar size={30} />
        <div style={{width: 12}} />
      </div>
      <div style={{position: 'absolute', top: 104, left: 20, right: 20, fontFamily: brand.displayFont, fontSize: 28, fontWeight: 700}}>{title}</div>
      {sub && <div style={{position: 'absolute', top: 142, left: 20, right: 20, fontSize: 14, color: colors.muted}}>{sub}</div>}
    </>
  );
};

const Btn: React.FC<{label: React.ReactNode; top?: number; pressed?: boolean; black?: boolean; outline?: boolean}> = ({label, top = 696, pressed, black, outline}) => {
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', left: 20, right: 20, top, height: 54, borderRadius: 16, background: outline ? 'transparent' : black ? '#000' : colors.accent, border: outline ? `1.5px solid ${colors.dark}` : 'none', color: outline ? colors.dark : '#fff', fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transform: pressed ? 'scale(.97)' : 'none', boxShadow: outline ? 'none' : '0 8px 18px rgba(0,0,0,.18)'}}>
      {label}
    </div>
  );
};

/** Logotipo de Uber como texto (referencia del servicio de envío). */
const UberBadge: React.FC<{size?: number}> = ({size = 44}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.24, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, letterSpacing: -0.5, flexShrink: 0}}>Uber</div>
);

/** cantidad de cada producto en el frame f, según los toques de "+" */
const qtyAt = (d: OrdersData, f: number) => {
  const taps = addTaps(d);
  return d.items.map((_, i) => taps.filter((t) => t.item === i && f >= t.f).length);
};

/** toques de "+" en orden: primero los que están arriba, luego (tras el scroll) los de abajo */
const addTaps = (d: OrdersData) => {
  const out: {item: number; f: number; scrolled: boolean}[] = [];
  let f: number = T.firstAdd;
  const visible = (i: number) => LIST_TOP + i * ROW + ROW < CART_BAR;
  let scrolled = false;
  d.items.forEach((it, i) => {
    if (!it.qty) return;
    if (!visible(i) && !scrolled) {
      scrolled = true;
      f = Math.max(f + 8, T.scrollAt + 20);
    }
    for (let k = 0; k < it.qty; k++) {
      out.push({item: i, f, scrolled});
      f += T.addStep;
    }
    f += 8;
  });
  return out;
};

// ------------------------------------------------------------------ pantallas
const Menu: React.FC<{f: number; d: OrdersData}> = ({f, d}) => {
  const brand = useBrand();
  const {colors} = brand;
  const q = qtyAt(d, f);
  const scrollY = SCROLL * prog(f, T.scrollAt, T.scrollAt + 18);
  const count = q.reduce((a, b) => a + b, 0);
  const total = q.reduce((a, n, i) => a + n * d.items[i].price, 0);
  const bar = prog(f, T.firstAdd + 2, T.firstAdd + 12);
  const lastTap = addTaps(d).filter((t) => t.f <= f).pop();
  const bump = lastTap ? 1 - prog(f, lastTap.f, lastTap.f + 8) : 0;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-scrollY}px)`}}>
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 200, overflow: 'hidden'}}>
          <Img src={staticFile(d.coverPhoto)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.08 - f * 0.0004})`}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,.1) 55%, rgba(0,0,0,.35))'}} />
        </div>
        <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{padding: 4, borderRadius: '50%', background: colors.paper}}>
            <BrandAvatar size={84} />
          </div>
          <div style={{marginTop: 8, fontFamily: brand.displayFont, fontSize: 24, fontWeight: 700}}>{d.title}</div>
          <div style={{marginTop: 2, fontSize: 13, color: colors.muted}}>{d.subtitle}</div>
        </div>
        <div style={{position: 'absolute', top: 312, left: 16, right: 16, display: 'flex', gap: 8}}>
          {[`🛵  A domicilio con Uber`, `🏪  Recoger en ${d.pickup.ready}`].map((t) => (
            <div key={t} style={{flex: 1, height: 34, borderRadius: 17, background: '#fff', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap'}}>{t}</div>
          ))}
        </div>
        <div style={{position: 'absolute', top: 356, left: 16, right: 0, display: 'flex', gap: 8}}>
          {(d.categories ?? ['Cortes', 'Para la parrilla']).map((c, i) => (
            <div key={c} style={{height: 28, padding: '0 12px', borderRadius: 14, background: i === 0 ? colors.dark : 'transparent', color: i === 0 ? colors.light : colors.dark, border: i === 0 ? 'none' : `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap'}}>{c}</div>
          ))}
        </div>
        {d.items.map((it, i) => {
          const n = q[i];
          const top = LIST_TOP + i * ROW + 10;
          return (
            <div key={it.name} style={{position: 'absolute', left: 16, right: 16, top, height: ROW - 10, borderRadius: 16, background: n ? rgba(colors.accent, 0.08) : '#fff', border: `1px solid ${n ? rgba(colors.accent, 0.5) : colors.line}`, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 12, boxSizing: 'border-box'}}>
              <Img src={staticFile(it.photo)} style={{width: 58, height: 58, borderRadius: 12, objectFit: 'cover'}} />
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 15.5, fontWeight: 700, letterSpacing: 0.2}}>{it.name}</div>
                <div style={{fontSize: 12.5, color: colors.muted, marginTop: 2}}>{it.detail}</div>
                <div style={{fontSize: 14.5, fontWeight: 600, marginTop: 3}}>{money(it.price)}</div>
              </div>
              {n ? (
                <div style={{height: 36, borderRadius: 18, background: colors.dark, color: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 6px', fontSize: 15, fontWeight: 700}}>
                  <span style={{width: 24, textAlign: 'center', opacity: 0.7}}>−</span>
                  <span style={{transform: `scale(${lastTap?.item === i ? 1 + 0.25 * bump : 1})`}}>{n}</span>
                  <span style={{width: 24, height: 24, borderRadius: 12, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>+</span>
                </div>
              ) : (
                <div style={{width: 36, height: 36, borderRadius: 18, background: colors.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500}}>+</div>
              )}
            </div>
          );
        })}
      </div>
      {bar > 0 && (
        <div style={{position: 'absolute', left: 16, right: 16, top: CART_BAR + (1 - bar) * 90, height: 56, borderRadius: 18, background: colors.dark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', boxShadow: '0 10px 24px rgba(0,0,0,.25)', transform: f >= T.tapCart && f < T.tapCart + 8 ? 'scale(.97)' : 'none', zIndex: 20}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 15.5, fontWeight: 600}}>
            <div style={{minWidth: 26, height: 26, borderRadius: 13, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transform: `scale(${1 + 0.2 * bump})`}}>{count}</div>
            Ver mi pedido
          </div>
          <div style={{fontSize: 16, fontWeight: 700}}>{money(total)}</div>
        </div>
      )}
    </>
  );
};

const Cart: React.FC<{f: number; d: OrdersData}> = ({f, d}) => {
  const {colors} = useBrand();
  const lines = d.items.filter((i) => i.qty);
  const total = lines.reduce((a, i) => a + i.qty! * i.price, 0);
  const count = lines.reduce((a, i) => a + i.qty!, 0);
  return (
    <>
      <Back title="Tu pedido" sub={`${count} cortes · ${d.cartNote ?? ''}`} />
      {lines.map((it, i) => (
        <div key={it.name} style={{position: 'absolute', left: 16, right: 16, top: 184 + i * 78, height: 68, display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${colors.line}`, opacity: prog(f, T.cart[0] + 6 + i * 3, T.cart[0] + 16 + i * 3)}}>
          <Img src={staticFile(it.photo)} style={{width: 52, height: 52, borderRadius: 12, objectFit: 'cover'}} />
          <div style={{flex: 1}}>
            <div style={{fontSize: 15.5, fontWeight: 700}}>{it.name}</div>
            <div style={{fontSize: 12.5, color: colors.muted, marginTop: 2}}>{it.detail}</div>
          </div>
          <div style={{fontSize: 14, color: colors.muted, width: 34}}>×{it.qty}</div>
          <div style={{fontSize: 15.5, fontWeight: 600, width: 70, textAlign: 'right'}}>{money(it.qty! * it.price)}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 20, right: 20, top: 184 + lines.length * 78 + 18, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700}}>
        <span>Subtotal</span>
        <span>{money(total)}</span>
      </div>
      <Btn label="Continuar" pressed={f >= T.tapContinue && f < T.tapContinue + 8} />
    </>
  );
};

const Option: React.FC<{top: number; icon: React.ReactNode; title: string; sub: string; on: boolean; right?: React.ReactNode}> = ({top, icon, title, sub, on, right}) => {
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', left: 16, right: 16, top, height: 78, borderRadius: 18, background: on ? rgba(colors.accent, 0.1) : '#fff', border: `${on ? 2 : 1}px solid ${on ? colors.accent : colors.line}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', boxSizing: 'border-box'}}>
      <div style={{width: 44, height: 44, borderRadius: 12, background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}>{icon}</div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 16, fontWeight: 700}}>{title}</div>
        <div style={{fontSize: 12.5, color: colors.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{sub}</div>
      </div>
      {right}
      <div style={{width: 22, height: 22, borderRadius: 11, border: `2px solid ${on ? colors.accent : '#cfc6bb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {on && <div style={{width: 11, height: 11, borderRadius: 6, background: colors.accent}} />}
      </div>
    </div>
  );
};

const Delivery: React.FC<{f: number; d: OrdersData}> = ({f, d}) => {
  const {colors} = useBrand();
  const on = f >= T.tapDelivery;
  const addrIn = prog(f, T.tapDelivery + 4, T.tapDelivery + 16);
  const addr = typed(d.delivery.address, f, T.typeAddr[0], T.typeAddr[1]);
  const quoting = f >= T.quoting && f < T.quoteIn;
  const quote = prog(f, T.quoteIn, T.quoteIn + 12);
  const ready = f >= T.quoteIn;
  return (
    <>
      <Back title="¿Cómo lo quieres?" />
      <Option top={OPT_TOP} icon="🛵" title="A domicilio" sub="Envío con Uber · cotización al momento" on={on} />
      <Option top={OPT_TOP + 92} icon="🏪" title="Para recoger" sub={`Listo en ${d.pickup.ready} · ${d.pickup.address}`} on={false} />
      <div style={{opacity: addrIn, transform: `translateY(${(1 - addrIn) * 14}px)`}}>
        <div style={{position: 'absolute', top: 368, left: 20, fontSize: 13, fontWeight: 600, color: colors.muted}}>Dirección de entrega</div>
        <div style={{position: 'absolute', top: 390, left: 16, right: 16, height: 54, borderRadius: 14, background: '#fff', border: `${f < T.quoting ? 2 : 1}px solid ${f < T.quoting ? colors.accent : colors.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16, gap: 8, boxSizing: 'border-box'}}>
          <span>📍</span>
          {addr ? <span>{addr}</span> : <span style={{color: '#b8ada0'}}>Calle, número y colonia</span>}
          {f < T.quoting && f % 30 < 18 && <span style={{width: 2, height: 20, background: colors.accent, marginLeft: -6}} />}
        </div>
      </div>
      {quoting && (
        <div style={{position: 'absolute', top: 466, left: 16, right: 16, height: 96, borderRadius: 18, background: '#fff', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', boxSizing: 'border-box'}}>
          <UberBadge />
          <div style={{flex: 1}}>
            <div style={{fontSize: 15.5, fontWeight: 600}}>Cotizando tu envío con Uber…</div>
            <div style={{marginTop: 10, height: 6, borderRadius: 3, background: colors.line, overflow: 'hidden'}}>
              <div style={{width: `${30 + 70 * prog(f, T.quoting, T.quoteIn)}%`, height: '100%', background: colors.dark}} />
            </div>
          </div>
        </div>
      )}
      {ready && (
        <div style={{position: 'absolute', top: 466, left: 16, right: 16, height: 96, borderRadius: 18, background: '#fff', border: `2px solid #000`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', boxSizing: 'border-box', opacity: quote, transform: `scale(${0.96 + 0.04 * quote})`, boxShadow: '0 10px 24px rgba(0,0,0,.12)'}}>
          <UberBadge />
          <div style={{flex: 1}}>
            <div style={{fontSize: 16, fontWeight: 700}}>Envío con Uber</div>
            <div style={{fontSize: 13.5, color: '#444', marginTop: 3}}>⏱ Llega en {d.delivery.uberEta}</div>
          </div>
          <div style={{fontSize: 22, fontWeight: 700}}>{money(d.delivery.uberPrice)}</div>
        </div>
      )}
      {ready && <div style={{position: 'absolute', top: 572, left: 20, right: 20, fontSize: 12.5, color: colors.muted, opacity: quote}}>Precio y tiempo cotizados en tiempo real con Uber.</div>}
      <div style={{opacity: ready ? 1 : 0.45}}>
        <Btn label="Continuar al pago" pressed={f >= T.tapContinue2 && f < T.tapContinue2 + 8} />
      </div>
    </>
  );
};

const Pay: React.FC<{f: number; d: OrdersData}> = ({f, d}) => {
  const {colors} = useBrand();
  const lines = d.items.filter((i) => i.qty);
  const sub = lines.reduce((a, i) => a + i.qty! * i.price, 0);
  const total = sub + d.delivery.uberPrice;
  const sheet = prog(f, T.paySheet, T.paySheet + 14);
  const ok = f >= T.payOk;
  const row = (l: React.ReactNode, r: string, bold?: boolean, big?: boolean) => (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: big ? 19 : 15, fontWeight: bold ? 700 : 400}}>
      <span>{l}</span>
      <span>{r}</span>
    </div>
  );
  return (
    <>
      <Back title={`Hola, ${d.customer} 👋`} sub="Revisa tu pedido y paga" />
      <div style={{position: 'absolute', left: 16, right: 16, top: 178, borderRadius: 18, background: '#fff', border: `1px solid ${colors.line}`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9, boxSizing: 'border-box'}}>
        {lines.map((it) => (
          <div key={it.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4a423b'}}>
            <span>
              {it.name} ×{it.qty}
            </span>
            <span>{money(it.qty! * it.price)}</span>
          </div>
        ))}
        <div style={{height: 1, background: colors.line, margin: '3px 0'}} />
        {row('Productos', money(sub), true)}
        {row(
          <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <UberBadge size={24} /> Envío con Uber · {d.delivery.uberEta}
          </span>,
          money(d.delivery.uberPrice),
          true,
        )}
        <div style={{height: 1, background: colors.line, margin: '3px 0'}} />
        {row('Total', `${money(total)} MXN`, true, true)}
      </div>
      <div style={{position: 'absolute', left: 20, right: 20, top: 520, fontSize: 13, color: colors.muted, display: 'flex', gap: 6}}>📍 {d.delivery.address}</div>
      <Btn
        top={634}
        black
        pressed={f >= T.tapApplePay && f < T.tapApplePay + 8}
        label={
          <>
            Pagar con <b style={{fontWeight: 700}}>Apple Pay</b>
          </>
        }
      />
      <Btn top={698} outline label="Pagar con tarjeta" />
      {sheet > 0 && (
        <>
          <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.3 * sheet})`, zIndex: 40}} />
          <div style={{position: 'absolute', left: 8, right: 8, bottom: 80, height: 330, borderRadius: 32, background: '#f2f2f2', zIndex: 41, transform: `translateY(${(1 - sheet) * 440}px)`, padding: '18px 22px', boxSizing: 'border-box', color: '#111'}}>
            <div style={{fontSize: 21, fontWeight: 600}}>Apple Pay</div>
            <div style={{marginTop: 14, borderRadius: 14, background: '#fff', padding: '12px 14px', fontSize: 14.5, display: 'flex', flexDirection: 'column', gap: 8}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#777'}}>Tarjeta</span>
                <span>Visa •••• 4242</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#777'}}>Productos</span>
                <span>{money(sub)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#777'}}>Envío con Uber</span>
                <span>{money(d.delivery.uberPrice)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 600}}>
                <span>Pagar a {d.title}</span>
                <span>{money(total)} MXN</span>
              </div>
            </div>
            <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
              {ok ? (
                <>
                  <div style={{width: 54, height: 54, borderRadius: '50%', border: '3px solid #0a84ff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.7 + 0.3 * prog(f, T.payOk, T.payOk + 8)})`}}>
                    <svg width="28" height="28" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#0a84ff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={{fontSize: 15, fontWeight: 600}}>Listo</div>
                </>
              ) : (
                <>
                  <div style={{width: 54, height: 54, borderRadius: 16, border: '2px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 6))}}>⌁</div>
                  <div style={{fontSize: 14, color: '#555'}}>Haz doble clic para pagar</div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const Done: React.FC<{f: number; d: OrdersData}> = ({f, d}) => {
  const brand = useBrand();
  const {colors} = brand;
  const s = T.done[0];
  const p = prog(f, s + 2, s + 16);
  const draw = prog(f, s + 10, s + 26);
  const banner = prog(f, s + 50, s + 62);
  const steps = [
    {t: 'Pedido recibido', sub: 'Pagado con Apple Pay', state: 'done'},
    {t: 'Preparando tus cortes', sub: 'La cocina ya tiene tu pedido', state: 'now'},
    {t: 'En camino con Uber', sub: `Llega aprox. a las ${d.delivery.arrival}`, state: 'next'},
  ];
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <WaBanner p={banner} from={d.from}>
        ¡Gracias, {d.customer}! 🔥 Tu pedido {d.orderNumber} está confirmado. Te avisamos cuando el repartidor de Uber vaya en camino.
      </WaBanner>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{width: 104, height: 104, borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * p})`, opacity: p, boxShadow: `0 0 0 ${16 * p}px ${rgba(colors.accent, 0.18)}`}}>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <path d="M16 33l11 11 22-24" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - draw)} />
          </svg>
        </div>
        <div style={{marginTop: 22, fontFamily: brand.displayFont, fontSize: 28, fontWeight: 700, opacity: prog(f, s + 12, s + 22)}}>¡Pedido confirmado!</div>
        <div style={{marginTop: 6, fontSize: 14.5, color: colors.muted, opacity: prog(f, s + 16, s + 26)}}>
          Pedido {d.orderNumber} · {d.title}
        </div>
      </div>
      <div style={{position: 'absolute', left: 16, right: 16, top: 400, borderRadius: 18, background: '#fff', border: `1px solid ${colors.line}`, padding: '16px 16px 6px', boxSizing: 'border-box', opacity: prog(f, s + 22, s + 34), transform: `translateY(${(1 - prog(f, s + 22, s + 34)) * 16}px)`}}>
        {steps.map((st, i) => (
          <div key={st.t} style={{display: 'flex', gap: 12, minHeight: 62}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{width: 22, height: 22, borderRadius: 11, background: st.state === 'done' ? colors.accent : st.state === 'now' ? '#fff' : colors.line, border: st.state === 'now' ? `3px solid ${colors.accent}` : 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, transform: st.state === 'now' ? `scale(${1 + 0.12 * Math.sin(f / 5)})` : 'none'}}>{st.state === 'done' ? '✓' : ''}</div>
              {i < steps.length - 1 && <div style={{width: 2, flex: 1, background: colors.line, margin: '4px 0'}} />}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 15.5, fontWeight: 700, color: st.state === 'next' ? colors.muted : colors.dark, display: 'flex', alignItems: 'center', gap: 8}}>
                {st.t} {i === 2 && <UberBadge size={22} />}
              </div>
              <div style={{fontSize: 12.5, color: colors.muted, marginTop: 2}}>{st.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ marco
const OrdersScreen: React.FC<{d: OrdersData}> = ({d}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const steps: {a: number; b: number; render: () => React.ReactNode}[] = [
    {a: T.menu[0], b: T.menu[1], render: () => <Menu f={f} d={d} />},
    {a: T.cart[0], b: T.cart[1], render: () => <Cart f={f} d={d} />},
    {a: T.delivery[0], b: T.delivery[1], render: () => <Delivery f={f} d={d} />},
    {a: T.pay[0], b: T.pay[1], render: () => <Pay f={f} d={d} />},
    {a: T.done[0], b: T.done[1] + 20, render: () => <Done f={f} d={d} />},
  ];
  // la barra de estado va blanca sobre la foto de portada mientras no se haga scroll
  const darkTop = f < T.scrollAt + 6;
  return (
    <div style={{position: 'absolute', inset: 0, background: colors.paper, color: colors.dark, overflow: 'hidden'}}>
      {steps.map((s, i) => {
        if (f < s.a || f >= s.b + 12) return null;
        const enter = i === 0 ? 1 : prog(f, s.a, s.a + 12);
        const exit = i === steps.length - 1 ? 0 : prog(f, s.b, s.b + 12);
        return (
          <div key={i} style={{position: 'absolute', inset: 0, background: colors.paper, transform: `translateX(${(1 - enter) * SW - exit * 120}px)`, opacity: 1 - exit * 0.6, boxShadow: enter < 1 ? '-10px 0 30px rgba(0,0,0,.1)' : 'none'}}>
            {s.render()}
          </div>
        );
      })}
      {/* al hacer scroll en el menú, la barra de estado toma fondo para que la lista no se vea detrás */}
      {f >= T.scrollAt && f < T.menu[1] + 12 && <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 65, background: colors.paper, opacity: prog(f, T.scrollAt, T.scrollAt + 8), boxShadow: '0 1px 0 rgba(0,0,0,.06)'}} />}
      <StatusBar time={d.statusTime ?? '12:40'} dark={darkTop} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, background: colors.paper, borderTop: `1px solid ${colors.line}`, zIndex: 30}}>
        <div style={{margin: '8px auto 0', width: SW - 32, height: 38, borderRadius: 12, background: '#fff', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, gap: 6, color: '#333'}}>
          <span style={{fontSize: 11}}>🔒</span> {d.url}
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
};

export const ordersStorefront = (d: OrdersData): PhoneScene => {
  const sub = d.subtitles ?? {};
  const adds = addTaps(d);
  const taps: Tap[] = adds.map((t) => ({f: t.f, x: 340, y: LIST_TOP + t.item * ROW + 10 + (ROW - 10) / 2 - (t.scrolled ? SCROLL : 0)}));
  // primer toque después del scroll: el dedo arrastra la lista hacia arriba
  const scrollTap: Tap = {f: T.scrollAt, x: 200, y: 640, to: {x: 200, y: 640 - SCROLL, d: 18}};
  const zooms: Zoom[] = [
    {a: T.firstAdd - 10, b: adds[adds.length - 1].f + 14, x: 230, y: 520, s: 1.25},
    {a: T.quoteIn - 4, b: T.tapContinue2 - 12, x: 195, y: 470, s: 1.4},
    {a: T.paySheet - 60, b: T.paySheet - 6, x: 195, y: 330, s: 1.3},
  ];
  return {
    id: 'storefront-pedidos',
    duration: T.done[1],
    enter: 'up',
    Component: () => <OrdersScreen d={d} />,
    taps: [
      ...taps.filter((t) => adds.find((a) => a.f === t.f && !a.scrolled)),
      scrollTap,
      ...taps.filter((t) => adds.find((a) => a.f === t.f && a.scrolled)),
      {f: T.tapCart, x: 195, y: CART_BAR + 28},
      {f: T.tapContinue, x: 195, y: 723},
      {f: T.tapDelivery, x: 195, y: OPT_TOP + 39},
      {f: T.typeAddr[0] - 6, x: 195, y: 417},
      {f: T.tapContinue2, x: 195, y: 723},
      {f: T.tapApplePay, x: 195, y: 661},
    ].sort((a, b) => a.f - b.f),
    zooms,
    subtitles: [
      {at: T.menu[0], text: sub.menu ?? 'Tu menú en línea, con tu marca.'},
      {at: T.firstAdd - 6, text: sub.add ?? 'Arman su pedido en unos cuantos toques.'},
      {at: T.cart[0], text: sub.cart ?? 'Revisan su pedido.'},
      {at: T.delivery[0], text: sub.delivery ?? 'Eligen a domicilio o para recoger.'},
      {at: T.quoteIn, text: sub.quote ?? 'Uber cotiza el envío al momento: precio y tiempo.'},
      {at: T.pay[0], text: sub.pay ?? 'Ven productos y envío por separado, y pagan todo junto.'},
      {at: T.done[0], text: sub.done ?? 'Listo: pedido confirmado por WhatsApp.'},
    ],
  };
};
