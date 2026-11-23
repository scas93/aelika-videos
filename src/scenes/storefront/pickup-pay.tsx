import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBrand} from '../../core/brand';
import {BrandAvatar, HomeIndicator, StatusBar} from '../../core/Phone';
import {nb, prog, typed} from '../../core/theme';
import {PhoneScene, Tap, Zoom} from '../../core/types';
import {WaBanner} from './classes';
import {BlackBtn, Header, Input, money} from './pickup';

/**
 * Link que el bot le manda al cliente después de que el negocio revisa su solicitud (pedido para recoger).
 * - Si el negocio propuso otra hora: pantalla de propuesta (Aceptar y pagar / Rechazar) → pago.
 * - Si confirmó la hora pedida (`proposal` sin definir): directo al pago.
 * Pago con tarjeta en la misma página → pedido confirmado (y aviso de WhatsApp).
 */
export type PickupPayData = {
  url: string;
  title: string;
  orderNumber: string;
  items: {qty: number; name: string; price: number}[];
  address: string;
  /** hora acordada, p. ej. "Mié 25 nov · 11:00 a. m." */
  agreed: string;
  /** hora que pidió el cliente (solo si el negocio propuso otra) */
  proposal?: {requested: string};
  card: {number: string; exp: string; cvc: string};
  doneNote: string;
  banner: string;
  statusTime?: string;
  subtitles?: Partial<Record<'proposal' | 'pay' | 'done', string>>;
};

export const PICKUP_PAY_T = {
  zoomProposal: [10, 76],
  tapAccept: 96,
  pay: 104,
  tapNumber: 150,
  typeNumber: [156, 190],
  typeExp: [198, 210],
  typeCvc: [216, 224],
  tapPay: 250,
  processing: [254, 280],
  done: 282,
  end: 380,
} as const;

const SUMMARY_TOP = 112;

const OrderLines: React.FC<{d: PickupPayData; top: number}> = ({d, top}) => {
  const {colors} = useBrand();
  const sum = d.items.reduce((a, i) => a + i.qty * i.price, 0);
  return (
    <div style={{position: 'absolute', top, left: 16, right: 16, borderRadius: 14, background: '#fff', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6}}>
      {d.items.map((it) => (
        <div key={it.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: 14}}>
          <span>
            {it.qty}× {it.name}
          </span>
          <span>{money(it.qty * it.price)}</span>
        </div>
      ))}
      <div style={{height: 1, background: colors.line, margin: '2px 0'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 16.5, fontWeight: 700}}>
        <span>Total</span>
        <span>{money(sum)}</span>
      </div>
    </div>
  );
};

const Proposal: React.FC<{f: number; d: PickupPayData; T: Times}> = ({f, d, T}) => {
  const {colors} = useBrand();
  return (
    <>
      <div style={{position: 'absolute', top: 54, left: 0, right: 0, height: 62, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderBottom: `1px solid ${colors.line}`, background: '#fff'}}>
        <BrandAvatar size={36} />
        <div>
          <div style={{fontSize: 16.5, fontWeight: 700}}>{d.title}</div>
          <div style={{fontSize: 12.5, color: colors.muted}}>Solicitud {d.orderNumber}</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 134, left: 18, right: 18, fontSize: 23, fontWeight: 700, letterSpacing: -0.4}}>Te proponemos otra hora</div>
      <div style={{position: 'absolute', top: 178, left: 16, right: 16, borderRadius: 14, background: '#fff', padding: '14px 16px'}}>
        <div style={{fontSize: 13, color: colors.muted}}>Pediste</div>
        <div style={{fontSize: 16, color: '#9a9a9a', textDecoration: 'line-through', marginTop: 2}}>{nb(d.proposal!.requested)}</div>
        <div style={{height: 1, background: colors.line, margin: '12px 0'}} />
        <div style={{fontSize: 13, color: colors.muted}}>{d.title} te propone</div>
        <div style={{fontSize: 21, fontWeight: 700, marginTop: 2}}>{nb(d.agreed)}</div>
        <div style={{fontSize: 13.5, color: colors.muted, marginTop: 6}}>🏪 Recoger en {d.address}</div>
      </div>
      <OrderLines d={d} top={400} />
      <div style={{position: 'absolute', top: 546, left: 18, right: 18, fontSize: 13, color: '#8a8a8a'}}>Si aceptas, pasas directo al pago. Si rechazas, la solicitud se cancela.</div>
      <BlackBtn label="Aceptar y pagar" top={590} pressed={f >= T.tapAccept && f < T.tapAccept + 8} />
      <div style={{position: 'absolute', left: 16, right: 16, top: 652, height: 46, borderRadius: 14, border: `1px solid ${colors.line}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#c0262d'}}>Rechazar</div>
    </>
  );
};

const Pay: React.FC<{f: number; d: PickupPayData; T: Times}> = ({f, d, T}) => {
  const {colors} = useBrand();
  const num = typed(d.card.number, f, T.typeNumber[0], T.typeNumber[1]);
  const exp = typed(d.card.exp, f, T.typeExp[0], T.typeExp[1]);
  const cvc = typed(d.card.cvc, f, T.typeCvc[0], T.typeCvc[1]);
  const sum = d.items.reduce((a, i) => a + i.qty * i.price, 0);
  const busy = f >= T.processing[0] && f < T.processing[1];
  return (
    <>
      <Header title="Pagar pedido" back={!!d.proposal} />
      <OrderLines d={d} top={SUMMARY_TOP} />
      <div style={{position: 'absolute', top: 268, left: 16, right: 16, borderRadius: 14, background: '#fff', padding: '10px 16px', fontSize: 14.5, display: 'flex', flexDirection: 'column', gap: 4}}>
        <div>
          📅 <b>{nb(d.agreed)}</b> <span style={{color: '#1f8a4c', fontSize: 12.5, fontWeight: 600}}>· hora acordada</span>
        </div>
        <div style={{color: '#555'}}>🏪 Recoger en {d.address}</div>
      </div>
      <div style={{position: 'absolute', top: 350, left: 18, fontSize: 15, fontWeight: 700}}>💳 Tarjeta de crédito o débito</div>
      <Input label="Número de tarjeta" top={378} value={num} placeholder="1234 1234 1234 1234" focus={f >= T.tapNumber && f < T.typeExp[0] - 2} f={f} />
      <div style={{position: 'absolute', top: 464, left: 0, width: '50%', height: 80}}>
        <Input label="Vencimiento" top={0} value={exp} placeholder="MM/AA" focus={f >= T.typeExp[0] - 2 && f < T.typeCvc[0] - 2} f={f} />
      </div>
      <div style={{position: 'absolute', top: 464, left: '50%', right: 0, height: 80}}>
        <Input label="CVC" top={0} value={cvc} placeholder="123" focus={f >= T.typeCvc[0] - 2 && f < T.tapPay} f={f} />
      </div>
      <div style={{position: 'absolute', top: 552, left: 18, right: 18, fontSize: 12.5, color: '#8a8a8a'}}>🔒 Pago seguro. {d.title} no ve los datos de tu tarjeta.</div>
      <BlackBtn
        top={630}
        label={busy ? <span style={{width: 22, height: 22, borderRadius: '50%', border: '3px solid rgba(255,255,255,.35)', borderTopColor: '#fff', transform: `rotate(${f * 18}deg)`}} /> : `Pagar ${money(sum)}`}
        disabled={!cvc}
        pressed={f >= T.tapPay && f < T.tapPay + 8}
      />
      <div style={{position: 'absolute', top: 690, left: 0, right: 0, textAlign: 'center', fontSize: 12.5, color: colors.muted}}>Total a pagar · {money(sum)} MXN</div>
    </>
  );
};

const Done: React.FC<{f: number; d: PickupPayData; T: Times}> = ({f, d, T}) => {
  const s = T.done;
  const p = prog(f, s + 2, s + 16);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <WaBanner p={prog(f, s + 46, s + 58)} from={d.title}>
        {d.banner}
      </WaBanner>
      <div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{width: 104, height: 104, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * p})`, opacity: p}}>
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
        </div>
        <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, opacity: prog(f, s + 10, s + 20)}}>¡Pedido confirmado!</div>
        <div style={{marginTop: 8, padding: '5px 12px', borderRadius: 999, background: '#e6f6ec', color: '#1f8a4c', fontSize: 13, fontWeight: 700, opacity: prog(f, s + 14, s + 24)}}>
          Pedido {d.orderNumber} · Pagado
        </div>
        <div style={{marginTop: 18, padding: '0 34px', textAlign: 'center', fontSize: 15, lineHeight: 1.5, color: '#555', opacity: prog(f, s + 18, s + 28)}}>{nb(d.doneNote)}</div>
      </div>
    </div>
  );
};

type Times = {[K in keyof typeof PICKUP_PAY_T]: (typeof PICKUP_PAY_T)[K] extends readonly number[] ? readonly number[] : number};

/** sin propuesta, la página abre directo en el pago: todos los tiempos se recorren */
const timesFor = (d: PickupPayData): Times => {
  if (d.proposal) return PICKUP_PAY_T;
  const k = PICKUP_PAY_T.pay - 10;
  const sh = (v: number | readonly number[]) => (typeof v === 'number' ? Math.max(0, v - k) : v.map((x) => Math.max(0, x - k)));
  return Object.fromEntries(Object.entries(PICKUP_PAY_T).map(([n, v]) => [n, sh(v)])) as unknown as Times;
};

const Screen: React.FC<{d: PickupPayData}> = ({d}) => {
  const f = useCurrentFrame();
  const T = timesFor(d);
  const steps = [
    ...(d.proposal ? [{a: 0, b: T.pay as number, render: () => <Proposal f={f} d={d} T={T} />}] : []),
    {a: T.pay as number, b: T.done as number, render: () => <Pay f={f} d={d} T={T} />},
    {a: T.done as number, b: (T.end as number) + 20, render: () => <Done f={f} d={d} T={T} />},
  ];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f4f4f6', color: '#111', overflow: 'hidden'}}>
      {steps.map((s, i) => {
        if (f < s.a || f >= s.b + 12) return null;
        const enter = i === 0 ? 1 : prog(f, s.a, s.a + 12);
        const exit = i === steps.length - 1 ? 0 : prog(f, s.b, s.b + 12);
        return (
          <div key={i} style={{position: 'absolute', inset: 0, background: '#f4f4f6', transform: `translateX(${(1 - enter) * 390 - exit * 120}px)`, opacity: 1 - exit * 0.6}}>
            {s.render()}
          </div>
        );
      })}
      <StatusBar time={d.statusTime ?? '14:40'} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, background: '#f4f4f6', borderTop: '1px solid #e2e2e6', zIndex: 32}}>
        <div style={{margin: '8px auto 0', width: 358, height: 38, borderRadius: 12, background: '#fff', border: '1px solid #e2e2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, gap: 6, color: '#333'}}>
          <span style={{fontSize: 11}}>🔒</span> {d.url}
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
};

export const pickupPay = (d: PickupPayData): PhoneScene => {
  const T = timesFor(d);
  const sub = d.subtitles ?? {};
  const n = (v: unknown) => v as number;
  const r = (v: unknown) => v as readonly number[];
  const taps: Tap[] = [
    ...(d.proposal ? [{f: n(T.tapAccept), x: 195, y: 616}] : []),
    {f: n(T.tapNumber), x: 195, y: 378 + 24 + 25},
    {f: n(T.tapPay), x: 195, y: 656},
  ];
  const zooms: Zoom[] = [
    ...(d.proposal ? [{a: r(T.zoomProposal)[0], b: r(T.zoomProposal)[1], x: 195, y: 330, s: 1.25}] : []),
    {a: n(T.tapNumber) - 4, b: n(T.tapPay) - 4, x: 195, y: 470, s: 1.28},
  ];
  return {
    id: 'storefront-pago',
    duration: n(T.end),
    enter: 'up',
    Component: () => <Screen d={d} />,
    taps,
    zooms,
    marks: {proposal: 0, accept: n(T.tapAccept), pay: n(T.pay), card: n(T.tapNumber), paid: n(T.tapPay), done: n(T.done)},
    subtitles: [
      ...(d.proposal ? [{at: 0, text: sub.proposal ?? 'Ve la nueva hora y la acepta con un toque.'}] : []),
      {at: n(T.pay), text: sub.pay ?? 'Pasa directo al pago: resumen, hora acordada y tarjeta.'},
      {at: n(T.done), text: sub.done ?? 'Pagado: el pedido queda confirmado.'},
    ],
  };
};
