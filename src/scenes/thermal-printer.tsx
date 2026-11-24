import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useBrand} from '../core/brand';
import {FONT, prog, rgba} from '../core/theme';
import {Perspective, PhoneScene} from '../core/types';

/**
 * El pedido sale impreso como COMANDA en una impresora térmica (cocina o barra).
 * Se dibuja sobre el lienzo, como `tabletOrders`: tapa el teléfono.
 */
export type PrinterData = {
  store: string;
  orderNumber: string;
  customer: string;
  /** p. ej. "Mié 25 · 10:00 a. m." */
  pickupAt: string;
  items: {qty: number; name: string}[];
  total: string;
  payment: string;
  perspective?: Perspective;
  subtitles?: {open?: string; print?: string};
};

const DUR = 165;
const PRINT = [26, 120]; // frames en que sale el papel
const MONO = '"JetBrains Mono", "DejaVu Sans Mono", monospace';
const PAPER_W = 560;
const PAPER_H = 760;

const Printer: React.FC<{d: PrinterData}> = ({d}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const inn = prog(f, 0, 14);
  const out = prog(f, DUR - 6, DUR + 10);
  const p = Math.min(inn, 1 - out);
  const fed = prog(f, PRINT[0], PRINT[1]);
  const printing = f >= PRINT[0] && f < PRINT[1];
  const shake = printing ? Math.sin(f * 2.3) * 1.2 : 0;
  const line = '-'.repeat(26);
  const rows: [string, 'c' | 'l' | 'b'][] = [
    [d.store.toUpperCase(), 'c'],
    [`COMANDA ${d.orderNumber}`, 'c'],
    [line, 'l'],
    [`PARA RECOGER`, 'b'],
    [d.pickupAt, 'b'],
    [d.customer, 'l'],
    [line, 'l'],
    ...d.items.map((it): [string, 'l'] => [`${it.qty}  ${it.name}`, 'l']),
    [line, 'l'],
    [`TOTAL ${d.total}`, 'b'],
    [`PAGADO · ${d.payment}`, 'l'],
  ];
  const BODY_TOP = 1180; // borde superior de la impresora
  return (
    <AbsoluteFill style={{opacity: p}}>
      <AbsoluteFill style={{background: `linear-gradient(165deg, ${colors.paper} 0%, ${colors.light} 45%, ${colors.accentLight} 120%)`}}>
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 70%, ${rgba(colors.accent, 0.22)}, transparent 55%)`}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - inn) * 80}px)`}}>
        {/* papel: crece hacia arriba desde la ranura */}
        <div style={{position: 'absolute', left: (1080 - PAPER_W) / 2, width: PAPER_W, top: BODY_TOP + 20 - PAPER_H * fed, height: PAPER_H * fed, overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: PAPER_H,
              background: '#fffefa',
              boxShadow: '0 10px 30px rgba(0,0,0,.15)',
              padding: '34px 30px',
              boxSizing: 'border-box',
              fontFamily: MONO,
              fontSize: 29,
              lineHeight: '42px',
              color: '#1c1c1c',
              whiteSpace: 'pre',
              clipPath:
                'polygon(0 1.5%, 4% 0, 8% 1.5%, 12% 0, 16% 1.5%, 20% 0, 24% 1.5%, 28% 0, 32% 1.5%, 36% 0, 40% 1.5%, 44% 0, 48% 1.5%, 52% 0, 56% 1.5%, 60% 0, 64% 1.5%, 68% 0, 72% 1.5%, 76% 0, 80% 1.5%, 84% 0, 88% 1.5%, 92% 0, 96% 1.5%, 100% 0, 100% 100%, 0 100%)',
            }}
          >
            {rows.map(([t, k], i) => (
              <div key={i} style={{textAlign: k === 'c' ? 'center' : 'left', fontWeight: k === 'l' ? 400 : 800, fontSize: i < 2 ? 32 : 29}}>
                {t}
              </div>
            ))}
          </div>
        </div>
        {/* cuerpo de la impresora */}
        <div style={{position: 'absolute', left: 190, width: 700, top: BODY_TOP, height: 360, transform: `translateX(${shake}px)`}}>
          <div style={{position: 'absolute', left: 30, right: 30, top: 0, height: 90, borderRadius: '44px 44px 12px 12px', background: 'linear-gradient(#3c3c3f,#29292b)'}} />
          <div style={{position: 'absolute', left: 80, right: 80, top: 14, height: 14, borderRadius: 7, background: '#0d0d0e'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 76, bottom: 0, borderRadius: 40, background: 'linear-gradient(#2d2d30,#1a1a1c)', boxShadow: '0 40px 80px rgba(0,0,0,.3)'}}>
            <div style={{position: 'absolute', left: 50, top: 60, width: 22, height: 22, borderRadius: '50%', background: printing && Math.floor(f / 6) % 2 === 0 ? '#25d366' : '#3a3a3d'}} />
            <div style={{position: 'absolute', left: 90, top: 58, fontFamily: FONT, fontSize: 22, color: '#8e8e93', fontWeight: 600}}>{printing ? 'Imprimiendo…' : f >= PRINT[1] ? 'Listo' : ''}</div>
            <div style={{position: 'absolute', right: 50, top: 56, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#6e6e73', letterSpacing: 4}}>THERMAL</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Impresora térmica imprimiendo la comanda del pedido. ~5.5 s. */
export const thermalPrinter = (d: PrinterData): PhoneScene => ({
  id: 'impresora',
  duration: DUR,
  enter: 'fade',
  Component: () => null,
  Overlay: () => <Printer d={d} />,
  perspective: d.perspective,
  marks: {open: 0, print: PRINT[0]},
  subtitles: [
    {at: 0, text: d.subtitles?.open ?? 'Y si lo prefieres…'},
    {at: PRINT[0], text: d.subtitles?.print ?? '…sale impreso como comanda.'},
  ],
});
