import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Brand, useBrand} from '../../core/brand';
import {BrandAvatar} from '../../core/Phone';
import {prog, typed} from '../../core/theme';
import {PhoneScene} from '../../core/types';
import {Cta, Field, StepHeader, StorefrontShell, Step, Success} from './shell';

/**
 * Storefront de CITAS (barbería, spa, uñas, consultorio…).
 * Flujo: menú → servicio (+extra) → profesional → día y hora → datos → resumen → confirmada.
 */
export type AppointmentsData = {
  /** dominio que se ve en la barra del navegador */
  url?: string;
  header: {title: string; subtitle: string; note?: string};
  /** opciones del menú principal; la primera es la que se toca */
  menu?: {icon: string; title: string; desc: string}[];
  services: {name: string; duration: string; price: string}[];
  pickService: number;
  /** extras opcionales (máx. 3) */
  extras?: {name: string; price: string}[];
  pickExtra?: number;
  /** total con el extra, p. ej. "$530" */
  total: string;
  /** "barbero", "estilista", "especialista"… */
  staffLabel: string;
  staff: {name: string; desc: string; hair?: string; skin?: string}[];
  pickStaff: number;
  /** "NOVIEMBRE 2026" */
  monthLabel: string;
  days: [string, string][];
  pickDay: number;
  /** p. ej. "Viernes 20 de noviembre" */
  dayLong: string;
  slots: string[];
  pickSlot: number;
  customer: {name: string; phone: string};
  /** p. ej. "Casa Occidente Guadalajara" */
  location: string;
  payNote?: string;
  statusTime?: string;
  subtitles?: Partial<Record<'menu' | 'service' | 'staff' | 'date' | 'data' | 'summary' | 'success', string>>;
};

// Tiempos locales (frames)
const T = {
  menu: [0, 60],
  service: [60, 150],
  staff: [150, 240],
  date: [240, 360],
  data: [360, 420],
  summary: [420, 540],
  success: [540, 610],
  tapMenu: 38,
  tapService: 80,
  tapExtra: 108,
  tapContinue1: 134,
  tapStaff: 196,
  tapDay: 262,
  tapSlot: 318,
  tapName: 364,
  tapPhone: 389,
  tapContinue2: 412,
  tapConfirm: 505,
} as const;

// Posiciones (px de pantalla)
const P = {
  menu: {x: 195, y: 404},
  service: (i: number) => ({x: 195, y: 170 + i * 84 + 37}),
  extra: (i: number) => ({x: 20 + i * 119 + 55, y: 534 + 24}),
  cta: {x: 195, y: 726},
  staff: (i: number) => ({x: 20 + (i % 2) * 184 + 83, y: 172 + Math.floor(i / 2) * 168 + 78}),
  day: (i: number) => ({x: 20 + i * 70 + 31, y: 241}),
  slot: (i: number) => ({x: 20 + (i % 3) * 119 + 54, y: 330 + Math.floor(i / 3) * 58 + 24}),
  name: {x: 195, y: 217},
  phone: {x: 230, y: 311},
};

const Face: React.FC<{hair: string; skin: string; size: number; brand: Brand}> = ({hair, skin, size, brand}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="32" fill="#e9dfd2" />
    <path d="M10 64c2-12 11-18 22-18s20 6 22 18z" fill={brand.colors.dark} />
    <ellipse cx="32" cy="30" rx="13" ry="15" fill={skin} />
    <path d="M19 26c0-10 6-14 13-14s13 4 13 14c-2-4-6-6-13-6s-11 2-13 6z" fill={hair} />
    <path d="M20 33c1 9 6 13 12 13s11-4 12-13c-2 4-6 6-12 6s-10-2-12-6z" fill={hair} opacity=".9" />
  </svg>
);

const Menu: React.FC<{f: number; d: AppointmentsData}> = ({f, d}) => {
  const {colors, displayFont} = useBrand();
  const items = d.menu ?? [
    {icon: '📅', title: 'Agendar cita', desc: 'Elige servicio, profesional y horario'},
    {icon: '🏷️', title: 'Ver promociones', desc: 'Paquetes y descuentos del mes'},
    {icon: '🛍️', title: 'Comprar productos', desc: 'Lleva a casa lo que usamos'},
  ];
  return (
    <>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 336, background: `linear-gradient(170deg, ${colors.dark}, ${colors.dark3} 70%, ${colors.accentDark} 140%)`, color: colors.light, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 84}}>
        <BrandAvatar size={86} />
        <div style={{marginTop: 14, fontFamily: displayFont, fontSize: 27, fontWeight: 700, letterSpacing: 3}}>{d.header.title}</div>
        <div style={{fontSize: 11.5, letterSpacing: 4, color: colors.accentLight, marginTop: 4}}>{d.header.subtitle}</div>
        {d.header.note && <div style={{marginTop: 14, fontSize: 12.5, opacity: 0.75}}>{d.header.note}</div>}
      </div>
      {items.slice(0, 3).map((it, i) => {
        const active = i === 0 && f >= T.tapMenu;
        const primary = i === 0;
        return (
          <div
            key={it.title}
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              top: 360 + i * 102,
              height: 88,
              borderRadius: 18,
              background: primary ? (active ? colors.accentDark : colors.accent) : '#fff',
              color: primary ? '#fff' : colors.dark,
              border: primary ? 'none' : `1px solid ${colors.line}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '0 18px',
              transform: active ? 'scale(.97)' : 'none',
              boxShadow: primary ? '0 10px 22px rgba(0,0,0,.2)' : '0 2px 6px rgba(0,0,0,.04)',
            }}
          >
            <div style={{fontSize: 28}}>{it.icon}</div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 700, fontSize: 17}}>{it.title}</div>
              <div style={{fontSize: 13, opacity: 0.75, marginTop: 2}}>{it.desc}</div>
            </div>
            <div style={{fontSize: 22, opacity: 0.6}}>›</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 680, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: colors.muted}}>
        Mostrador digital por <b style={{color: colors.dark}}>Aelika</b>
      </div>
    </>
  );
};

const Service: React.FC<{f: number; d: AppointmentsData}> = ({f, d}) => {
  const {colors} = useBrand();
  const sel = f >= T.tapService;
  const extraOn = d.pickExtra !== undefined && f >= T.tapExtra;
  const extrasP = prog(f, T.tapService + 4, T.tapService + 14);
  const base = d.services[d.pickService].price;
  return (
    <>
      <StepHeader step={1} title="Elige tu servicio" sub="Duración y precio incluidos" />
      {d.services.slice(0, 4).map((s, i) => {
        const on = sel && i === d.pickService;
        return (
          <div key={s.name} style={{position: 'absolute', left: 20, right: 20, top: 170 + i * 84, height: 74, borderRadius: 16, background: on ? '#fff8ef' : '#fff', border: `${on ? 2 : 1}px solid ${on ? colors.accent : colors.line}`, display: 'flex', alignItems: 'center', padding: '0 16px', boxSizing: 'border-box'}}>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 700, fontSize: 16.5}}>{s.name}</div>
              <div style={{fontSize: 13, color: colors.muted, marginTop: 3}}>⏱ {s.duration}</div>
            </div>
            <div style={{fontWeight: 700, fontSize: 16, marginRight: 12}}>{s.price}</div>
            <div style={{width: 22, height: 22, borderRadius: '50%', border: `2px solid ${on ? colors.accent : '#cfc5b8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {on && <div style={{width: 12, height: 12, borderRadius: '50%', background: colors.accent}} />}
            </div>
          </div>
        );
      })}
      {d.extras && (
        <div style={{opacity: extrasP, transform: `translateY(${(1 - extrasP) * 12}px)`}}>
          <div style={{position: 'absolute', top: 506, left: 20, fontWeight: 700, fontSize: 15}}>Agrega un extra</div>
          {d.extras.slice(0, 3).map((e, i) => {
            const on = extraOn && i === d.pickExtra;
            return (
              <div key={e.name} style={{position: 'absolute', top: 534, left: 20 + i * 119, width: 111, height: 48, borderRadius: 14, background: on ? colors.dark : '#fff', color: on ? colors.light : colors.dark, border: `1px solid ${on ? colors.dark : colors.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', lineHeight: 1.15}}>
                <div style={{fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap'}}>
                  {on ? '✓ ' : '+ '}
                  {e.name}
                </div>
                <div style={{fontSize: 12, opacity: 0.65}}>{e.price}</div>
              </div>
            );
          })}
        </div>
      )}
      <Cta label={sel ? `Continuar · ${extraOn ? d.total : base}` : 'Continuar'} active={sel} pressed={f >= T.tapContinue1} />
    </>
  );
};

const serviceLine = (d: AppointmentsData) => {
  const s = d.services[d.pickService];
  const extra = d.extras && d.pickExtra !== undefined ? ` + ${d.extras[d.pickExtra].name.toLowerCase()}` : '';
  return {name: `${s.name}${extra}`, duration: s.duration};
};

const Staff: React.FC<{f: number; d: AppointmentsData}> = ({f, d}) => {
  const brand = useBrand();
  const {colors} = brand;
  const sel = f >= T.tapStaff;
  const sl = serviceLine(d);
  const list = [{name: 'Me da igual', desc: 'Primer disponible'}, ...d.staff].slice(0, 6);
  return (
    <>
      <StepHeader step={2} title={`Elige a tu ${d.staffLabel}`} sub={`${sl.name} · ${sl.duration}`} />
      {list.map((p, i) => {
        const on = sel && i === d.pickStaff + 1;
        const person = d.staff[i - 1];
        return (
          <div key={p.name} style={{position: 'absolute', left: 20 + (i % 2) * 184, top: 172 + Math.floor(i / 2) * 168, width: 166, height: 156, borderRadius: 18, background: on ? '#fff8ef' : '#fff', border: `${on ? 2 : 1}px solid ${on ? colors.accent : colors.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box', transform: on ? `scale(${1 - 0.03 * (1 - prog(f, T.tapStaff, T.tapStaff + 8))})` : 'none'}}>
            {i === 0 ? (
              <div style={{width: 72, height: 72, borderRadius: '50%', background: colors.paper, border: `1.5px dashed ${colors.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30}}>🎲</div>
            ) : (
              <div style={{borderRadius: '50%', overflow: 'hidden', width: 72, height: 72}}>
                <Face hair={person.hair ?? '#2a2018'} skin={person.skin ?? '#c58e63'} size={72} brand={brand} />
              </div>
            )}
            <div style={{fontWeight: 700, fontSize: 16}}>{p.name}</div>
            <div style={{fontSize: 12, color: colors.muted}}>{p.desc}</div>
            {on && <div style={{position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: colors.accent, color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800}}>✓</div>}
          </div>
        );
      })}
    </>
  );
};

const DateTime: React.FC<{f: number; d: AppointmentsData}> = ({f, d}) => {
  const {colors} = useBrand();
  const day = f >= T.tapDay;
  const slot = f >= T.tapSlot;
  const who = d.staff[d.pickStaff].name;
  return (
    <>
      <StepHeader step={3} title="Elige día y hora" sub={`con ${who} · ${serviceLine(d).duration}`} />
      <div style={{position: 'absolute', top: 182, left: 20, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: colors.muted}}>{d.monthLabel}</div>
      {d.days.slice(0, 5).map(([dw, n], i) => {
        const on = day && i === d.pickDay;
        return (
          <div key={n} style={{position: 'absolute', top: 204, left: 20 + i * 70, width: 62, height: 74, borderRadius: 16, background: on ? colors.dark : '#fff', color: on ? colors.light : colors.dark, border: `1px solid ${on ? colors.dark : colors.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
            <div style={{fontSize: 11.5, fontWeight: 600, opacity: 0.7}}>{dw}</div>
            <div style={{fontSize: 22, fontWeight: 700, marginTop: 2}}>{n}</div>
          </div>
        );
      })}
      {!day && <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', color: colors.muted, fontSize: 14}}>Elige un día para ver horarios</div>}
      {day && (
        <>
          <div style={{position: 'absolute', top: 300, left: 20, fontSize: 14, fontWeight: 700, opacity: prog(f, T.tapDay + 2, T.tapDay + 10)}}>
            Horarios libres de {who} · <span style={{color: colors.accent}}>{d.days[d.pickDay][0].toLowerCase()} {d.days[d.pickDay][1]}</span>
          </div>
          {d.slots.slice(0, 6).map((s, i) => {
            const p = prog(f, T.tapDay + 4 + i * 2, T.tapDay + 12 + i * 2);
            const on = slot && i === d.pickSlot;
            return (
              <div key={s} style={{position: 'absolute', top: 330 + Math.floor(i / 3) * 58, left: 20 + (i % 3) * 119, width: 108, height: 48, borderRadius: 12, background: on ? colors.accent : '#fff', color: on ? '#fff' : colors.dark, border: `1.5px solid ${on ? colors.accent : colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14.5, boxSizing: 'border-box', opacity: p, transform: `translateY(${(1 - p) * 10}px) scale(${on ? 1.04 : 1})`}}>
                {s}
              </div>
            );
          })}
          <div style={{position: 'absolute', top: 460, left: 20, right: 20, fontSize: 12.5, color: colors.muted, opacity: prog(f, T.tapDay + 14, T.tapDay + 22)}}>✓ Sincronizado con la agenda de {who} en tiempo real</div>
        </>
      )}
    </>
  );
};

const Data: React.FC<{f: number; d: AppointmentsData}> = ({f, d}) => {
  const name = typed(d.customer.name, f, T.tapName + 4, T.tapName + 22);
  const phone = typed(d.customer.phone, f, T.tapPhone + 3, T.tapPhone + 18);
  return (
    <>
      <StepHeader step={4} title="Tus datos" sub="Solo dos datos y listo" />
      <Field label="Nombre" top={190} value={name} focus={f >= T.tapName && f < T.tapPhone} placeholder="Tu nombre" f={f} />
      <Field label="WhatsApp" top={284} value={phone} focus={f >= T.tapPhone && f < T.tapContinue2} prefix="🇲🇽 +52" placeholder="10 dígitos" f={f} />
      <Note top={356}>💬 Te mandamos la confirmación y un recordatorio por WhatsApp.</Note>
      <Cta label="Continuar" active={phone.length >= d.customer.phone.length - 1} pressed={f >= T.tapContinue2} />
    </>
  );
};

const Note: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => {
  const {colors} = useBrand();
  return <div style={{position: 'absolute', top, left: 20, right: 20, fontSize: 13, color: colors.muted}}>{children}</div>;
};

const Summary: React.FC<{f: number; d: AppointmentsData}> = ({f, d}) => {
  const {colors} = useBrand();
  const sl = serviceLine(d);
  const rows = [
    ['💈', 'Servicio', sl.name],
    ['👤', d.staffLabel[0].toUpperCase() + d.staffLabel.slice(1), d.staff[d.pickStaff].name],
    ['📅', 'Fecha', d.dayLong],
    ['🕔', 'Hora', `${d.slots[d.pickSlot]} · ${sl.duration}`],
    ['📍', 'Sucursal', d.location],
  ];
  return (
    <>
      <StepHeader step={5} title="Revisa tu cita" sub={`${d.customer.name} · +52 ${d.customer.phone}`} />
      <div style={{position: 'absolute', top: 190, left: 20, right: 20, borderRadius: 18, background: '#fff', border: `1px solid ${colors.line}`, padding: '6px 16px'}}>
        {rows.map(([e, l, v], i) => (
          <div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: i < rows.length - 1 ? `1px solid ${colors.line}` : 'none', opacity: prog(f, T.summary[0] + 4 + i * 4, T.summary[0] + 14 + i * 4)}}>
            <div style={{fontSize: 20, width: 26, textAlign: 'center'}}>{e}</div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 12, color: colors.muted}}>{l}</div>
              <div style={{fontSize: 15.5, fontWeight: 700, marginTop: 1}}>{v}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 560, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, padding: '0 6px'}}>
        <span>Total</span>
        <span>{d.extras && d.pickExtra !== undefined ? d.total : d.services[d.pickService].price}</span>
      </div>
      <div style={{position: 'absolute', top: 592, left: 26, fontSize: 12.5, color: colors.muted}}>{d.payNote ?? 'Pagas en sucursal'}</div>
      <Cta label="Confirmar cita" active pressed={f >= T.tapConfirm} />
    </>
  );
};

export const appointmentsStorefront = (d: AppointmentsData): PhoneScene => {
  const sub = d.subtitles ?? {};
  const steps: Step[] = [
    {range: T.menu, render: (f) => <Menu f={f} d={d} />},
    {range: T.service, render: (f) => <Service f={f} d={d} />},
    {range: T.staff, render: (f) => <Staff f={f} d={d} />},
    {range: T.date, render: (f) => <DateTime f={f} d={d} />},
    {range: T.data, render: (f) => <Data f={f} d={d} />},
    {range: T.summary, render: (f) => <Summary f={f} d={d} />},
    {range: T.success, render: (f) => <Success f={f} start={T.success[0]} title="¡Tu cita quedó agendada!" lines={[`${d.dayLong} · ${d.slots[d.pickSlot]} con ${d.staff[d.pickStaff].name}`, 'Te enviamos la confirmación por WhatsApp 💬']} />},
  ];
  return {
    id: 'storefront-citas',
    duration: T.success[1] - 10,
    enter: 'up',
    Component: () => <StorefrontShell steps={steps} url={d.url ?? 'pide.aelika.com'} time={d.statusTime ?? '7:26'} darkTopUntil={T.service[0] + 6} />,
    taps: [
      {f: T.tapMenu, ...P.menu},
      {f: T.tapService, ...P.service(d.pickService)},
      ...(d.extras && d.pickExtra !== undefined ? [{f: T.tapExtra, ...P.extra(d.pickExtra)}] : []),
      {f: T.tapContinue1, ...P.cta},
      {f: T.tapStaff, ...P.staff(d.pickStaff + 1)},
      {f: T.tapDay, ...P.day(d.pickDay)},
      {f: T.tapSlot, ...P.slot(d.pickSlot)},
      {f: T.tapName, ...P.name},
      {f: T.tapPhone, ...P.phone},
      {f: T.tapContinue2, ...P.cta},
      {f: T.tapConfirm, ...P.cta},
    ],
    zooms: [{a: 278, b: 350, x: 195, y: 372, s: 1.45}],
    subtitles: [
      {at: T.menu[0], text: sub.menu ?? 'Tu mostrador digital.'},
      {at: T.service[0], text: sub.service ?? 'Eliges tu servicio.'},
      {at: T.staff[0], text: sub.staff ?? `Escoges a tu ${d.staffLabel}.`},
      {at: T.date[0], text: sub.date ?? 'Solo ves horarios libres.'},
      {at: T.data[0], text: sub.data ?? 'Sin formularios largos.'},
      {at: T.summary[0], text: sub.summary ?? 'Confirmas en un toque.'},
      {at: T.success[0], text: sub.success ?? 'Listo. Quedó agendada.'},
    ],
  };
};
