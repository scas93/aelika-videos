import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {AelikaIcon} from '../aelika/Aelika';
import {useBrand} from '../core/brand';
import {BrandAvatar} from '../core/Phone';
import {FONT, prog, rgba} from '../core/theme';
import {Perspective, PhoneScene} from '../core/types';

/**
 * iPAD DEL LOCAL con la vista de pedidos de Aelika (estilo tablet de apps de delivery): columna de pedidos
 * a la izquierda y detalle a la derecha. Entra un pedido nuevo con aviso y se abre su detalle.
 * Es una capa sobre el lienzo que tapa el teléfono mientras dura la escena (el iPad va en horizontal).
 */
export type TabletOrder = {number: string; customer: string; items: number; time: string; status: 'prep' | 'ready'};

export type TabletData = {
  storeName: string;
  /** pedidos que ya estaban en la lista */
  queue: TabletOrder[];
  /** el pedido que llega */
  order: {
    number: string;
    customer: string;
    time: string;
    ready: string;
    /** default "Para recoger · lo antes posible" */
    delivery?: string;
    /** default "Listo en" */
    readyLabel?: string;
    lines: {qty: number; name: string; price: number; photo?: string}[];
    payment: string;
    note?: string;
  };
  clock?: string;
  perspective?: Perspective;
  subtitles?: Partial<Record<'open' | 'arrive' | 'detail', string>>;
};

export const TABLET_T = {arrive: 40, card: 52, detail: 70, end: 230} as const;
const T = TABLET_T;

const IW = 1000; // iPad en el lienzo (horizontal)
const IH = 720;
const IX = (1080 - IW) / 2;
const IY = 520;
const B = 22; // bisel
/** la interfaz se dibuja a 740 px de ancho y se escala para que el texto se lea en el celular */
const LW = 740;
const SC = (IW - 2 * B) / LW;
const LH = (IH - 2 * B) / SC;
const money = (n: number) => '$' + n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const INK = '#111827';
const GRAY = '#6b7280';
const LINE = '#e5e7eb';

const Pill: React.FC<{bg: string; fg: string; children: React.ReactNode}> = ({bg, fg, children}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: bg, color: fg, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap'}}>
    <span style={{width: 6, height: 6, borderRadius: '50%', background: fg}} />
    {children}
  </span>
);

const OrderCard: React.FC<{o: TabletOrder; fresh?: number; selected?: boolean}> = ({o, fresh = 0, selected}) => (
  <div
    style={{
      borderRadius: 12,
      border: `${selected ? 2 : 1}px solid ${selected ? '#16a34a' : LINE}`,
      background: fresh > 0 ? `rgba(22,163,74,${0.1 * fresh})` : '#fff',
      padding: '10px 12px',
      boxSizing: 'border-box',
      boxShadow: selected ? '0 4px 14px rgba(22,163,74,.2)' : 'none',
    }}
  >
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <span style={{fontSize: 15.5, fontWeight: 700}}>{o.number}</span>
      {o.status === 'ready' ? <Pill bg="#e6f6ec" fg="#1f8a4c">Listo</Pill> : fresh > 0 || selected ? <Pill bg="#dcfce7" fg="#15803d">Nuevo</Pill> : <Pill bg="#fff4e0" fg="#a15c07">En preparación</Pill>}
    </div>
    <div style={{fontSize: 13, color: GRAY, marginTop: 4}}>
      {o.customer} · {o.items} artículo{o.items === 1 ? '' : 's'} · {o.time}
    </div>
  </div>
);

const Screen: React.FC<{d: TabletData; f: number}> = ({d, f}) => {
  const {colors} = useBrand();
  const arrive = prog(f, T.card, T.card + 12);
  const banner = Math.min(prog(f, T.arrive, T.arrive + 8), 1 - prog(f, T.detail + 20, T.detail + 30));
  const detail = prog(f, T.detail, T.detail + 12);
  const pulse = f >= T.card ? 0.5 + 0.5 * Math.cos((f - T.card) / 5) : 0;
  const o = d.order;
  const sum = o.lines.reduce((a, l) => a + l.qty * l.price, 0);
  const newCard: TabletOrder = {number: o.number, customer: o.customer, items: o.lines.reduce((a, l) => a + l.qty, 0), time: o.time, status: 'prep'};
  const prep = d.queue.filter((q) => q.status === 'prep').length;
  const ready = d.queue.filter((q) => q.status === 'ready').length;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f6f7f9', color: INK, fontFamily: FONT, overflow: 'hidden'}}>
      {/* barra superior */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 58, background: INK, color: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px'}}>
        <BrandAvatar size={34} />
        <div style={{fontSize: 17, fontWeight: 700}}>{d.storeName}</div>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(34,197,94,.18)', color: '#4ade80', fontSize: 12.5, fontWeight: 600}}>
          <span style={{width: 7, height: 7, borderRadius: '50%', background: '#4ade80'}} /> Abierto
        </span>
        <div style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1'}}>
          <div style={{width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AelikaIcon size={15} />
          </div>
          Pedidos · {d.clock ?? '10:24'}
        </div>
      </div>
      {/* columna de pedidos */}
      <div style={{position: 'absolute', top: 58, bottom: 0, left: 0, width: 250, background: '#fff', borderRight: `1px solid ${LINE}`}}>
        <div style={{display: 'flex', gap: 5, padding: '12px 10px 10px'}}>
          {[
            [`Nuevos ${f >= T.card ? 1 : 0}`, true],
            [`Preparando ${prep}`, false],
            [`Listos ${ready}`, false],
          ].map(([t, on], i) => (
            <div key={i} style={{padding: '5px 8px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: on ? INK : '#f1f2f4', color: on ? '#fff' : '#4b5563', whiteSpace: 'nowrap'}}>
              {t as string}
            </div>
          ))}
        </div>
        <div style={{position: 'relative', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 8}}>
          <div style={{height: 70 * arrive, overflow: 'visible', opacity: arrive, transform: `translateX(${(1 - arrive) * -40}px)`}}>
            {f >= T.card && <OrderCard o={newCard} fresh={pulse} selected={f >= T.detail} />}
          </div>
          {d.queue.map((q) => (
            <OrderCard key={q.number} o={q} />
          ))}
        </div>
      </div>
      {/* detalle */}
      <div style={{position: 'absolute', top: 58, bottom: 0, left: 250, right: 0, padding: '14px 18px'}}>
        {detail <= 0 ? (
          <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 15, gap: 10}}>
            <div style={{fontSize: 34}}>☕</div>
            Esperando pedidos…
          </div>
        ) : (
          <div style={{opacity: detail, transform: `translateY(${(1 - detail) * 12}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{fontSize: 26, fontWeight: 800, letterSpacing: -0.5}}>Pedido {o.number}</div>
              <Pill bg="#dcfce7" fg="#15803d">Nuevo</Pill>
              <div style={{flex: 1}} />
              <div style={{fontSize: 13, color: GRAY}}>Llegó por WhatsApp · {o.time}</div>
            </div>
            <div style={{display: 'flex', gap: 10, marginTop: 12}}>
              {[
                ['Cliente', o.customer],
                ['Entrega', o.delivery ?? 'Para recoger · lo antes posible'],
                [o.readyLabel ?? 'Listo en', o.ready],
              ].map(([k, v]) => (
                <div key={k} style={{flex: k === 'Entrega' ? 1.6 : 1, border: `1px solid ${LINE}`, borderRadius: 12, background: '#fff', padding: '8px 12px'}}>
                  <div style={{fontSize: 11.5, color: GRAY}}>{k}</div>
                  <div style={{fontSize: 15, fontWeight: 600, marginTop: 2}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop: 12, border: `1px solid ${LINE}`, borderRadius: 12, background: '#fff', padding: '8px 14px'}}>
              {o.lines.map((l) => (
                <div key={l.name} style={{display: 'flex', alignItems: 'center', gap: 12, height: 42, borderBottom: `1px solid #f1f2f4`}}>
                  {l.photo && <Img src={staticFile(l.photo)} style={{width: 32, height: 32, borderRadius: 7, objectFit: 'cover'}} />}
                  <div style={{width: 34, height: 28, borderRadius: 8, background: '#f1f2f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15}}>{l.qty}</div>
                  <div style={{flex: 1, fontSize: 15.5, fontWeight: 500}}>{l.name}</div>
                  <div style={{fontSize: 14.5, color: GRAY}}>{money(l.qty * l.price)}</div>
                </div>
              ))}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10}}>
                <Pill bg="#e6f6ec" fg="#1f8a4c">
                  Pagado · {o.payment}
                </Pill>
                <div style={{fontSize: 22, fontWeight: 800}}>{money(sum)}</div>
              </div>
            </div>
            {o.note && <div style={{marginTop: 10, fontSize: 13.5, color: '#92400e', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '8px 12px'}}>📝 {o.note}</div>}
          </div>
        )}
      </div>
      {/* aviso de pedido nuevo */}
      {banner > 0 && (
        <div style={{position: 'absolute', top: 72, left: '50%', transform: `translate(-50%, ${(1 - banner) * -30}px) scale(${1 + 0.04 * Math.sin(f / 3) * banner})`, opacity: banner, background: '#16a34a', color: '#fff', borderRadius: 14, padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 700, boxShadow: '0 12px 30px rgba(22,163,74,.4)', zIndex: 5, whiteSpace: 'nowrap'}}>
          🔔 Nuevo pedido {o.number} · {money(sum)} · pagado
        </div>
      )}
    </div>
  );
};

const Tablet: React.FC<{d: TabletData; duration: number}> = ({d, duration}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const inn = prog(f, 0, 14);
  const out = prog(f, duration - 6, duration + 10);
  const p = Math.min(inn, 1 - out);
  return (
    <AbsoluteFill style={{opacity: p}}>
      <AbsoluteFill style={{background: `linear-gradient(165deg, ${colors.paper} 0%, ${colors.light} 45%, ${colors.accentLight} 120%)`}}>
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 70%, ${rgba(colors.accent, 0.22)}, transparent 55%)`}} />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: IX,
          top: IY,
          width: IW,
          height: IH,
          borderRadius: 46,
          background: '#1b1b1d',
          boxShadow: '0 40px 90px rgba(0,0,0,.35), inset 0 0 0 3px #3a3a3e',
          transform: `translateY(${(1 - inn) * 80}px) scale(${0.94 + 0.06 * inn})`,
        }}
      >
        <div style={{position: 'absolute', left: B, top: B, right: B, bottom: B, borderRadius: 26, overflow: 'hidden', background: '#fff'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: LW, height: LH, transform: `scale(${SC})`, transformOrigin: '0 0'}}>
            <Screen d={d} f={f} />
          </div>
        </div>
        <div style={{position: 'absolute', top: IH / 2 - 5, left: 8, width: 8, height: 8, borderRadius: '50%', background: '#2c2c30'}} />
      </div>
    </AbsoluteFill>
  );
};

export const tabletOrders = (d: TabletData): PhoneScene => {
  const sub = d.subtitles ?? {};
  return {
    id: 'ipad-pedidos',
    duration: T.end,
    enter: 'fade',
    Component: () => null,
    Overlay: () => <Tablet d={d} duration={T.end} />,
    perspective: d.perspective,
    marks: {open: 0, arrive: T.arrive, detail: T.detail},
    subtitles: [
      {at: 0, text: sub.open ?? 'O en un iPad en la barra, con todos tus pedidos.'},
      {at: T.arrive, text: sub.arrive ?? 'Cada pedido nuevo llega con aviso…'},
      {at: T.detail, text: sub.detail ?? '…ya pagado y listo para preparar.'},
    ],
  };
};
