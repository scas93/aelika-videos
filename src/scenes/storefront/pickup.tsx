import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {useBrand} from '../../core/brand';
import {BrandAvatar, HomeIndicator, StatusBar} from '../../core/Phone';
import {SW, prog, rgba, typed} from '../../core/theme';
import {PhoneScene, Tap, Zoom} from '../../core/types';
import {WaBanner} from './classes';

/**
 * Storefront de PEDIDO PARA RECOGER CON CONFIRMACIÓN (panaderías, pastelerías, encargos…).
 * Imita el diseño real del storefront de Aelika (cuadrícula de productos y hojas que suben).
 * Flujo: menú → carrito → datos → fecha y horario → resumen (sin pago) → pedido enviado,
 *        pendiente de que el negocio confirme por WhatsApp.
 */
export type PickupItem = {name: string; price: number; photo: string; /** cuántas piezas pide el cliente */ qty?: number; /** etiqueta corta en el resumen, p. ej. "conchas" */ short?: string; /** producto destacado: tarjeta de color con listón, p. ej. "🎀 Temporada" */ badge?: string};

export type PickupData = {
  url: string;
  title: string;
  /** chips de categorías (decorativos) */
  categories: string[];
  /** 8 productos (cuadrícula de 2 columnas); los de las filas 3–4 requieren scroll */
  items: PickupItem[];
  /** modo solicitud: datos del cliente */
  customer?: {name: string; phone: string};
  /** modo solicitud: sucursal */
  pickup?: {address: string};
  /** días: [etiqueta, número, deshabilitado?] */
  days?: [string, string, boolean?][];
  pickDay?: number;
  dayLong?: string;
  /** horarios del día elegido: [hora, lleno?] */
  slots?: [string, boolean?][];
  pickSlot?: number;
  orderNumber: string;
  /** quién manda el aviso de WhatsApp al final */
  from: string;
  /** nota de pago en el resumen */
  payNote?: string;
  /** el teléfono ya viene cargado desde WhatsApp (no se teclea) */
  phonePrefilled?: boolean;
  /** textos de la solicitud: botón de envío, título y nota de la pantalla final, aviso de WhatsApp */
  sendLabel?: string;
  sentTitle?: string;
  sentPill?: string;
  sentNote?: string;
  sentBanner?: string;
  /** nota bajo los horarios (default: anticipación de un día) */
  scheduleNote?: string;
  statusTime?: string;
  /**
   * Modo "RECOGER YA" (cafeterías): sin datos ni fecha. Tras el carrito: recoger lo antes posible + cómo pagar
   * (en tienda o con tarjeta) → Apple Pay → pedido confirmado. Sin `now`, es el modo solicitud (Karmele).
   */
  now?: {
    /** "~15 min" */
    ready: string;
    address: string;
    /** texto del aviso de WhatsApp al terminar */
    banner: string;
  };
  subtitles?: Partial<Record<'menu' | 'cart' | 'data' | 'schedule' | 'summary' | 'sent' | 'checkout' | 'applePay' | 'done', string>>;
};

// ------------------------------------------------------------------ tiempos (frames locales)
export const PICKUP_T = {
  menu: [0, 214],
  cart: [214, 300],
  data: [300, 410],
  schedule: [410, 570],
  summary: [570, 690],
  sent: [690, 800],
  firstAdd: 34,
  scrollAt: 128,
  tapCart: 196,
  tapContinue1: 276,
  typeName: [318, 344],
  typePhone: [354, 376],
  tapContinue2: 392,
  tapDay: 446,
  tapSlot: 486,
  tapContinue3: 548,
  tapSend: 668,
} as const;
const T = PICKUP_T;
/** tiempos del modo "recoger ya" (después del carrito) */
export const PICKUP_NOW_T = {
  checkout: [300, 520],
  tapCard: 362,
  tapApplePay: 404,
  paySheet: 412,
  payOk: 466,
  done: [520, 640],
} as const;
const N = PICKUP_NOW_T;

const GRID_TOP = 268;
const CARD_W = 171;
const CARD_H = 236;
const GAP = 16;
const SCROLL = 250;
const BAR_Y = 700;
const colX = (c: number) => 16 + c * (CARD_W + GAP);
const rowY = (r: number) => GRID_TOP + r * (CARD_H + 14);
export const money = (n: number) => '$' + n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

/** toques de "+": uno lento al empezar cada producto y luego rápidos (como dejar presionado) */
const addTaps = (d: PickupData) => {
  const out: {item: number; f: number; scrolled: boolean}[] = [];
  let f: number = T.firstAdd;
  let scrolled = false;
  d.items.forEach((it, i) => {
    if (!it.qty) return;
    const row = Math.floor(i / 2);
    if (row >= 2 && !scrolled) {
      scrolled = true;
      f = Math.max(f + 6, T.scrollAt + 22);
    }
    for (let k = 0; k < it.qty; k++) {
      out.push({item: i, f, scrolled});
      f += k === 0 ? 12 : 4;
    }
    f += 10;
  });
  return out;
};
const qtyAt = (d: PickupData, f: number) => {
  const taps = addTaps(d);
  return d.items.map((_, i) => taps.filter((t) => t.item === i && f >= t.f).length);
};
const total = (d: PickupData) => d.items.reduce((a, it) => a + (it.qty ?? 0) * it.price, 0);

// ------------------------------------------------------------------ piezas
export const Header: React.FC<{title: string; back?: boolean}> = ({title, back = true}) => {
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', top: 56, left: 16, right: 16, height: 44, display: 'flex', alignItems: 'center', gap: 14}}>
      {back && (
        <div style={{width: 38, height: 38, borderRadius: 19, border: `1px solid ${colors.line}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="10" height="16" viewBox="0 0 10 16">
            <path d="M8 2 2 8l6 6" fill="none" stroke={colors.dark} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div style={{fontSize: 21, fontWeight: 700, letterSpacing: -0.3}}>{title}</div>
    </div>
  );
};

export const BlackBtn: React.FC<{label: React.ReactNode; top?: number; pressed?: boolean; disabled?: boolean}> = ({label, top = 718, pressed, disabled}) => {
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', left: 16, right: 16, top, height: 52, borderRadius: 14, background: disabled ? '#b9b9b9' : colors.dark, color: '#fff', fontSize: 16.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: pressed ? 'scale(.97)' : 'none'}}>
      {label}
    </div>
  );
};

export const Input: React.FC<{label: string; top: number; value: string; placeholder: string; focus: boolean; f: number; tag?: string}> = ({label, top, value, placeholder, focus, f, tag}) => {
  const {colors} = useBrand();
  return (
    <>
      <div style={{position: 'absolute', top, left: 18, fontSize: 14, fontWeight: 600}}>{label}</div>
      <div style={{position: 'absolute', top: top + 24, left: 16, right: 16, height: 50, borderRadius: 12, background: '#fff', border: `${focus ? 2 : 1}px solid ${focus ? colors.accent : colors.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16.5, boxSizing: 'border-box'}}>
        {value ? <span>{value}</span> : <span style={{color: '#a6a6a6'}}>{focus ? '' : placeholder}</span>}
        {focus && f % 30 < 18 && <span style={{width: 2, height: 21, background: colors.accent, marginLeft: 1}} />}
        {tag && <span style={{marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#1f8a4c', background: '#e6f6ec', borderRadius: 999, padding: '3px 9px'}}>{tag}</span>}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ pantallas
const Menu: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const q = qtyAt(d, f);
  const scrollY = SCROLL * prog(f, T.scrollAt, T.scrollAt + 18);
  const count = q.reduce((a, b) => a + b, 0);
  const sum = q.reduce((a, n, i) => a + n * d.items[i].price, 0);
  const bar = prog(f, T.firstAdd + 2, T.firstAdd + 12);
  const last = addTaps(d).filter((t) => t.f <= f).pop();
  const bump = last ? 1 - prog(f, last.f, last.f + 5) : 0;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-scrollY}px)`}}>
        <div style={{position: 'absolute', top: 54, left: 0, right: 0, height: 62, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderBottom: `1px solid ${colors.line}`, background: '#fff'}}>
          <svg width="10" height="16" viewBox="0 0 10 16">
            <path d="M8 2 2 8l6 6" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <BrandAvatar size={36} />
          <div>
            <div style={{fontSize: 16.5, fontWeight: 700}}>{d.title}</div>
            <div style={{fontSize: 12.5, color: colors.muted}}>{d.url}</div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 134, left: 16, fontSize: 23, fontWeight: 700, letterSpacing: -0.4}}>Hola, ¿qué necesitas hoy?</div>
        <div style={{position: 'absolute', top: 176, left: 16, right: 16, height: 40, borderRadius: 10, background: '#fff', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 14.5, color: '#9a9a9a'}}>Busca en el menú…</div>
        <div style={{position: 'absolute', top: 226, left: 16, right: 0, display: 'flex', gap: 8}}>
          {d.categories.map((c, i) => (
            <div key={c} style={{height: 32, padding: '0 14px', borderRadius: 16, background: i === 0 ? colors.dark : '#ececee', color: i === 0 ? '#fff' : '#444', display: 'flex', alignItems: 'center', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap'}}>{c}</div>
          ))}
        </div>
        {d.items.map((it, i) => {
          const n = q[i];
          const x = colX(i % 2);
          const y = rowY(Math.floor(i / 2)) + 14;
          return (
            <div key={it.name} style={{position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H, borderRadius: 16, background: it.badge ? rgba(colors.accent, 0.14) : '#fff', border: it.badge ? `2px solid ${colors.accent}` : 'none', boxSizing: 'border-box', boxShadow: it.badge ? `0 4px 14px ${rgba(colors.accent, 0.3)}` : '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden'}}>
              <div style={{position: 'relative', margin: 8, height: 150, borderRadius: 12, overflow: 'hidden'}}>
                <Img src={staticFile(it.photo)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                {it.badge && <div style={{position: 'absolute', top: 6, left: 6, padding: '4px 9px', borderRadius: 999, background: colors.accent, color: '#fff', fontSize: 11.5, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,.25)'}}>{it.badge}</div>}
                {n ? (
                  <div style={{position: 'absolute', right: 6, bottom: 6, height: 32, borderRadius: 16, background: colors.dark, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px', fontSize: 14.5, fontWeight: 700}}>
                    <span style={{width: 18, textAlign: 'center', opacity: 0.8}}>−</span>
                    <span style={{minWidth: 18, textAlign: 'center', transform: `scale(${last?.item === i ? 1 + 0.3 * bump : 1})`}}>{n}</span>
                    <span style={{width: 18, textAlign: 'center'}}>+</span>
                  </div>
                ) : (
                  <div style={{position: 'absolute', right: 6, bottom: 6, width: 32, height: 32, borderRadius: 16, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600}}>+</div>
                )}
              </div>
              <div style={{padding: '0 10px', fontSize: 14, fontWeight: 500, lineHeight: '18px', height: 36, overflow: 'hidden'}}>{it.name}</div>
              <div style={{padding: '4px 10px 0', fontSize: 14.5, fontWeight: 700, color: it.badge ? colors.accentDark : undefined}}>{money(it.price)}</div>
            </div>
          );
        })}
      </div>
      {bar > 0 && (
        <div style={{position: 'absolute', left: '50%', top: BAR_Y + (1 - bar) * 80, transform: `translateX(-50%) scale(${f >= T.tapCart && f < T.tapCart + 8 ? 0.96 : 1})`, height: 50, borderRadius: 25, background: colors.dark, color: '#fff', display: 'flex', alignItems: 'center', gap: 22, padding: '0 24px', fontSize: 15.5, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(0,0,0,.25)', zIndex: 20}}>
          <span>
            {count} artículo{count === 1 ? '' : 's'}
          </span>
          <span style={{transform: `scale(${1 + 0.08 * bump})`}}>{money(sum)}</span>
        </div>
      )}
    </>
  );
};

const CartSheet: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const p = prog(f, T.cart[0] + 2, T.cart[0] + 16);
  const lines = d.items.filter((i) => i.qty);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.55 * p})`, zIndex: 30}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 72, height: 470, borderRadius: '22px 22px 0 0', background: '#fff', zIndex: 31, transform: `translateY(${(1 - p) * 560}px)`}}>
        <div style={{position: 'absolute', top: 22, left: 18, right: 18, display: 'flex', alignItems: 'center', gap: 12, fontSize: 19, fontWeight: 700}}>
          <span style={{fontSize: 18, fontWeight: 400}}>✕</span> Confirma tu pedido
        </div>
        {lines.map((it, i) => (
          <div key={it.name} style={{position: 'absolute', left: 16, right: 16, top: 72 + i * 74, height: 64, borderRadius: 12, background: '#f4f4f6', display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px'}}>
            <Img src={staticFile(it.photo)} style={{width: 44, height: 44, borderRadius: 8, objectFit: 'cover'}} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 14.5, fontWeight: 600}}>{it.name}</div>
              <div style={{fontSize: 12.5, color: colors.muted}}>{money(it.price)} c/u</div>
            </div>
            <div style={{height: 30, borderRadius: 15, background: colors.dark, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', fontSize: 14, fontWeight: 700}}>
              <span>−</span>
              <span>{it.qty}</span>
              <span>+</span>
            </div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 18, right: 18, top: 86 + lines.length * 74, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700}}>
          <span>Total estimado</span>
          <span>{money(total(d))}</span>
        </div>
        <div style={{position: 'absolute', left: 16, right: 16, bottom: 18}}>
          <div style={{height: 52, borderRadius: 14, background: colors.dark, color: '#fff', fontSize: 16.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: f >= T.tapContinue1 && f < T.tapContinue1 + 8 ? 'scale(.97)' : 'none'}}>
            Continuar ({lines.reduce((a, i) => a + i.qty!, 0)} artículos)
          </div>
        </div>
      </div>
    </>
  );
};

const Data: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const name = typed(d.customer!.name, f, T.typeName[0], T.typeName[1]);
  const phone = d.phonePrefilled ? d.customer!.phone : typed(d.customer!.phone, f, T.typePhone[0], T.typePhone[1]);
  return (
    <>
      <Header title="Tus datos" />
      <Input label="Nombre" top={128} value={name} placeholder="Tu nombre" focus={f >= T.typeName[0] - 6 && f < (d.phonePrefilled ? T.tapContinue2 : T.typePhone[0] - 4)} f={f} />
      <Input label="Teléfono" top={214} value={phone} placeholder="33 1234 5678" focus={!d.phonePrefilled && f >= T.typePhone[0] - 4 && f < T.tapContinue2} f={f} tag={d.phonePrefilled ? '✓ de WhatsApp' : undefined} />
      <div style={{position: 'absolute', top: 300, left: 18, right: 18, fontSize: 13, color: '#8a8a8a'}}>Te avisaremos por WhatsApp cuando tu pedido cambie de estatus.</div>
      <BlackBtn label="Continuar" disabled={!phone} pressed={f >= T.tapContinue2 && f < T.tapContinue2 + 8} />
    </>
  );
};

const Schedule: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const dayOn = f >= T.tapDay;
  const slotsIn = prog(f, T.tapDay + 4, T.tapDay + 16);
  return (
    <>
      <Header title="¿Cuándo pasas por él?" />
      <div style={{position: 'absolute', top: 118, left: 16, right: 16, borderRadius: 14, background: '#fff', border: `2px solid ${colors.dark}`, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center'}}>
        <div style={{fontSize: 24}}>🏪</div>
        <div>
          <div style={{fontSize: 15.5, fontWeight: 700}}>Recoger en tienda</div>
          <div style={{fontSize: 12.5, color: colors.muted, marginTop: 1}}>{d.pickup!.address}</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 208, left: 18, fontSize: 14, fontWeight: 600}}>Día</div>
      <div style={{position: 'absolute', top: 234, left: 16, right: 0, display: 'flex', gap: 8}}>
        {d.days!.map(([lab, num, off], i) => {
          const on = dayOn && i === d.pickDay!;
          return (
            <div key={i} style={{width: 62, height: 58, borderRadius: 12, border: `1.5px solid ${on ? colors.dark : colors.line}`, background: on ? colors.dark : off ? '#f1f1f1' : '#fff', color: on ? '#fff' : off ? '#b5b5b5' : colors.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
              <div style={{fontSize: 12.5, fontWeight: 600}}>{lab}</div>
              <div style={{fontSize: 11.5, opacity: 0.8}}>{off ? 'sin cupo' : `${num} nov`}</div>
            </div>
          );
        })}
      </div>
      <div style={{opacity: slotsIn, transform: `translateY(${(1 - slotsIn) * 10}px)`}}>
        <div style={{position: 'absolute', top: 314, left: 18, fontSize: 14, fontWeight: 600}}>Horario · {d.dayLong!}</div>
        <div style={{position: 'absolute', top: 342, left: 16, right: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8}}>
          {d.slots!.map(([h, full], i) => {
            const on = f >= T.tapSlot && i === d.pickSlot!;
            return (
              <div key={h} style={{height: 50, borderRadius: 12, border: `1.5px solid ${on ? colors.dark : colors.line}`, background: on ? colors.dark : full ? '#f1f1f1' : '#fff', color: on ? '#fff' : full ? '#b5b5b5' : colors.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, textDecoration: full ? 'line-through' : 'none'}}>
                {h}
                {full && <span style={{fontSize: 10.5, fontWeight: 500, textDecoration: 'none'}}>lleno</span>}
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', top: 354 + Math.ceil(d.slots!.length / 3) * 58, left: 18, right: 18, fontSize: 12.5, color: '#8a8a8a'}}>{d.scheduleNote ?? 'Pide con al menos un día de anticipación.'}</div>
      </div>
      <BlackBtn label="Continuar" disabled={f < T.tapSlot} pressed={f >= T.tapContinue3 && f < T.tapContinue3 + 8} />
    </>
  );
};

const Summary: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const lines = d.items.filter((i) => i.qty);
  return (
    <>
      <Header title="Revisa tu pedido" />
      <div style={{position: 'absolute', top: 116, left: 16, right: 16, borderRadius: 14, background: '#fff', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8}}>
        {lines.map((it) => (
          <div key={it.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: 14.5}}>
            <span>
              {it.qty}× {it.name}
            </span>
            <span>{money(it.qty! * it.price)}</span>
          </div>
        ))}
        <div style={{height: 1, background: colors.line, margin: '2px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700}}>
          <span>Total</span>
          <span>{money(total(d))}</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 290, left: 16, right: 16, borderRadius: 14, background: '#fff', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14.5}}>
        <div>🏪 Recoger en tienda</div>
        <div>
          📅 <b>{d.dayLong!}</b> · {d.slots![d.pickSlot!][0]}
        </div>
        <div>
          👤 {d.customer!.name} · {d.customer!.phone}
        </div>
      </div>
      <div style={{position: 'absolute', top: 420, left: 16, right: 16, borderRadius: 14, background: rgba(colors.accent, 0.12), border: `1px solid ${rgba(colors.accent, 0.4)}`, padding: '12px 14px', fontSize: 14, lineHeight: 1.45, color: '#3d2a1c'}}>{d.payNote}</div>
      <BlackBtn label={`${d.sendLabel ?? 'Enviar pedido'} · ${money(total(d))}`} pressed={f >= T.tapSend && f < T.tapSend + 8} />
    </>
  );
};

const Sent: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const s = T.sent[0];
  const p = prog(f, s + 2, s + 16);
  const banner = prog(f, s + 48, s + 60);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <WaBanner p={banner} from={d.from}>
        {d.sentBanner ?? `Recibimos tu pedido ${d.orderNumber} 🥐 Lo estamos revisando y te confirmamos en unos minutos.`}
      </WaBanner>
      <div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{width: 104, height: 104, borderRadius: '50%', background: '#fff4e5', border: `3px solid ${colors.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, transform: `scale(${0.6 + 0.4 * p})`, opacity: p}}>⏳</div>
        <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, opacity: prog(f, s + 10, s + 20)}}>{d.sentTitle ?? '¡Pedido enviado!'}</div>
        <div style={{marginTop: 8, padding: '5px 12px', borderRadius: 999, background: '#fff4e5', color: '#9a5a12', fontSize: 13, fontWeight: 700, opacity: prog(f, s + 14, s + 24)}}>
          {d.sentPill ?? `Pedido ${d.orderNumber} · Pendiente de confirmación`}
        </div>
        <div style={{marginTop: 18, padding: '0 34px', textAlign: 'center', fontSize: 15, lineHeight: 1.5, color: '#555', opacity: prog(f, s + 18, s + 28)}}>
          {d.sentNote ?? `${d.title} revisa la disponibilidad para el ${d.dayLong!.toLowerCase()} a las ${d.slots![d.pickSlot!][0]} y te confirma por WhatsApp con los datos para pagar.`}
        </div>
      </div>
    </div>
  );
};


// ------------------------------------------------------------------ modo "recoger ya"
const Checkout: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const lines = d.items.filter((i) => i.qty);
  const card = f >= N.tapCard;
  const sheet = prog(f, N.paySheet, N.paySheet + 14);
  const ok = f >= N.payOk;
  const opt = (on: boolean, icon: string, t: string, sub: string, left: number) => (
    <div style={{position: 'absolute', top: 470, left, width: 171, height: 76, borderRadius: 14, background: '#fff', border: `${on ? 2 : 1}px solid ${on ? colors.dark : colors.line}`, boxSizing: 'border-box', padding: '10px 12px'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{fontSize: 20}}>{icon}</span>
        <div style={{width: 18, height: 18, borderRadius: '50%', border: `2px solid ${on ? colors.dark : '#c9c9c9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>{on && <div style={{width: 9, height: 9, borderRadius: '50%', background: colors.dark}} />}</div>
      </div>
      <div style={{fontSize: 14.5, fontWeight: 700, marginTop: 4}}>{t}</div>
      <div style={{fontSize: 11.5, color: colors.muted}}>{sub}</div>
    </div>
  );
  return (
    <>
      <Header title="Tu pedido" />
      <div style={{position: 'absolute', top: 114, left: 16, right: 16, borderRadius: 14, background: '#fff', border: `2px solid ${colors.dark}`, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center'}}>
        <div style={{fontSize: 24}}>🏪</div>
        <div>
          <div style={{fontSize: 15.5, fontWeight: 700}}>Recoger en tienda · lo antes posible</div>
          <div style={{fontSize: 13, color: '#1f8a4c', fontWeight: 600, marginTop: 2}}>⚡ Listo en {d.now!.ready}</div>
          <div style={{fontSize: 12.5, color: colors.muted, marginTop: 1}}>{d.now!.address}</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 216, left: 16, right: 16, borderRadius: 14, background: '#fff', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 7}}>
        {lines.map((it) => (
          <div key={it.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: 14.5}}>
            <span>
              {it.qty}× {it.name}
            </span>
            <span>{money(it.qty! * it.price)}</span>
          </div>
        ))}
        <div style={{height: 1, background: colors.line, margin: '2px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700}}>
          <span>Total</span>
          <span>{money(total(d))}</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 440, left: 18, fontSize: 15, fontWeight: 700}}>¿Cómo quieres pagar?</div>
      {opt(false, '🏪', 'En tienda', 'Pagas al recoger', 16)}
      {opt(card, '💳', 'Con tarjeta', 'Apple Pay o tarjeta', 203)}
      <div style={{position: 'absolute', left: 16, right: 16, top: 718, height: 52, borderRadius: 14, background: card ? '#000' : '#b9b9b9', color: '#fff', fontSize: 16.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transform: f >= N.tapApplePay && f < N.tapApplePay + 8 ? 'scale(.97)' : 'none'}}>
        {card ? (
          <>
            Pagar con <b style={{fontWeight: 700}}>Apple Pay</b> · {money(total(d))}
          </>
        ) : (
          'Elige cómo pagar'
        )}
      </div>
      {sheet > 0 && (
        <>
          <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.3 * sheet})`, zIndex: 40}} />
          <div style={{position: 'absolute', left: 8, right: 8, bottom: 80, height: 300, borderRadius: 32, background: '#f2f2f2', zIndex: 41, transform: `translateY(${(1 - sheet) * 420}px)`, padding: '18px 22px', boxSizing: 'border-box', color: '#111'}}>
            <div style={{fontSize: 21, fontWeight: 600}}>Apple Pay</div>
            <div style={{marginTop: 14, borderRadius: 14, background: '#fff', padding: '12px 14px', fontSize: 14.5, display: 'flex', flexDirection: 'column', gap: 8}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#777'}}>Tarjeta</span>
                <span>Visa •••• 4242</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 600}}>
                <span>Pagar a {d.title}</span>
                <span>{money(total(d))} MXN</span>
              </div>
            </div>
            <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
              {ok ? (
                <>
                  <div style={{width: 54, height: 54, borderRadius: '50%', border: '3px solid #0a84ff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.7 + 0.3 * prog(f, N.payOk, N.payOk + 8)})`}}>
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

const NowDone: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const s = N.done[0];
  const p = prog(f, s + 2, s + 16);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <WaBanner p={prog(f, s + 44, s + 56)} from={d.from}>
        {d.now!.banner}
      </WaBanner>
      <div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{width: 104, height: 104, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * p})`, opacity: p}}>
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
        </div>
        <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, opacity: prog(f, s + 10, s + 20)}}>¡Pedido confirmado!</div>
        <div style={{marginTop: 8, padding: '5px 12px', borderRadius: 999, background: '#e6f6ec', color: '#1f8a4c', fontSize: 13, fontWeight: 700, opacity: prog(f, s + 14, s + 24)}}>Pedido {d.orderNumber} · Pagado con Apple Pay</div>
        <div style={{marginTop: 18, padding: '0 34px', textAlign: 'center', fontSize: 15, lineHeight: 1.5, color: '#555', opacity: prog(f, s + 18, s + 28)}}>
          Lo empezamos a preparar ya. Estará listo en <b style={{color: colors.dark}}>{d.now!.ready}</b> en {d.now!.address}.
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ marco
const PickupScreen: React.FC<{d: PickupData}> = ({d}) => {
  const f = useCurrentFrame();
  const steps: {a: number; b: number; render: () => React.ReactNode}[] = [
    {
      a: T.menu[0],
      b: T.data[0],
      render: () => (
        <>
          <Menu f={f} d={d} />
          {f >= T.cart[0] && <CartSheet f={f} d={d} />}
        </>
      ),
    },
    ...(d.now
      ? [
          {a: N.checkout[0], b: N.checkout[1], render: () => <Checkout f={f} d={d} />},
          {a: N.done[0], b: N.done[1] + 20, render: () => <NowDone f={f} d={d} />},
        ]
      : [
          {a: T.data[0], b: T.data[1], render: () => <Data f={f} d={d} />},
          {a: T.schedule[0], b: T.schedule[1], render: () => <Schedule f={f} d={d} />},
          {a: T.summary[0], b: T.summary[1], render: () => <Summary f={f} d={d} />},
          {a: T.sent[0], b: T.sent[1] + 20, render: () => <Sent f={f} d={d} />},
        ]),
  ];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f4f4f6', color: '#111', overflow: 'hidden'}}>
      {steps.map((s, i) => {
        if (f < s.a || f >= s.b + 12) return null;
        const enter = i === 0 ? 1 : prog(f, s.a, s.a + 12);
        const exit = i === steps.length - 1 ? 0 : prog(f, s.b, s.b + 12);
        return (
          <div key={i} style={{position: 'absolute', inset: 0, background: '#f4f4f6', transform: `translateX(${(1 - enter) * SW - exit * 120}px)`, opacity: 1 - exit * 0.6, boxShadow: enter < 1 ? '-10px 0 30px rgba(0,0,0,.1)' : 'none'}}>
            {s.render()}
          </div>
        );
      })}
      {f >= T.scrollAt && f < T.data[0] + 12 && <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 25, background: '#f4f4f6', opacity: prog(f, T.scrollAt, T.scrollAt + 8)}} />}
      <StatusBar time={d.statusTime ?? '14:33'} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, background: '#f4f4f6', borderTop: '1px solid #e2e2e6', zIndex: 32}}>
        <div style={{margin: '8px auto 0', width: SW - 32, height: 38, borderRadius: 12, background: '#fff', border: '1px solid #e2e2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, gap: 6, color: '#333'}}>
          <span style={{fontSize: 11}}>🔒</span> {d.url}
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
};

export const pickupStorefront = (d: PickupData): PhoneScene => {
  const sub = d.subtitles ?? {};
  const adds = addTaps(d);
  const addTapsList: Tap[] = adds.map((t) => {
    const i = t.item;
    const y = rowY(Math.floor(i / 2)) + 14 + 8 + 150 - 22 - (t.scrolled ? SCROLL : 0);
    return {f: t.f, x: colX(i % 2) + CARD_W - 30, y};
  });
  // solo se dibuja el dedo en el primer toque de cada producto y en algunos de los rápidos
  const visibleTaps = addTapsList.filter((_, k) => k === 0 || adds[k].item !== adds[k - 1].item || k % 3 === 0);
  const slotXY = (i: number) => ({x: 16 + ((SW - 32 - 16) / 3) * (i % 3) + (SW - 32 - 16) / 6 + 8 * (i % 3), y: 342 + Math.floor(i / 3) * 58 + 25});
  const zooms: Zoom[] = [
    {a: adds[0].f - 8, b: adds[adds.length - 1].f + 12, x: 195, y: 430, s: 1.22},
    {a: T.tapDay - 10, b: T.tapContinue3 - 6, x: 195, y: 360, s: 1.3},
    {a: T.summary[0] + 20, b: T.tapSend - 4, x: 195, y: 380, s: 1.25},
  ];
  if (d.now) {
    const common = [
      ...visibleTaps.filter((_, k) => !adds[addTapsList.indexOf(visibleTaps[k])].scrolled),
      {f: T.scrollAt, x: 200, y: 640, to: {x: 200, y: 640 - SCROLL, d: 18}},
      ...visibleTaps.filter((_, k) => adds[addTapsList.indexOf(visibleTaps[k])].scrolled),
      {f: T.tapCart, x: 195, y: BAR_Y + 25},
      {f: T.tapContinue1, x: 195, y: 844 - 72 - 18 - 26},
    ];
    return {
      id: 'storefront-recoger-ya',
      duration: N.done[1],
      enter: 'up',
      Component: () => <PickupScreen d={d} />,
      taps: [...common, {f: N.tapCard, x: 288, y: 508}, {f: N.tapApplePay, x: 195, y: 744}].sort((a, b) => a.f - b.f),
      zooms: [zooms[0], {a: N.checkout[0] + 24, b: N.tapApplePay - 2, x: 195, y: 470, s: 1.22}],
      marks: {menu: T.menu[0], add: adds[0].f, cart: T.cart[0], checkout: N.checkout[0], card: N.tapCard, applePay: N.tapApplePay, paid: N.payOk, done: N.done[0]},
      subtitles: [
        {at: T.menu[0], text: sub.menu ?? 'Tu menú en línea, con tus productos y precios.'},
        {at: T.cart[0], text: sub.cart ?? 'Revisan su pedido.'},
        {at: N.checkout[0], text: sub.checkout ?? 'Recogen lo antes posible y eligen cómo pagar.'},
        {at: N.tapApplePay - 4, text: sub.applePay ?? 'Pagan con Apple Pay en un toque.'},
        {at: N.done[0], text: sub.done ?? 'Pedido confirmado y pagado.'},
      ],
    };
  }
  return {
    id: 'storefront-recoger',
    duration: T.sent[1],
    enter: 'up',
    Component: () => <PickupScreen d={d} />,
    taps: [
      ...visibleTaps.filter((_, k) => !adds[addTapsList.indexOf(visibleTaps[k])].scrolled),
      {f: T.scrollAt, x: 200, y: 640, to: {x: 200, y: 640 - SCROLL, d: 18}},
      ...visibleTaps.filter((_, k) => adds[addTapsList.indexOf(visibleTaps[k])].scrolled),
      {f: T.tapCart, x: 195, y: BAR_Y + 25},
      {f: T.tapContinue1, x: 195, y: 844 - 72 - 18 - 26},
      {f: T.typeName[0] - 6, x: 195, y: 128 + 24 + 25},
      ...(d.phonePrefilled ? [] : [{f: T.typePhone[0] - 4, x: 195, y: 214 + 24 + 25}]),
      {f: T.tapContinue2, x: 195, y: 744},
      {f: T.tapDay, x: 16 + d.pickDay! * 70 + 31, y: 263},
      {f: T.tapSlot, ...slotXY(d.pickSlot!)},
      {f: T.tapContinue3, x: 195, y: 744},
      {f: T.tapSend, x: 195, y: 744},
    ].sort((a, b) => a.f - b.f),
    zooms,
    marks: {menu: T.menu[0], add: adds[0].f, cart: T.cart[0], data: T.data[0], schedule: T.schedule[0], day: T.tapDay, slot: T.tapSlot, summary: T.summary[0], send: T.tapSend, sent: T.sent[0]},
    subtitles: [
      {at: T.menu[0], text: sub.menu ?? 'Tu menú en línea, con tus productos y precios.'},
      {at: T.cart[0], text: sub.cart ?? 'Revisan su pedido.'},
      {at: T.data[0], text: sub.data ?? 'Dejan su nombre y teléfono.'},
      {at: T.schedule[0], text: sub.schedule ?? 'Eligen día y horario para recogerlo.'},
      {at: T.summary[0], text: sub.summary ?? 'Envían su pedido, sin pagar todavía.'},
      {at: T.sent[0], text: sub.sent ?? 'Queda pendiente de tu confirmación.'},
    ],
  };
};
