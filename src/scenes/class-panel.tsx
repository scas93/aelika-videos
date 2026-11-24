import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AelikaIcon} from '../aelika/Aelika';
import {useBrand} from '../core/brand';
import {HomeIndicator, StatusBar} from '../core/Phone';
import {SW, prog, rgba} from '../core/theme';
import {Perspective, PhoneScene} from '../core/types';

/**
 * PANEL DE AELIKA para estudios y gimnasios (lado del negocio). Sin WhatsApp: todo pasa en el panel.
 * - classFullPanel (teléfono): llega la notificación "la clase se llenó" → la abre → detalle de la clase llena.
 * - weekClassesTablet (tablet): módulo "Clases de la semana" en vista de calendario (coach y asistencia).
 * Diseño del panel real: tipografía gris oscuro, tarjetas con borde, píldoras de estado.
 */
const INK = '#111827';
const GRAY = '#6b7280';
const LINE = '#e5e7eb';
const RED = '#dc2626';

const Pill: React.FC<{tone: 'red' | 'green' | 'gray' | 'blue'; children: React.ReactNode; size?: number}> = ({tone, children, size = 12.5}) => {
  const c = {red: ['#fdecec', RED], green: ['#e6f6ec', '#1f8a4c'], gray: ['#f1f2f4', '#4b5563'], blue: ['#e8f0fe', '#1d5fd1']}[tone];
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: c[0], color: c[1], fontSize: size, fontWeight: 600, whiteSpace: 'nowrap'}}>
      <span style={{width: 6, height: 6, borderRadius: '50%', background: c[1]}} />
      {children}
    </span>
  );
};

const Bar: React.FC<{v: number; max: number; h?: number}> = ({v, max, h = 8}) => (
  <div style={{height: h, borderRadius: h / 2, background: '#eef0f3', overflow: 'hidden'}}>
    <div style={{width: `${(v / max) * 100}%`, height: '100%', borderRadius: h / 2, background: v >= max ? RED : '#111827'}} />
  </div>
);

// ================================================================== TELÉFONO
export type PanelClass = {
  name: string;
  /** "Vie 20 nov" */
  date: string;
  /** "7:15 – 8:30 a. m." */
  time: string;
  /** "1 h 15 min" */
  duration: string;
  coach: string;
  room?: string;
  capacity: number;
};
export type ClassFullData = {
  business: string;
  cls: PanelClass;
  attendees: {name: string; plan: string; isNew?: boolean}[];
  waitlist?: number;
  /** resto de clases de hoy en la pantalla de inicio: [hora, clase, coach, reservados, cupo] */
  today: [string, string, string, number, number][];
  statusTime?: string;
  perspective?: Perspective;
  subtitles?: {home?: string; notif?: string; detail?: string};
};

export const CLASS_FULL_T = {notif: 40, tap: 138, detail: 146, end: 290} as const;
const CT = CLASS_FULL_T;
const APP_TOP = 54;

const AppBar: React.FC<{d: ClassFullData; badge: boolean; back?: string}> = ({d, badge, back}) => (
  <div style={{position: 'absolute', top: APP_TOP, left: 0, right: 0, height: 56, background: '#fff', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px'}}>
    {back ? (
      <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: GRAY, fontWeight: 500}}>
        <svg width="9" height="15" viewBox="0 0 10 16">
          <path d="M8 2 2 8l6 6" fill="none" stroke={GRAY} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        {back}
      </div>
    ) : (
      <>
        <AelikaIcon size={26} />
        <div style={{fontSize: 16, fontWeight: 700, color: INK}}>{d.business}</div>
      </>
    )}
    <div style={{flex: 1}} />
    <div style={{position: 'relative'}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0" />
      </svg>
      {badge && <div style={{position: 'absolute', top: -5, right: -6, minWidth: 16, height: 16, borderRadius: 8, background: RED, color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1</div>}
    </div>
  </div>
);

const Home: React.FC<{f: number; d: ClassFullData}> = ({f, d}) => (
  <div style={{position: 'absolute', inset: 0, background: '#f7f8fa'}}>
    <AppBar d={d} badge={f >= CT.notif} />
    <div style={{position: 'absolute', top: APP_TOP + 72, left: 16, right: 16, color: INK}}>
      <div style={{fontSize: 13, color: GRAY, fontWeight: 600}}>Hoy</div>
      <div style={{fontSize: 24, fontWeight: 700, letterSpacing: -0.5}}>Resumen</div>
      <div style={{display: 'flex', gap: 10, marginTop: 14}}>
        {[
          ['Reservas hoy', '46'],
          ['Ocupación', '87%'],
        ].map(([k, v]) => (
          <div key={k} style={{flex: 1, borderRadius: 14, background: '#fff', border: `1px solid ${LINE}`, padding: '12px 14px'}}>
            <div style={{fontSize: 12.5, color: GRAY}}>{k}</div>
            <div style={{fontSize: 24, fontWeight: 700, marginTop: 2}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize: 15, fontWeight: 700, margin: '20px 0 8px'}}>Próximas clases</div>
      {[[d.cls.time.split(' – ')[0], d.cls.name, d.cls.coach, f >= CT.notif ? d.cls.capacity : d.cls.capacity - 1, d.cls.capacity] as [string, string, string, number, number], ...d.today].map(([t, n, c, b, cap], i) => (
        <div key={i} style={{borderRadius: 14, background: '#fff', border: `1px solid ${LINE}`, padding: '11px 14px', marginBottom: 8}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{fontSize: 14, fontWeight: 700, width: 64}}>{t}</div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 14.5, fontWeight: 600}}>{n}</div>
              <div style={{fontSize: 12, color: GRAY}}>Coach {c}</div>
            </div>
            <div style={{fontSize: 13.5, fontWeight: 700, color: b >= cap ? RED : INK}}>
              {b}/{cap}
            </div>
          </div>
          <div style={{marginTop: 8}}>
            <Bar v={b} max={cap} h={5} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Detail: React.FC<{f: number; d: ClassFullData}> = ({f, d}) => {
  const c = d.cls;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f7f8fa'}}>
      <AppBar d={d} badge={false} back="Clases" />
      <div style={{position: 'absolute', top: APP_TOP + 70, left: 16, right: 16, color: INK}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontSize: 26, fontWeight: 700, letterSpacing: -0.5}}>{c.name}</div>
          <Pill tone="red" size={13}>
            Llena
          </Pill>
        </div>
        <div style={{marginTop: 10, borderRadius: 14, background: '#fff', border: `1px solid ${LINE}`, padding: '10px 14px', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6}}>
          <div>
            📅 <b>{c.date}</b> · {c.time} <span style={{color: GRAY}}>({c.duration})</span>
          </div>
          <div>
            🏋️ Coach <b>{c.coach}</b>
            {c.room ? <span style={{color: GRAY}}> · {c.room}</span> : null}
          </div>
          <div style={{marginTop: 4}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 5}}>
              <span>Lugares</span>
              <span style={{color: RED}}>
                {c.capacity}/{c.capacity} · cupo lleno
              </span>
            </div>
            <Bar v={c.capacity} max={c.capacity} />
          </div>
        </div>
        <div style={{fontSize: 15, fontWeight: 700, margin: '16px 0 6px'}}>Asistentes ({d.attendees.length})</div>
        <div style={{borderRadius: 14, background: '#fff', border: `1px solid ${LINE}`, overflow: 'hidden'}}>
          {d.attendees.map((a, i) => {
            const p = prog(f, CT.detail + 6 + i * 3, CT.detail + 14 + i * 3);
            return (
              <div key={a.name} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderTop: i ? `1px solid ${LINE}` : 'none', opacity: p, background: a.isNew ? '#f0faf3' : '#fff'}}>
                <div style={{width: 26, height: 26, borderRadius: '50%', background: a.isNew ? '#1f8a4c' : '#eef0f3', color: a.isNew ? '#fff' : GRAY, fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{a.name[0]}</div>
                <div style={{flex: 1, fontSize: 14, fontWeight: a.isNew ? 700 : 500}}>{a.name}</div>
                {a.isNew ? <span style={{fontSize: 11.5, fontWeight: 700, color: '#1f8a4c'}}>Nueva · hace 1 min</span> : <span style={{fontSize: 12, color: GRAY}}>{a.plan}</span>}
              </div>
            );
          })}
        </div>
        {d.waitlist ? (
          <div style={{marginTop: 10, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', padding: '9px 12px', fontSize: 13.5, color: '#9a3412', fontWeight: 600}}>⏳ {d.waitlist} personas en lista de espera</div>
        ) : null}
      </div>
    </div>
  );
};

const ClassFullScreen: React.FC<{d: ClassFullData}> = ({d}) => {
  const f = useCurrentFrame();
  const toast = Math.min(prog(f, CT.notif, CT.notif + 12), 1 - prog(f, CT.tap + 4, CT.tap + 12));
  const det = prog(f, CT.detail, CT.detail + 12);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f7f8fa', color: INK, overflow: 'hidden'}}>
      <Home f={f} d={d} />
      {f >= CT.detail && (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - det) * SW}px)`, boxShadow: '-10px 0 30px rgba(0,0,0,.1)'}}>
          <Detail f={f} d={d} />
        </div>
      )}
      {toast > 0 && (
        <div style={{position: 'absolute', top: APP_TOP + 6 + (1 - toast) * -110, left: 12, right: 12, zIndex: 50, borderRadius: 18, background: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,.18)', border: `1px solid ${LINE}`, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center', transform: f >= CT.tap - 2 && f < CT.tap + 4 ? 'scale(.97)' : 'none'}}>
          <div style={{width: 38, height: 38, borderRadius: 11, background: '#fdecec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20}}>🔥</div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14.5, fontWeight: 700}}>
              <span>¡Clase llena!</span>
              <span style={{fontSize: 12, color: GRAY, fontWeight: 500}}>ahora</span>
            </div>
            <div style={{fontSize: 13.5, color: '#374151', marginTop: 2}}>
              {d.cls.name} · {d.cls.date} · {d.cls.time.split(' – ')[0]} ya tiene {d.cls.capacity}/{d.cls.capacity} lugares
            </div>
          </div>
        </div>
      )}
      <StatusBar time={d.statusTime ?? '10:16'} />
      <HomeIndicator />
    </div>
  );
};

/** Teléfono del dueño o encargado: notificación de clase llena → detalle de la clase. ~8 s. */
export const classFullPanel = (d: ClassFullData): PhoneScene => ({
  id: 'panel-clase-llena',
  duration: CT.end,
  enter: 'left',
  Component: () => <ClassFullScreen d={d} />,
  perspective: d.perspective,
  taps: [{f: CT.tap, x: 195, y: APP_TOP + 40}],
  zooms: [
    {a: CT.notif + 2, b: CT.tap + 4, x: 195, y: 110, s: 1.3},
    {a: CT.detail + 30, b: CT.end - 6, x: 195, y: 400, s: 1.18},
  ],
  marks: {home: 0, notif: CT.notif, detail: CT.detail},
  subtitles: [
    {at: 0, text: d.subtitles?.home ?? 'Y tú lo ves todo en el panel de Aelika…'},
    {at: CT.notif, text: d.subtitles?.notif ?? '…te avisa en cuanto una clase se llena…'},
    {at: CT.detail, text: d.subtitles?.detail ?? '…y ves quién va y con qué paquete.'},
  ],
});

// ================================================================== TABLET
export type WeekClass = {day: number; slot: number; name: string; coach: string; booked: number; capacity: number};
export type WeekData = {
  business: string;
  /** "16 – 21 de noviembre" */
  weekLabel: string;
  /** columnas: [día corto, número] */
  days: [string, string][];
  /** índice del día de hoy (columna resaltada) */
  today: number;
  /** horarios (filas), p. ej. ["6:00", "7:15", …]; cada clase dura lo que dice `duration` */
  slots: string[];
  /** índice de la fila tras la que va el corte de mediodía (opcional) */
  breakAfter?: number;
  duration: string;
  classes: WeekClass[];
  /** clase destacada (la que se llenó) */
  highlight: {day: number; slot: number};
  waitlist?: number;
  perspective?: Perspective;
  subtitles?: {open?: string; detail?: string};
};

export const WEEK_T = {in: 14, cells: [16, 70], focus: 96, pop: 128, end: 230} as const;
const WT = WEEK_T;
const IW = 1000;
const IH = 720;
const IX = (1080 - IW) / 2;
const IY = 520;
const B = 22;
const LW = 740;
const SC = (IW - 2 * B) / LW;
const LH = (IH - 2 * B) / SC;

const CLASS_COLORS = ['#e8f5c8', '#dbeafe', '#ffe4d6', '#ede4ff', '#fde2e7', '#d9f3ef'];
const colorFor = (name: string) => CLASS_COLORS[Math.abs([...name].reduce((a, ch) => a + ch.charCodeAt(0), 0)) % CLASS_COLORS.length];

const SIDE = 112;
const TIME_COL = 44;
const GRID_TOP = 92;
const ROW_H = 62;
const geom = (d: WeekData) => {
  const gapH = d.breakAfter !== undefined ? 18 : 0;
  const colW = (LW - SIDE - 20 - TIME_COL) / d.days.length;
  const rowY = (r: number) => GRID_TOP + 26 + r * ROW_H + (d.breakAfter !== undefined && r > d.breakAfter ? gapH : 0);
  const colX = (c: number) => SIDE + 10 + TIME_COL + c * colW;
  return {gapH, colW, rowY, colX};
};

const WeekScreen: React.FC<{d: WeekData; f: number}> = ({d, f}) => {
  const {gapH, colW, rowY, colX} = geom(d);
  const hl = d.classes.find((c) => c.day === d.highlight.day && c.slot === d.highlight.slot)!;
  const focus = Math.max(0, Math.min(prog(f, WT.focus, WT.focus + 10), 1));
  const pop = prog(f, WT.pop, WT.pop + 10);
  return (
    <div style={{position: 'absolute', inset: 0, width: LW, height: LH, background: '#f7f8fa', color: INK, fontFamily: 'Inter, sans-serif'}}>
      {/* barra lateral */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDE, background: '#fff', borderRight: `1px solid ${LINE}`, padding: '12px 10px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14}}>
          <AelikaIcon size={18} />
          <span style={{fontSize: 12.5, fontWeight: 700}}>{d.business}</span>
        </div>
        {['Hoy', 'Clases', 'Clientes', 'Paquetes', 'Ventas'].map((n) => (
          <div key={n} style={{fontSize: 11.5, padding: '6px 8px', borderRadius: 7, marginBottom: 2, background: n === 'Clases' ? '#f1f2f4' : 'transparent', fontWeight: n === 'Clases' ? 700 : 500, color: n === 'Clases' ? INK : GRAY}}>
            {n}
          </div>
        ))}
      </div>
      {/* encabezado */}
      <div style={{position: 'absolute', left: SIDE + 16, right: 16, top: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div>
          <div style={{fontSize: 18, fontWeight: 700, letterSpacing: -0.3}}>Clases de la semana</div>
          <div style={{fontSize: 11, color: GRAY, marginTop: 1}}>
            {d.weekLabel} · cada clase dura {d.duration}
          </div>
        </div>
        <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
          <div style={{fontSize: 11, border: `1px solid ${LINE}`, borderRadius: 7, padding: '5px 9px', background: '#fff'}}>‹ Semana ›</div>
          <div style={{fontSize: 11, fontWeight: 700, borderRadius: 7, padding: '6px 10px', background: INK, color: '#fff'}}>+ Nueva clase</div>
        </div>
      </div>
      {/* columnas de días */}
      {d.days.map(([w, n], c) => (
        <div key={c} style={{position: 'absolute', left: colX(c), width: colW - 4, top: GRID_TOP - 30, textAlign: 'center'}}>
          <div style={{fontSize: 9.5, fontWeight: 700, color: c === d.today ? '#1d5fd1' : GRAY}}>{w}</div>
          <div style={{fontSize: 15, fontWeight: 700, width: 26, height: 26, lineHeight: '26px', margin: '1px auto 0', borderRadius: 13, background: c === d.today ? '#1d5fd1' : 'transparent', color: c === d.today ? '#fff' : INK}}>{n}</div>
        </div>
      ))}
      {/* filas de horario */}
      {d.slots.map((s, r) => (
        <React.Fragment key={s}>
          <div style={{position: 'absolute', left: SIDE + 10, top: rowY(r) + 2, width: TIME_COL - 6, fontSize: 9.5, color: GRAY, textAlign: 'right'}}>{s}</div>
          <div style={{position: 'absolute', left: SIDE + 10 + TIME_COL, right: 16, top: rowY(r), height: 1, background: LINE}} />
        </React.Fragment>
      ))}
      {d.breakAfter !== undefined && (
        <div style={{position: 'absolute', left: SIDE + 10 + TIME_COL, right: 16, top: rowY(d.breakAfter + 1) - gapH + 2, height: gapH - 4, borderRadius: 4, background: 'repeating-linear-gradient(135deg,#eef0f3 0 6px,#f7f8fa 6px 12px)'}} />
      )}
      {/* clases */}
      {d.classes.map((k, i) => {
        const p = prog(f, WT.cells[0] + (k.day * 4 + k.slot) * 1.2, WT.cells[0] + (k.day * 4 + k.slot) * 1.2 + 10);
        const isHl = k === hl;
        const full = k.booked >= k.capacity;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: colX(k.day) + 2,
              top: rowY(k.slot) + 3,
              width: colW - 8,
              height: ROW_H - 6,
              borderRadius: 7,
              background: colorFor(k.name),
              borderLeft: `3px solid ${full ? RED : rgba('#111827', 0.35)}`,
              padding: '4px 5px',
              boxSizing: 'border-box',
              opacity: p * (isHl ? 1 : 1 - 0.45 * focus * (1 - pop) * 0),
              transform: `scale(${(0.9 + 0.1 * p) * (isHl ? 1 + 0.06 * focus : 1)})`,
              boxShadow: isHl ? `0 0 0 ${2.5 * focus}px ${RED}, 0 8px 18px rgba(0,0,0,${0.18 * focus})` : 'none',
              zIndex: isHl ? 5 : 1,
              overflow: 'hidden',
            }}
          >
            <div style={{fontSize: 9.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{k.name}</div>
            <div style={{fontSize: 8.5, color: '#4b5563', whiteSpace: 'nowrap'}}>{k.coach}</div>
            <div style={{fontSize: 9, fontWeight: 700, marginTop: 2, color: full ? RED : INK}}>
              👥 {k.booked}/{k.capacity}
              {full ? ' · Llena' : ''}
            </div>
          </div>
        );
      })}
      {/* ventana emergente de la clase destacada */}
      {pop > 0 && (
        <div style={{position: 'absolute', left: Math.min(colX(hl.day) + colW + 4, LW - 230), top: rowY(hl.slot) - 6, width: 210, borderRadius: 12, background: '#fff', border: `1px solid ${LINE}`, boxShadow: '0 14px 30px rgba(0,0,0,.18)', padding: '10px 12px', opacity: pop, transform: `translateY(${(1 - pop) * 8}px)`, zIndex: 9}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: 13, fontWeight: 700}}>{hl.name}</span>
            <Pill tone="red" size={9.5}>
              Llena
            </Pill>
          </div>
          <div style={{fontSize: 10.5, color: GRAY, marginTop: 3}}>
            {d.days[hl.day][0]} {d.days[hl.day][1]} · {d.slots[hl.slot]} · {d.duration}
          </div>
          <div style={{fontSize: 11, marginTop: 6}}>
            Coach <b>{hl.coach}</b>
          </div>
          <div style={{marginTop: 6}}>
            <Bar v={hl.booked} max={hl.capacity} h={6} />
          </div>
          <div style={{fontSize: 10.5, marginTop: 4, display: 'flex', justifyContent: 'space-between'}}>
            <b style={{color: RED}}>
              {hl.booked}/{hl.capacity} asistentes
            </b>
            {d.waitlist ? <span style={{color: '#9a3412'}}>{d.waitlist} en espera</span> : null}
          </div>
        </div>
      )}
    </div>
  );
};

const Tablet: React.FC<{d: WeekData}> = ({d}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const inn = prog(f, 0, WT.in);
  const out = prog(f, WT.end - 6, WT.end + 10);
  // acercamiento a la clase destacada (y su ventana emergente) para que se lea
  const {colW, rowY, colX} = geom(d);
  const zx = IX + B + (colX(d.highlight.day) + colW) * SC;
  const zy = IY + B + (rowY(d.highlight.slot) + ROW_H / 2) * SC;
  const z = prog(f, WT.focus - 8, WT.focus + 16);
  const zs = 1 + 0.75 * z;
  return (
    <AbsoluteFill style={{opacity: Math.min(inn, 1 - out)}}>
      <AbsoluteFill style={{background: `linear-gradient(165deg, ${colors.paper} 0%, ${colors.light} 45%, ${colors.accentLight} 120%)`}}>
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 70%, ${rgba(colors.accent, 0.22)}, transparent 55%)`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${(540 - zx) * z}px, ${(900 - zy) * z}px) scale(${zs})`, transformOrigin: `${zx}px ${zy}px`}}>
      <div style={{position: 'absolute', left: IX, top: IY, width: IW, height: IH, borderRadius: 46, background: '#1b1b1d', boxShadow: '0 40px 90px rgba(0,0,0,.35), inset 0 0 0 3px #3a3a3e', transform: `translateY(${(1 - inn) * 80}px) scale(${0.94 + 0.06 * inn})`}}>
        <div style={{position: 'absolute', left: B, top: B, right: B, bottom: B, borderRadius: 26, overflow: 'hidden', background: '#fff'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: LW, height: LH, transform: `scale(${SC})`, transformOrigin: '0 0'}}>
            <WeekScreen d={d} f={f} />
          </div>
        </div>
        <div style={{position: 'absolute', top: IH / 2 - 5, left: 8, width: 8, height: 8, borderRadius: '50%', background: '#2c2c30'}} />
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Tablet: "Clases de la semana" en vista de calendario, con coach y asistencia. ~7.7 s. */
export const weekClassesTablet = (d: WeekData): PhoneScene => ({
  id: 'tablet-clases-semana',
  duration: WT.end,
  enter: 'fade',
  Component: () => null,
  Overlay: () => <Tablet d={d} />,
  perspective: d.perspective,
  marks: {open: 0, focus: WT.focus, pop: WT.pop},
  subtitles: [
    {at: 0, text: d.subtitles?.open ?? '…o desde la tablet, con todas las clases de la semana…'},
    {at: WT.focus, text: d.subtitles?.detail ?? '…con su coach y su asistencia.'},
  ],
});
