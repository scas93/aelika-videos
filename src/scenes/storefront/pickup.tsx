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
    /**
     * opciones de "¿Cuándo pasas por él?" (p. ej. Ahorita / 30 min / 45 min / 60 min / Otra hora) y la elegida.
     * Con `times`, el pago ofrece tres opciones (en tienda, tarjeta, Apple Pay) y se paga con Apple Pay.
     */
    times?: string[];
    pickTime?: number;
    /** hora a la que pasa, p. ej. "10:55 a. m." */
    readyAt?: string;
    /** al tocar "Otra hora" (debe ser la opción `pickTime`): elige día y hora */
    custom?: {days: string[]; pickDay: number; slots: string[]; pickSlot: number; /** sin opciones rápidas: el cliente elige día y hora directo */ direct?: boolean};
    /**
     * CHECKOUT FORMAL en pasos (Carrito › Tus datos › Recogida › Pago): una pantalla por decisión.
     * Tiene prioridad sobre `times` y `custom`.
     */
    steps?: {
      customer: {name: string; phone: string};
      /** [día corto, número, cerrado?], p. ej. ['MIÉ', '25'] */
      days: [string, string, boolean?][];
      pickDay: number;
      /** p. ej. "NOVIEMBRE" */
      month: string;
      /** horarios (3 columnas), p. ej. '9:00 a. m.' */
      slots: string[];
      pickSlot: number;
      /** texto corto de la recogida, p. ej. "Mié 25 de nov · 10:00 a. m." */
      pickupLabel: string;
    };
  };
  subtitles?: Partial<Record<'menu' | 'cart' | 'data' | 'schedule' | 'pickup' | 'summary' | 'sent' | 'checkout' | 'pay' | 'applePay' | 'done', string>>;
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
/** tiempos del modo "recoger ya" con opciones de hora */
export const PICKUP_NOW_TIMES_T = {
  checkout: [300, 580],
  tapTime: 346,
  tapCard: 410,
  tapApplePay: 452,
  paySheet: 460,
  payOk: 514,
  done: [580, 700],
} as const;
/** tiempos con "Otra hora" → día y hora */
export const PICKUP_NOW_CUSTOM_T = {
  checkout: [300, 640],
  tapTime: 346,
  tapDay: 384,
  tapSlot: 414,
  tapCard: 470,
  tapApplePay: 512,
  paySheet: 520,
  payOk: 574,
  done: [640, 760],
} as const;
/** tiempos del checkout formal en pasos */
export const PICKUP_STEPS_T = {
  data: [300, 420],
  typeName: [318, 340],
  typePhone: [350, 374],
  tapData: 396,
  pickup: [420, 570],
  tapDay: 454,
  tapSlot: 494,
  tapPickup: 544,
  pay: [570, 760],
  checkout: [300, 760],
  tapCard: 622,
  tapApplePay: 664,
  paySheet: 672,
  payOk: 726,
  done: [760, 880],
} as const;
type NowTimes = {checkout: readonly number[]; tapCard: number; tapApplePay: number; paySheet: number; payOk: number; done: readonly number[]; tapTime?: number; tapDay?: number; tapSlot?: number};
const nowT = (d: PickupData): NowTimes => (d.now?.steps ? PICKUP_STEPS_T : d.now?.custom ? PICKUP_NOW_CUSTOM_T : d.now?.times ? PICKUP_NOW_TIMES_T : PICKUP_NOW_T);

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
const ApplePaySheet: React.FC<{f: number; d: PickupData; N: NowTimes}> = ({f, d, N}) => {
  const sheet = prog(f, N.paySheet, N.paySheet + 14);
  const ok = f >= N.payOk;
  return (
    <>
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

const Checkout: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const N = nowT(d);
  if (d.now!.times || d.now!.custom?.direct) return <CheckoutTimes f={f} d={d} />;
  const {colors} = useBrand();
  const lines = d.items.filter((i) => i.qty);
  const card = f >= N.tapCard;
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
      <ApplePaySheet f={f} d={d} N={N} />
    </>
  );
};


/** checkout con "¿Cuándo pasas por él?" (opciones de hora) y tres formas de pago; paga con Apple Pay */
const TIME_W = (SW - 32 - 4 * 6) / 5;
const PAY_W = (SW - 32 - 16) / 3;
const CheckoutTimes: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const N = nowT(d);
  const now = d.now!;
  const lines = d.items.filter((i) => i.qty);
  const timeOn = f >= N.tapTime!;
  const apple = f >= N.tapCard;
  const cu = now.custom;
  const direct = !!cu?.direct;
  const pick = direct ? 1 : cu ? prog(f, N.tapTime! + 4, N.tapTime! + 16) : 0;
  const DY = direct ? 56 : cu ? 112 * pick : 0; // lo que baja todo al abrir el selector
  const UP = direct ? 56 : 0; // con `direct` no hay fila de opciones rápidas
  const chip = (on: boolean) => ({borderRadius: 12, border: `${on ? 2 : 1}px solid ${on ? colors.dark : colors.line}`, background: on ? colors.dark : '#fff', color: on ? '#fff' : colors.dark, boxSizing: 'border-box' as const});
  const pays: [string, string, string][] = [
    ['🏪', 'En tienda', 'Al recoger'],
    ['💳', 'Tarjeta', 'Crédito o débito'],
    ['📱', 'Apple Pay', 'En un toque'],
  ];
  return (
    <>
      <Header title="Tu pedido" />
      <div style={{position: 'absolute', top: 112, left: 18, fontSize: 15, fontWeight: 700}}>{direct ? '¿Qué día y a qué hora pasas?' : '¿Cuándo pasas por él?'}</div>
      <div style={{position: 'absolute', top: 140, left: 16, display: direct ? 'none' : 'flex', gap: 6}}>
        {(now.times ?? []).map((t, i) => (
          <div key={t} style={{...chip(timeOn && i === now.pickTime), width: TIME_W, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600}}>
            {t}
          </div>
        ))}
      </div>
      {cu && pick > 0 && (
        <div style={{opacity: pick}}>
          <div style={{position: 'absolute', top: 196 - UP, left: 16, display: 'flex', gap: 6}}>
            {cu.days.map((x, i) => (
              <div key={x} style={{...chip(f >= N.tapDay! && i === cu.pickDay), width: TIME_W, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600}}>
                {x}
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', top: 250 - UP, left: 16, display: 'flex', gap: 6}}>
            {cu.slots.map((x, i) => (
              <div key={x} style={{...chip(f >= N.tapSlot! && i === cu.pickSlot), width: TIME_W, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600}}>
                {x}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{position: 'absolute', top: 196 + DY, left: 18, right: 18, fontSize: 13, color: (cu ? f >= N.tapSlot! : timeOn) ? '#1f8a4c' : colors.muted, fontWeight: (cu ? f >= N.tapSlot! : timeOn) ? 600 : 400}}>
        {(cu ? f >= N.tapSlot! : timeOn) ? `⚡ Pasas ${cu ? 'el ' : 'a las '}${now.readyAt} · llegas y te vas, sin hacer fila` : `🏪 Recoges en ${now.address}`}
      </div>
      <div style={{position: 'absolute', top: 228 + DY, left: 16, right: 16, borderRadius: 14, background: '#fff', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 7}}>
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
      <div style={{position: 'absolute', top: 430 + DY - (cu ? 26 : 0), left: 18, fontSize: 15, fontWeight: 700}}>¿Cómo quieres pagar?</div>
      <div style={{position: 'absolute', top: 458 + DY - (cu ? 26 : 0), left: 16, display: 'flex', gap: 8}}>
        {pays.map(([icon, t, sub], i) => {
          const on = apple && i === 2;
          return (
            <div key={t} style={{width: PAY_W, height: 78, borderRadius: 14, background: '#fff', border: `${on ? 2 : 1}px solid ${on ? colors.dark : colors.line}`, boxSizing: 'border-box', padding: '9px 10px'}}>
              <div style={{fontSize: 18, height: 22}}>{icon}</div>
              <div style={{fontSize: 14, fontWeight: 700, marginTop: 4}}>{t}</div>
              <div style={{fontSize: 11, color: colors.muted}}>{sub}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 16, right: 16, top: 718, height: 52, borderRadius: 14, background: apple ? '#000' : '#b9b9b9', color: '#fff', fontSize: 16.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transform: f >= N.tapApplePay && f < N.tapApplePay + 8 ? 'scale(.97)' : 'none'}}>
        {apple ? (
          <>
            Pagar con <b style={{fontWeight: 700}}>Apple Pay</b> · {money(total(d))}
          </>
        ) : (
          'Elige cómo pagar'
        )}
      </div>
      <ApplePaySheet f={f} d={d} N={N} />
    </>
  );
};

// ------------------------------------------------------------------ checkout formal en pasos
const ST = PICKUP_STEPS_T;
const STEP_NAMES = ['Carrito', 'Tus datos', 'Recogida', 'Pago'];
const Stepper: React.FC<{step: number}> = ({step}) => {
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', top: 108, left: 16, right: 16, display: 'flex', gap: 6}}>
      {STEP_NAMES.map((n, i) => (
        <div key={n} style={{flex: 1}}>
          <div style={{height: 4, borderRadius: 2, background: i <= step ? colors.dark : '#dcdce0'}} />
          <div style={{marginTop: 6, fontSize: 11.5, fontWeight: i === step ? 700 : 500, color: i <= step ? colors.dark : '#9a9aa0'}}>
            {i < step ? '✓ ' : ''}
            {n}
          </div>
        </div>
      ))}
    </div>
  );
};

const StepData: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const c = d.now!.steps!.customer;
  const name = typed(c.name, f, ST.typeName[0], ST.typeName[1]);
  const phone = typed(c.phone, f, ST.typePhone[0], ST.typePhone[1]);
  return (
    <>
      <Header title="Tus datos" />
      <Stepper step={1} />
      <Input label="Nombre" top={160} value={name} placeholder="Tu nombre" focus={f >= ST.typeName[0] - 6 && f < ST.typePhone[0] - 4} f={f} />
      <Input label="WhatsApp" top={246} value={phone} placeholder="10 dígitos" focus={f >= ST.typePhone[0] - 4 && f < ST.tapData} f={f} />
      <div style={{position: 'absolute', top: 334, left: 18, right: 18, fontSize: 13, color: '#8a8a8a'}}>Te mandaremos la confirmación y los avisos de tu pedido por WhatsApp.</div>
      <BlackBtn label="Continuar" disabled={phone.length < c.phone.length} pressed={f >= ST.tapData && f < ST.tapData + 8} />
    </>
  );
};

const SLOT_W = (SW - 32 - 16) / 3;
const stepSlotXY = (i: number) => ({x: 16 + (i % 3) * (SLOT_W + 8) + SLOT_W / 2, y: 330 + Math.floor(i / 3) * 54 + 23});
const stepDayXY = (i: number) => ({x: 16 + i * 70 + 31, y: 204 + 37});

const StepPickup: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const st = d.now!.steps!;
  const dayOn = f >= ST.tapDay;
  const slotOn = f >= ST.tapSlot;
  const slotsIn = prog(f, ST.tapDay + 2, ST.tapDay + 14);
  return (
    <>
      <Header title="Recogida" />
      <Stepper step={2} />
      <div style={{position: 'absolute', top: 160, left: 18, fontSize: 17, fontWeight: 700}}>¿Cuándo pasas por tu pedido?</div>
      <div style={{position: 'absolute', top: 186, left: 18, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, color: colors.muted}}>{st.month}</div>
      {st.days.map(([w, n, closed], i) => {
        const on = dayOn && i === st.pickDay;
        return (
          <div key={w + n} style={{position: 'absolute', top: 204, left: 16 + i * 70, width: 62, height: 74, borderRadius: 16, background: on ? colors.dark : closed ? 'transparent' : '#fff', color: on ? '#fff' : closed ? '#b9b9be' : colors.dark, border: `1px solid ${on ? colors.dark : closed ? '#e2e2e6' : colors.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
            <div style={{fontSize: 11, fontWeight: 600, opacity: 0.75}}>{i === 0 ? 'MAÑANA' : w}</div>
            <div style={{fontSize: 22, fontWeight: 700, marginTop: 1, textDecoration: closed ? 'line-through' : 'none'}}>{n}</div>
            {closed && <div style={{fontSize: 9.5, fontWeight: 600}}>Cerrado</div>}
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 298, left: 18, fontSize: 14, fontWeight: 700, opacity: dayOn ? 1 : 0.4}}>Horarios disponibles</div>
      {st.slots.map((t, i) => {
        const on = slotOn && i === st.pickSlot;
        const xy = stepSlotXY(i);
        return (
          <div key={t} style={{position: 'absolute', top: xy.y - 23, left: xy.x - SLOT_W / 2, width: SLOT_W, height: 46, borderRadius: 12, background: on ? colors.dark : '#fff', color: on ? '#fff' : colors.dark, border: `1px solid ${on ? colors.dark : colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14.5, fontWeight: 600, boxSizing: 'border-box', opacity: dayOn ? 0.25 + 0.75 * slotsIn : 0.25}}>
            {t}
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 504, left: 16, right: 16, borderRadius: 14, background: '#fff', border: `1px solid ${colors.line}`, padding: 10, display: 'flex', gap: 12, alignItems: 'center'}}>
        <svg width="60" height="60" viewBox="0 0 60 60" style={{borderRadius: 10, flexShrink: 0}}>
          <rect width="60" height="60" fill="#eef0e9" />
          <path d="M0 38 L60 22 M18 0 L30 60 M44 0 L38 60" stroke="#fff" strokeWidth="6" />
          <path d="M0 38 L60 22" stroke="#fbd96a" strokeWidth="3" />
          <path d="M30 14c-6 0-10 4.5-10 10 0 7.5 10 18 10 18s10-10.5 10-18c0-5.5-4-10-10-10z" fill="#ea4335" />
          <circle cx="30" cy="24" r="3.5" fill="#fff" />
        </svg>
        <div style={{fontSize: 13.5, lineHeight: 1.35}}>
          <div style={{fontWeight: 700}}>Recoges en {d.title}</div>
          <div style={{color: '#6b6b70'}}>{d.now!.address}</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 664, left: 0, right: 0, textAlign: 'center', fontSize: 14, fontWeight: 700, color: slotOn ? '#1f8a4c' : '#9a9aa0'}}>{slotOn ? `📅 ${st.pickupLabel}` : 'Elige día y horario'}</div>
      <BlackBtn label="Continuar al pago" disabled={!slotOn} pressed={f >= ST.tapPickup && f < ST.tapPickup + 8} />
    </>
  );
};

const PAY_ROW_TOP = 446;
const StepPay: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const st = d.now!.steps!;
  const lines = d.items.filter((i) => i.qty);
  const apple = f >= ST.tapCard;
  const row = (label: string, value: React.ReactNode, link?: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, padding: '3px 0'}}>
      <span style={{color: '#6b6b70', width: 84, flexShrink: 0}}>{label}</span>
      <span style={{flex: 1, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13}}>{value}</span>
      {link && <span style={{color: '#0a84ff', fontWeight: 600, fontSize: 13}}>{link}</span>}
    </div>
  );
  const methods: [string, string][] = [
    ['🏪', 'Pagar en tienda'],
    ['💳', 'Tarjeta'],
    ['', 'Apple Pay'],
  ];
  return (
    <>
      <Header title="Pago" />
      <Stepper step={3} />
      <div style={{position: 'absolute', top: 156, left: 16, right: 16, borderRadius: 16, background: '#fff', border: `1px solid ${colors.line}`, padding: '12px 14px'}}>
        <div style={{fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: colors.muted, marginBottom: 6}}>RESUMEN DEL PEDIDO</div>
        {lines.map((it) => (
          <div key={it.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '2px 0'}}>
            <span>
              {it.qty}× {it.name}
            </span>
            <span>{money(it.qty! * it.price)}</span>
          </div>
        ))}
        <div style={{height: 1, background: colors.line, margin: '8px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 16.5, fontWeight: 700}}>
          <span>Total</span>
          <span>{money(total(d))}</span>
        </div>
        <div style={{height: 1, background: colors.line, margin: '8px 0'}} />
        {row('Recoger', st.pickupLabel, 'Cambiar')}
        {row('A nombre de', `${st.customer.name} · ${st.customer.phone}`)}
      </div>
      <div style={{position: 'absolute', top: PAY_ROW_TOP - 28, left: 18, fontSize: 15, fontWeight: 700}}>Método de pago</div>
      {methods.map(([icon, t], i) => {
        const on = i === 2 ? apple : i === 0 && !apple;
        return (
          <div key={t} style={{position: 'absolute', top: PAY_ROW_TOP + i * 58, left: 16, right: 16, height: 50, borderRadius: 12, background: '#fff', border: `${on ? 2 : 1}px solid ${on ? colors.dark : colors.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box', fontSize: 15, fontWeight: on ? 700 : 500, transform: i === 2 && f >= ST.tapCard && f < ST.tapCard + 6 ? 'scale(.97)' : 'none'}}>
            <div style={{width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${on ? colors.dark : '#a0a0a6'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on && <div style={{width: 9, height: 9, borderRadius: '50%', background: colors.dark}} />}</div>
            <span style={{fontSize: 17, width: 22}}>{icon}</span>
            <span style={{flex: 1}}>{t}</span>
            {i === 1 && (
              <span style={{display: 'flex', gap: 4}}>
                {['VISA', 'MC', 'AMEX'].map((b) => (
                  <span key={b} style={{fontSize: 9.5, fontWeight: 800, padding: '3px 5px', borderRadius: 3, border: '1px solid #d9d9de', color: b === 'AMEX' ? '#fff' : '#1a1f71', background: b === 'AMEX' ? '#2e77bb' : '#fff'}}>
                    {b}
                  </span>
                ))}
              </span>
            )}
            {i === 2 && <span style={{fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: '#000', color: '#fff'}}>Apple Pay</span>}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 16, right: 16, top: 718, height: 52, borderRadius: 14, background: apple ? '#000' : colors.dark, color: '#fff', fontSize: 16.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transform: f >= ST.tapApplePay && f < ST.tapApplePay + 8 ? 'scale(.97)' : 'none'}}>
        {apple ? (
          <>
            Pagar con <b style={{fontWeight: 700}}>Apple Pay</b> · {money(total(d))}
          </>
        ) : (
          `Pagar ${money(total(d))}`
        )}
      </div>
      <ApplePaySheet f={f} d={d} N={PICKUP_STEPS_T} />
    </>
  );
};

const NowDone: React.FC<{f: number; d: PickupData}> = ({f, d}) => {
  const {colors} = useBrand();
  const N = nowT(d);
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
          {d.now!.readyAt ? (
            <>
              Pasa por él {d.now!.custom ? 'el' : 'a las'} <b style={{color: colors.dark}}>{d.now!.readyAt}</b> en {d.now!.address}: te estará esperando, sin hacer fila.
            </>
          ) : (
            <>
              Lo empezamos a preparar ya. Estará listo en <b style={{color: colors.dark}}>{d.now!.ready}</b> en {d.now!.address}.
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ marco
const PickupScreen: React.FC<{d: PickupData}> = ({d}) => {
  const f = useCurrentFrame();
  const N = nowT(d);
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
    ...(d.now?.steps
      ? [
          {a: ST.data[0], b: ST.data[1], render: () => <StepData f={f} d={d} />},
          {a: ST.pickup[0], b: ST.pickup[1], render: () => <StepPickup f={f} d={d} />},
          {a: ST.pay[0], b: ST.pay[1], render: () => <StepPay f={f} d={d} />},
          {a: ST.done[0], b: ST.done[1] + 20, render: () => <NowDone f={f} d={d} />},
        ]
      : d.now
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
  if (d.now?.steps) {
    const st = d.now.steps;
    return {
      id: 'storefront-recoger-pasos',
      duration: ST.done[1],
      enter: 'up',
      Component: () => <PickupScreen d={d} />,
      taps: [
        ...visibleTaps.filter((_, k) => !adds[addTapsList.indexOf(visibleTaps[k])].scrolled),
        {f: T.scrollAt, x: 200, y: 640, to: {x: 200, y: 640 - SCROLL, d: 18}},
        ...visibleTaps.filter((_, k) => adds[addTapsList.indexOf(visibleTaps[k])].scrolled),
        {f: T.tapCart, x: 195, y: BAR_Y + 25},
        {f: T.tapContinue1, x: 195, y: 844 - 72 - 18 - 26},
        {f: ST.typeName[0] - 6, x: 195, y: 160 + 24 + 25},
        {f: ST.typePhone[0] - 4, x: 195, y: 246 + 24 + 25},
        {f: ST.tapData, x: 195, y: 744},
        {f: ST.tapDay, ...stepDayXY(st.pickDay)},
        {f: ST.tapSlot, ...stepSlotXY(st.pickSlot)},
        {f: ST.tapPickup, x: 195, y: 744},
        {f: ST.tapCard, x: 195, y: PAY_ROW_TOP + 2 * 58 + 25},
        {f: ST.tapApplePay, x: 195, y: 744},
      ].sort((a, b) => a.f - b.f),
      zooms: [zooms[0], {a: ST.tapDay - 12, b: ST.tapSlot + 34, x: 195, y: 300, s: 1.25}, {a: ST.pay[0] + 16, b: ST.tapCard - 4, x: 195, y: 260, s: 1.22}],
      marks: {menu: T.menu[0], add: adds[0].f, cart: T.cart[0], data: ST.data[0], pickup: ST.pickup[0], checkout: ST.pickup[0], day: ST.tapDay, slot: ST.tapSlot, pay: ST.pay[0], card: ST.tapCard, applePay: ST.tapApplePay, paid: ST.payOk, done: ST.done[0]},
      subtitles: [
        {at: T.menu[0], text: sub.menu ?? 'Tu menú en línea, con tus productos y precios.'},
        {at: T.cart[0], text: sub.cart ?? 'Revisan su pedido.'},
        {at: ST.data[0], text: sub.data ?? 'Dejan su nombre y su WhatsApp.'},
        {at: ST.pickup[0], text: sub.pickup ?? 'Eligen qué día y a qué hora pasan.'},
        {at: ST.pay[0], text: sub.pay ?? 'Pagan en tienda, con tarjeta o con Apple Pay.'},
        {at: ST.tapApplePay - 4, text: sub.applePay ?? 'Con Apple Pay, en un toque.'},
        {at: ST.done[0], text: sub.done ?? 'Pedido confirmado y pagado.'},
      ],
    };
  }
  if (d.now) {
    const N = nowT(d);
    const withTimes = !!d.now.times || !!d.now.custom?.direct;
    const timeX = (i: number) => 16 + i * (TIME_W + 6) + TIME_W / 2;
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
      taps: (withTimes
        ? [
            ...common,
            ...(d.now.custom?.direct ? [] : [{f: N.tapTime!, x: timeX(d.now.pickTime ?? 0), y: 163}]),
            ...(d.now.custom ? [{f: N.tapDay!, x: timeX(d.now.custom.pickDay), y: 218 - (d.now.custom.direct ? 56 : 0)}, {f: N.tapSlot!, x: timeX(d.now.custom.pickSlot), y: 270 - (d.now.custom.direct ? 56 : 0)}] : []),
            {f: N.tapCard, x: 16 + 2 * (PAY_W + 8) + PAY_W / 2, y: 497 + (d.now.custom ? (d.now.custom.direct ? 56 : 112) - 26 : 0)},
            {f: N.tapApplePay, x: 195, y: 744},
          ]
        : [...common, {f: N.tapCard, x: 288, y: 508}, {f: N.tapApplePay, x: 195, y: 744}]
      ).sort((a, b) => a.f - b.f),
      zooms: withTimes
        ? [zooms[0], {a: N.checkout[0] + 20, b: (N.tapSlot ?? N.tapTime!) + 30, x: 195, y: 230, s: 1.3}, {a: (N.tapSlot ?? N.tapTime!) + 40, b: N.tapApplePay - 2, x: 195, y: 520, s: 1.22}]
        : [zooms[0], {a: N.checkout[0] + 24, b: N.tapApplePay - 2, x: 195, y: 470, s: 1.22}],
      marks: {menu: T.menu[0], add: adds[0].f, cart: T.cart[0], checkout: N.checkout[0], time: N.tapTime ?? N.checkout[0], card: N.tapCard, applePay: N.tapApplePay, paid: N.payOk, done: N.done[0]},
      subtitles: [
        {at: T.menu[0], text: sub.menu ?? 'Tu menú en línea, con tus productos y precios.'},
        {at: T.cart[0], text: sub.cart ?? 'Revisan su pedido.'},
        {at: N.checkout[0], text: sub.checkout ?? 'Recogen lo antes posible y eligen cómo pagar.'},
        ...(withTimes ? [{at: (N.tapSlot ?? N.tapTime!) + 36, text: sub.pay ?? 'Eligen cómo pagar.'}] : []),
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
