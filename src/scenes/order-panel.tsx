import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {HomeIndicator, StatusBar} from '../core/Phone';
import {SW, nb, prog} from '../core/theme';
import {Perspective, PhoneScene, Tap, Zoom} from '../core/types';

/**
 * PANEL DE AELIKA (detalle de un pedido) abierto desde el botón "Ver pedido" de WhatsApp,
 * dentro del navegador de WhatsApp (app.aelika.com). Imita el diseño real del panel.
 * - orderPanelReview: solicitud 'Por confirmar': la encargada confirma la hora pedida o propone otra.
 * - orderPanelPayment: ve el comprobante que mandó el cliente y marca el pedido como pagado.
 * Al terminar, Aelika le avisa al cliente por WhatsApp (toast).
 */
export type PanelOrder = {
  orderNumber: string;
  customer: {name: string; phone: string};
  pickupLabel?: string;
  /** "Mié 25 nov" */
  date: string;
  /** "9:00 a. m." */
  time: string;
  items: {qty: number; name: string; price: number}[];
  statusTime?: string;
  perspective?: Perspective;
};

export type ReviewData = PanelOrder & {
  /** días y horarios para proponer otra hora */
  proposeDays: string[];
  pickProposeDay: number;
  proposeSlots: string[];
  pickProposeSlot: number;
  /** "11:00 a. m.": hora propuesta que se muestra al final */
  proposedTime: string;
  /** nota junto al pago, p. ej. "se cobra con tarjeta al confirmar" */
  payNote?: string;
  subtitles?: Partial<Record<'open' | 'kitchen' | 'propose' | 'sent', string>>;
};

export type PaymentData = PanelOrder & {
  receipt: string;
  receiptNote?: string;
  subtitles?: Partial<Record<'open' | 'paid', string>>;
};

const INK = '#111827';
const GRAY = '#6b7280';
const LINE = '#e5e7eb';
const TOP = 100; // fin del encabezado del navegador
const BOTTOM = 770; // inicio de la barra inferior del navegador
const money = (n: number) => '$' + n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const total = (d: PanelOrder) => d.items.reduce((a, i) => a + i.qty * i.price, 0);

// ------------------------------------------------------------------ piezas
const Pill: React.FC<{tone: 'amber' | 'green' | 'blue' | 'gray'; children: React.ReactNode; size?: number}> = ({tone, children, size = 14}) => {
  const c = {amber: ['#fff4e0', '#a15c07'], green: ['#e6f6ec', '#1f8a4c'], blue: ['#e8f0fe', '#1d5fd1'], gray: ['#f1f2f4', '#4b5563']}[tone];
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, background: c[0], color: c[1], fontSize: size, fontWeight: 500, whiteSpace: 'nowrap'}}>
      <span style={{width: 7, height: 7, borderRadius: '50%', background: c[1]}} />
      {children}
    </span>
  );
};

const Check: React.FC<{color?: string; size?: number}> = ({color = INK, size = 15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5 9.5 18 20 6.5" />
  </svg>
);

const Card: React.FC<{top: number; height?: number; children: React.ReactNode}> = ({top, height, children}) => (
  <div style={{position: 'absolute', top, left: 16, right: 16, height, border: `1px solid ${LINE}`, borderRadius: 14, background: '#fff', padding: '12px 16px', boxSizing: 'border-box'}}>{children}</div>
);

const Row: React.FC<{k: string; v: React.ReactNode}> = ({k, v}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 28, fontSize: 14.5}}>
    <span style={{color: GRAY}}>{k}</span>
    <span style={{color: INK, fontWeight: 500}}>{v}</span>
  </div>
);

const Toast: React.FC<{f: number; a: number; text: string}> = ({f, a, text}) => {
  const p = prog(f, a, a + 10);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 16, right: 16, top: BOTTOM - 78, height: 54, borderRadius: 14, background: INK, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', fontSize: 14.5, fontWeight: 500, opacity: p, transform: `translateY(${(1 - p) * 16}px)`, zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,.2)'}}>
      <div style={{width: 24, height: 24, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        <Check color="#fff" size={14} />
      </div>
      {text}
    </div>
  );
};

/** Navegador dentro de WhatsApp: "OK", título y dominio arriba; flechas abajo. */
const Browser: React.FC<{f: number; statusTime: string; children: React.ReactNode}> = ({f, statusTime, children}) => {
  const load = prog(f, 4, 16);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff', color: INK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: TOP, left: 0, right: 0, bottom: 844 - BOTTOM, overflow: 'hidden', opacity: load}}>{children}</div>
      {/* barra de carga */}
      <div style={{position: 'absolute', top: TOP - 2, left: 0, height: 2, width: `${Math.min(1, prog(f, 0, 14)) * 100}%`, background: '#007aff', opacity: 1 - prog(f, 14, 20), zIndex: 31}} />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: TOP, background: '#f6f6f7', borderBottom: '1px solid #dcdcdf', zIndex: 30}}>
        <StatusBar time={statusTime} />
        <div style={{position: 'absolute', top: 52, left: 16, right: 16, height: 44, display: 'flex', alignItems: 'center'}}>
          <div style={{width: 60, fontSize: 17, color: '#007aff'}}>OK</div>
          <div style={{flex: 1, textAlign: 'center', lineHeight: 1.2}}>
            <div style={{fontSize: 15, fontWeight: 600}}>WhatsApp</div>
            <div style={{fontSize: 12.5, color: '#8a8a8e'}}>ⓘ app.aelika.com</div>
          </div>
          <div style={{width: 60, display: 'flex', justifyContent: 'flex-end'}}>
            <div style={{width: 28, height: 28, borderRadius: '50%', border: '1.8px solid #007aff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5}}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{width: 3.5, height: 3.5, borderRadius: '50%', background: '#007aff'}} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: BOTTOM, left: 0, right: 0, bottom: 0, background: '#f6f6f7', borderTop: '1px solid #dcdcdf', zIndex: 30}}>
        <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 44, color: '#007aff', fontSize: 22}}>
          <svg width="12" height="20" viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke="#007aff" strokeWidth="2.4" strokeLinecap="round" /></svg>
          <svg width="12" height="20" viewBox="0 0 12 20"><path d="M2 2l8 8-8 8" fill="none" stroke="#c4c4c8" strokeWidth="2.4" strokeLinecap="round" /></svg>
          <svg width="20" height="24" viewBox="0 0 20 24"><path d="M10 15V2M5 7l5-5 5 5M4 11H2v11h16V11h-2" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" fill="none" stroke="#007aff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
};

/** Encabezado de la página: "Pedido #128", estado y la X. */
const PageHead: React.FC<{d: PanelOrder; status: React.ReactNode}> = ({d, status}) => (
  <>
    <div style={{position: 'absolute', top: 16, left: 20, fontSize: 27, fontWeight: 700, letterSpacing: -0.5}}>Pedido {d.orderNumber}</div>
    <div style={{position: 'absolute', top: 22, right: 22, fontSize: 24, color: GRAY, lineHeight: 1}}>×</div>
    <div style={{position: 'absolute', top: 60, left: 20}}>{status}</div>
    <div style={{position: 'absolute', top: 104, left: 0, right: 0, height: 1, background: LINE}} />
  </>
);

const Products: React.FC<{d: PanelOrder; top: number}> = ({d, top}) => (
  <>
    <div style={{position: 'absolute', top, left: 20, fontSize: 16.5, fontWeight: 700}}>Productos</div>
    <Card top={top + 30}>
      {d.items.map((it) => (
        <div key={it.name} style={{display: 'flex', justifyContent: 'space-between', height: 28, alignItems: 'center', fontSize: 14.5}}>
          <span>
            <b style={{fontWeight: 600}}>{it.qty}×</b> {it.name}
          </span>
          <span style={{color: GRAY}}>{money(it.qty * it.price)}</span>
        </div>
      ))}
      <div style={{height: 1, background: LINE, margin: '8px 0'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontSize: 15.5, fontWeight: 600}}>Total</span>
        <span style={{fontSize: 24, fontWeight: 700, letterSpacing: -0.5}}>{money(total(d))}</span>
      </div>
    </Card>
  </>
);

// ------------------------------------------------------------------ revisión (confirmar hora o proponer otra)
export const REVIEW_T = {
  detailsZoom: [12, 84],
  kitchen: 96,
  tapPropose: 150,
  sheet: [156, 170],
  tapDay: 194,
  tapSlot: 222,
  tapSend: 258,
  sheetOut: [264, 278],
  toast: 274,
  end: 370,
} as const;
const R = REVIEW_T;
const SHEET_TOP = 330;
const dayX = (i: number) => 16 + i * 90 + 41;
const SLOT_W = (SW - 32 - 24) / 4;
const slotX = (i: number) => 16 + i * (SLOT_W + 8) + SLOT_W / 2;
const SY = {day: SHEET_TOP + 104, slot: SHEET_TOP + 168, send: SHEET_TOP + 270};

const Chip: React.FC<{on: boolean; w?: number; h?: number; children: React.ReactNode}> = ({on, w, h = 36, children}) => (
  <div style={{width: w, height: h, borderRadius: 10, border: `1.5px solid ${on ? INK : LINE}`, background: on ? INK : '#fff', color: on ? '#fff' : INK, fontSize: 14, fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', flexShrink: 0}}>{children}</div>
);

const ReviewScreen: React.FC<{d: ReviewData}> = ({d}) => {
  const f = useCurrentFrame();
  const sheet = prog(f, R.sheet[0], R.sheet[1]) - prog(f, R.sheetOut[0], R.sheetOut[1]);
  const sent = f >= R.sheetOut[0] + 6;
  const press = (at: number) => f >= at && f < at + 8;
  return (
    <Browser f={f} statusTime={d.statusTime ?? '14:36'}>
      <PageHead d={d} status={sent ? <Pill tone="blue">Hora propuesta · esperando al cliente</Pill> : <Pill tone="amber">Por confirmar</Pill>} />
      <Card top={122}>
        <Row k="Entrega" v={d.pickupLabel ?? 'Recoger en tienda'} />
        <Row
          k="Hora"
          v={
            sent ? (
              <span>
                <s style={{color: GRAY, fontWeight: 400}}>{nb(d.time)}</s> → {nb(d.proposedTime)}
              </span>
            ) : (
              `${d.date} · ${nb(d.time)}`
            )
          }
        />
        <Row k="Cliente" v={d.customer.name} />
        <Row k="Teléfono" v={d.customer.phone} />
      </Card>
      <Products d={d} top={276} />
      <div style={{position: 'absolute', top: 474, left: 20, right: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: GRAY}}>
        Pago: <Pill tone="gray">Sin cobro</Pill>
        <span style={{fontSize: 12.5}}>{d.payNote ?? 'se cobra al confirmar'}</span>
      </div>
      {/* acciones */}
      <div style={{position: 'absolute', top: 520, left: 16, right: 16, display: 'flex', gap: 10, opacity: 1 - prog(f, R.sheetOut[0], R.sheetOut[0] + 6)}}>
        <div style={{flex: 1, height: 50, borderRadius: 12, border: `1.5px solid ${LINE}`, background: press(R.tapPropose) ? '#f3f4f6' : '#fff', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 15, fontWeight: 600}}>🕒 Proponer otra hora</div>
        <div style={{flex: 1, height: 50, borderRadius: 12, background: INK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 15, fontWeight: 600}}>
          <Check color="#fff" /> Confirmar hora
        </div>
      </div>
      {/* hoja: proponer otra hora */}
      {sheet > 0 && (
        <>
          <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.35 * sheet})`, zIndex: 10}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: SHEET_TOP - TOP + (1 - sheet) * 460, height: 460, background: '#fff', borderRadius: '20px 20px 0 0', zIndex: 11}}>
            <div style={{position: 'absolute', top: 8, left: '50%', marginLeft: -20, width: 40, height: 5, borderRadius: 3, background: '#d4d6db'}} />
            <div style={{position: 'absolute', top: 24, left: 20, fontSize: 19, fontWeight: 700}}>Proponer otra hora</div>
            <div style={{position: 'absolute', top: 56, left: 20, fontSize: 13.5, color: GRAY}}>
              Pidió: {d.date} · {nb(d.time)}
            </div>
            <div style={{position: 'absolute', top: 82, left: 16, display: 'flex', gap: 8}}>
              {d.proposeDays.map((x, i) => (
                <Chip key={x} w={82} h={44} on={f >= R.tapDay && i === d.pickProposeDay}>
                  {x}
                </Chip>
              ))}
            </div>
            <div style={{position: 'absolute', top: 148, left: 16, display: 'flex', gap: 8}}>
              {d.proposeSlots.map((x, i) => (
                <Chip key={x} w={SLOT_W} h={40} on={f >= R.tapSlot && i === d.pickProposeSlot}>
                  {x}
                </Chip>
              ))}
            </div>
            <div style={{position: 'absolute', top: 204, left: 20, right: 20, fontSize: 13, color: GRAY}}>Aelika le manda al cliente un link para aceptar o rechazar. Si acepta, pasa directo al pago.</div>
            <div style={{position: 'absolute', top: 245, left: 16, right: 16, height: 50, borderRadius: 12, background: f >= R.tapSlot ? INK : '#b9bcc2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, transform: press(R.tapSend) ? 'scale(.97)' : 'none'}}>Enviar propuesta</div>
          </div>
        </>
      )}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-TOP}px)`}}>
        <Toast f={f} a={R.toast} text="Le enviamos la propuesta al cliente por WhatsApp." />
      </div>
    </Browser>
  );
};

export const orderPanelReview = (d: ReviewData): PhoneScene => {
  const sub = d.subtitles ?? {};
  const zooms: Zoom[] = [
    {a: R.detailsZoom[0], b: R.detailsZoom[1], x: 195, y: 330, s: 1.22},
    {a: R.sheet[1], b: R.tapSend - 4, x: 195, y: 490, s: 1.25},
  ];
  const taps: Tap[] = [
    {f: R.tapPropose, x: 102, y: TOP + 520 + 25},
    {f: R.tapDay, x: dayX(d.pickProposeDay), y: SY.day},
    {f: R.tapSlot, x: slotX(d.pickProposeSlot), y: SY.slot},
    {f: R.tapSend, x: 195, y: SY.send},
  ];
  return {
    id: 'panel-revision',
    duration: R.end,
    enter: 'up',
    Component: () => <ReviewScreen d={d} />,
    taps,
    zooms,
    perspective: d.perspective,
    marks: {open: 0, kitchen: R.kitchen, propose: R.tapPropose, send: R.tapSend, sent: R.sheetOut[1]},
    subtitles: [
      {at: 0, text: sub.open ?? 'Ve la solicitud en el panel de Aelika: Por confirmar.'},
      {at: R.kitchen, text: sub.kitchen ?? 'Consulta con cocina si alcanzan a esa hora…'},
      {at: R.tapPropose - 4, text: sub.propose ?? '…y como no, propone otra hora.'},
      {at: R.sheetOut[0], text: sub.sent ?? 'Aelika le manda la propuesta al cliente por WhatsApp.'},
    ],
  };
};

// ------------------------------------------------------------------ pago (comprobante → marcar pagado)
export const PAYMENT_T = {zoom: [14, 92], tapPaid: 112, toast: 122, end: 206} as const;
const P = PAYMENT_T;
const PAY_TOP = 374; // borde superior de la tarjeta de pago (pantalla)

const PaymentScreen: React.FC<{d: PaymentData}> = ({d}) => {
  const f = useCurrentFrame();
  const paid = f >= P.tapPaid + 4;
  return (
    <Browser f={f} statusTime={d.statusTime ?? '14:41'}>
      <PageHead d={d} status={<Pill tone="green">Confirmado</Pill>} />
      <Card top={122}>
        <Row k="Entrega" v={d.pickupLabel ?? 'Recoger en tienda'} />
        <Row k="Horario" v={`${d.date} · ${nb(d.time)}`} />
        <Row k="Cliente" v={d.customer.name} />
      </Card>
      <div style={{position: 'absolute', top: 244, left: 20, fontSize: 16.5, fontWeight: 700}}>Pago</div>
      <Card top={PAY_TOP - TOP}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44}}>
          <span style={{fontSize: 15.5, fontWeight: 600}}>Total</span>
          <span style={{fontSize: 27, fontWeight: 700, letterSpacing: -0.5}}>{money(total(d))}</span>
        </div>
        <div style={{height: 1, background: LINE, margin: '10px 0'}} />
        <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
          <Img src={staticFile(d.receipt)} style={{width: 92, height: 130, objectFit: 'cover', objectPosition: 'top', borderRadius: 8, border: `1px solid ${LINE}`}} />
          <div style={{flex: 1}}>
            <div style={{fontSize: 15, fontWeight: 600}}>Comprobante</div>
            <div style={{fontSize: 13, color: GRAY, marginTop: 4, lineHeight: 1.4}}>{d.receiptNote ?? 'Lo mandó el cliente por WhatsApp.'}</div>
            <div style={{fontSize: 13.5, color: '#1d5fd1', marginTop: 8, fontWeight: 500}}>Ver completo ↗</div>
          </div>
        </div>
        <div style={{height: 1, background: LINE, margin: '12px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 50}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, color: GRAY}}>
            Pago: {paid ? <Pill tone="green">Pagado</Pill> : <Pill tone="gray">Pendiente</Pill>}
          </span>
          <div style={{height: 46, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15.5, fontWeight: 600, color: paid ? '#9ca3af' : INK, background: f >= P.tapPaid && f < P.tapPaid + 8 ? '#f3f4f6' : '#fff'}}>
            <Check color={paid ? '#9ca3af' : INK} /> {paid ? 'Pagado' : 'Marcar pagado'}
          </div>
        </div>
      </Card>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-TOP}px)`}}>
        <Toast f={f} a={P.toast} text="Le avisamos al cliente por WhatsApp." />
      </div>
    </Browser>
  );
};

export const orderPanelPayment = (d: PaymentData): PhoneScene => {
  const sub = d.subtitles ?? {};
  // centro del botón "Marcar pagado": tarjeta + padding + total + divisor + comprobante + divisor + media fila
  const btnY = PAY_TOP + 12 + 44 + 21 + 130 + 25 + 25;
  return {
    id: 'panel-pago',
    duration: P.end,
    enter: 'up',
    Component: () => <PaymentScreen d={d} />,
    taps: [{f: P.tapPaid, x: 290, y: btnY}],
    zooms: [{a: P.zoom[0], b: P.zoom[1], x: 195, y: 520, s: 1.3}],
    perspective: d.perspective,
    marks: {open: 0, paid: P.tapPaid},
    subtitles: [
      {at: 0, text: sub.open ?? 'En el panel ve el comprobante que mandó el cliente…'},
      {at: P.tapPaid - 6, text: sub.paid ?? '…y marca el pedido como pagado.'},
    ],
  };
};

// ------------------------------------------------------------------ ver un pedido pagado (solo recibir)
export type ViewData = PanelOrder & {
  /** "10:55 a. m. · en 30 min" */
  pickupAt: string;
  payment: string;
  subtitles?: Partial<Record<'open' | 'detail', string>>;
};
export const VIEW_T = {zoom: [14, 110], detail: 60, end: 160} as const;

const ViewScreen: React.FC<{d: ViewData}> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <Browser f={f} statusTime={d.statusTime ?? '10:24'}>
      <PageHead d={d} status={<Pill tone="green">Nuevo · pagado</Pill>} />
      <Card top={122}>
        <Row k="Entrega" v={d.pickupLabel ?? 'Para recoger'} />
        <Row k="Pasa a las" v={nb(d.pickupAt)} />
        <Row k="Cliente" v={d.customer.name} />
        <Row k="Teléfono" v={d.customer.phone} />
      </Card>
      <Products d={d} top={276} />
      <div style={{position: 'absolute', top: 474, left: 20, right: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: GRAY}}>
        Pago: <Pill tone="green">Pagado · {d.payment}</Pill>
      </div>
      <div style={{position: 'absolute', top: 516, left: 16, right: 16, borderRadius: 12, background: '#f3f4f6', padding: '10px 14px', fontSize: 13.5, color: '#374151', lineHeight: 1.4}}>
        🔔 También llegó a la tablet de la barra.
      </div>
    </Browser>
  );
};

export const orderPanelView = (d: ViewData): PhoneScene => {
  const sub = d.subtitles ?? {};
  return {
    id: 'panel-pedido',
    duration: VIEW_T.end,
    enter: 'up',
    Component: () => <ViewScreen d={d} />,
    zooms: [{a: VIEW_T.zoom[0], b: VIEW_T.zoom[1], x: 195, y: 340, s: 1.25}],
    perspective: d.perspective,
    marks: {open: 0, detail: VIEW_T.detail},
    subtitles: [
      {at: 0, text: sub.open ?? 'Lo abre en el panel de Aelika…'},
      {at: VIEW_T.detail, text: sub.detail ?? '…ya pagado y con la hora en que pasan por él.'},
    ],
  };
};
