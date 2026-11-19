import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {useBrand} from '../../core/brand';
import {BrandAvatar, HomeIndicator, StatusBar} from '../../core/Phone';
import {SW, prog, rgba, typed} from '../../core/theme';
import {PhoneScene} from '../../core/types';

/**
 * Storefront de CLASES (estudios de ejercicio, yoga, pilates…).
 * Flujo: portada → horario del día → filtro → detalle → WhatsApp + código → pago/paquete → lugar apartado.
 */
export type ClassItem = {time: string; name: string; coach: string; spots: number; tags?: string[]};

export type ClassesData = {
  url: string;
  /** foto en B/N de la portada, dentro de /public */
  coverPhoto: string;
  /** foto de la clase en la hoja de detalle */
  classPhoto: string;
  title: string;
  subtitle: string;
  /** botones de la portada; se toca el primero */
  menu?: [string, string, string];
  /** días: [etiqueta corta, número] — el primero es "Hoy" */
  days: [string, string][];
  pickDay: number;
  /** clases de hoy que aún no pasan */
  today: ClassItem[];
  /** clases del día elegido */
  classes: ClassItem[];
  filters: string[];
  /** índice del filtro que se toca (filtra por instructora o por tag) */
  pickFilter: number;
  /** clase elegida (índice dentro de `classes`) */
  pickClass: number;
  /** coachRole: etiqueta bajo el nombre del coach (por defecto "Instructora") */
  detail: {duration: string; level: string; focus: string; description: string; dayLong: string; coachRole?: string};
  customer: {name: string; phone: string; code: string};
  /** notificación con el código */
  codeFrom: string;
  pay: {
    /** opciones de pago: clase suelta, paquetes, mensualidad… (máx. 5) */
    options: {title: string; sub: string; price?: string; badge?: string; disabled?: boolean}[];
    /** opción que elige el cliente */
    pick: number;
    /** texto en la confirmación, p. ej. "Te quedan 4 clases en tu paquete" */
    remainingAfter: string;
  };
  statusTime?: string;
  subtitles?: Partial<Record<'cover' | 'schedule' | 'filter' | 'detail' | 'identify' | 'pay' | 'done', string>>;
};

// ------------------------------------------------------------------ tiempos (frames locales)
const T = {
  cover: [0, 120],
  schedule: [120, 360],
  identify: [510, 690],
  pay: [690, 900],
  done: [900, 1050],
  tapCover: 80,
  tapDay: 150,
  tapFilter: 288,
  tapClass: 338,
  sheetIn: 352,
  tapReserve: 470,
  tapName: 514,
  tapPhone: 540,
  tapSend: 574,
  codeBanner: 598,
  codeFill: 622,
  tapPack: 732,
  tapApplePay: 782,
  paySheet: 792,
  payOk: 852,
} as const;

const OPT_TOP = 204;
const OPT_STEP = 84;
const DAY_X = (i: number) => 20 + i * 70 + 31;
const CARD_TOP = 300;
const CARD_STEP = 88;

const fontThin = {fontWeight: 300, letterSpacing: -0.4};

// ------------------------------------------------------------------ piezas
const Pill: React.FC<{children: React.ReactNode; tone?: 'ok' | 'hot' | 'full'}> = ({children, tone = 'ok'}) => {
  const {colors} = useBrand();
  const bg = tone === 'hot' ? '#f3e1d8' : tone === 'full' ? '#ecebe7' : rgba(colors.accent, 0.18);
  const fg = tone === 'hot' ? '#a4573a' : tone === 'full' ? colors.muted : colors.accentDark;
  return <div style={{padding: '5px 10px', borderRadius: 999, background: bg, color: fg, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap'}}>{children}</div>;
};

const spotsLabel = (n: number) => (n === 0 ? 'Lista de espera' : n <= 2 ? `¡Últimos ${n}!` : `${n} lugares`);

const ClassCard: React.FC<{c: ClassItem; top: number; opacity?: number; active?: boolean}> = ({c, top, opacity = 1, active}) => {
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', left: 16, right: 16, top, height: 76, borderRadius: 16, background: active ? rgba(colors.accent, 0.12) : '#fff', border: `1px solid ${active ? colors.accent : colors.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 14, opacity, boxSizing: 'border-box', transform: active ? 'scale(.98)' : 'none'}}>
      <div style={{width: 58}}>
        <div style={{fontSize: 21, ...fontThin}}>{c.time}</div>
        <div style={{fontSize: 11, color: colors.muted}}>50 min</div>
      </div>
      <div style={{width: 1, alignSelf: 'stretch', margin: '14px 0', background: colors.line}} />
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 15.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.name}</div>
        <div style={{fontSize: 12.5, color: colors.muted, marginTop: 2}}>con {c.coach}</div>
      </div>
      <Pill tone={c.spots === 0 ? 'full' : c.spots <= 2 ? 'hot' : 'ok'}>{spotsLabel(c.spots)}</Pill>
    </div>
  );
};

const Header: React.FC<{title: string; sub?: string}> = ({title, sub}) => {
  const {colors} = useBrand();
  return (
    <>
      <div style={{position: 'absolute', top: 60, left: 16, right: 16, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <svg width="12" height="20" viewBox="0 0 12 20">
          <path d="M10 2 2 10l8 8" fill="none" stroke={colors.dark} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <BrandAvatar size={28} />
        <div style={{width: 12}} />
      </div>
      <div style={{position: 'absolute', top: 104, left: 20, right: 20, fontSize: 27, ...fontThin}}>{title}</div>
      {sub && <div style={{position: 'absolute', top: 140, left: 20, right: 20, fontSize: 13, color: colors.muted}}>{sub}</div>}
    </>
  );
};

const PrimaryBtn: React.FC<{label: React.ReactNode; top?: number; pressed?: boolean; dark?: boolean; outline?: boolean}> = ({label, top = 700, pressed, dark, outline}) => {
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', left: 20, right: 20, top, height: 52, borderRadius: 26, background: outline ? 'transparent' : dark ? '#000' : colors.dark, border: outline ? `1px solid ${colors.dark}` : 'none', color: outline ? colors.dark : '#fff', fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transform: pressed ? 'scale(.97)' : 'none'}}>
      {label}
    </div>
  );
};

/** Notificación de WhatsApp que baja desde arriba (solo el globito). */
export const WaBanner: React.FC<{p: number; from: string; children: React.ReactNode}> = ({p, from, children}) => {
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 52 + (1 - p) * -130, left: 10, right: 10, zIndex: 60, borderRadius: 20, background: 'rgba(245,245,245,.97)', boxShadow: '0 8px 24px rgba(0,0,0,.18)', padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center'}}>
      <div style={{width: 34, height: 34, borderRadius: 9, background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="#fff" />
        </svg>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13}}>
          <b style={{fontWeight: 600}}>{from}</b>
          <span style={{color: '#888', fontSize: 12}}>ahora</span>
        </div>
        <div style={{fontSize: 13, color: '#333', lineHeight: '17px'}}>{children}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ pantallas
const Cover: React.FC<{f: number; d: ClassesData}> = ({f, d}) => {
  const {colors} = useBrand();
  const menu = d.menu ?? ['Reservar clase', 'Paquetes', 'Mi primera clase'];
  return (
    <>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 360, overflow: 'hidden'}}>
        <Img src={staticFile(d.coverPhoto)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.05)', transform: `scale(${1.08 - f * 0.0006})`}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,.1), rgba(0,0,0,.05) 50%, ${colors.paper})`}} />
      </div>
      <div style={{position: 'absolute', top: 262, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{padding: 4, borderRadius: '50%', background: colors.paper}}>
          <BrandAvatar size={88} />
        </div>
        <div style={{marginTop: 12, fontSize: 24, fontWeight: 300, letterSpacing: 9}}>{d.title}</div>
        <div style={{marginTop: 4, fontSize: 12.5, color: colors.muted, letterSpacing: 1}}>{d.subtitle}</div>
      </div>
      {menu.map((m, i) => {
        const active = i === 0 && f >= T.tapCover;
        return (
          <div key={m} style={{position: 'absolute', left: 24, right: 24, top: 470 + i * 72, height: 58, borderRadius: 29, background: i === 0 ? (active ? colors.accentDark : colors.dark) : 'transparent', border: i === 0 ? 'none' : `1px solid ${colors.dark}`, color: i === 0 ? '#fff' : colors.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16.5, fontWeight: i === 0 ? 500 : 400, transform: active ? 'scale(.97)' : 'none'}}>
            {m}
          </div>
        );
      })}
    </>
  );
};

const Schedule: React.FC<{f: number; d: ClassesData}> = ({f, d}) => {
  const {colors} = useBrand();
  const dayOn = f >= T.tapDay;
  const filterOn = f >= T.tapFilter;
  const filterP = prog(f, T.tapFilter, T.tapFilter + 14);
  const fil = d.filters[d.pickFilter];
  const match = (c: ClassItem) => c.coach === fil || (c.tags ?? []).includes(fil);
  const list = dayOn ? d.classes : d.today;
  const chosen = d.classes[d.pickClass];
  // posiciones finales después de filtrar
  let k = 0;
  const finalIdx = list.map((c) => (match(c) ? k++ : -1));
  return (
    <>
      <Header title="Reservar clase" />
      {d.days.map(([lab, num], i) => {
        const on = dayOn ? i === d.pickDay : i === 0;
        return (
          <div key={i} style={{position: 'absolute', top: 146, left: DAY_X(i) - 31, width: 62, height: 70, borderRadius: 18, background: on ? colors.dark : '#fff', color: on ? '#fff' : colors.dark, border: `1px solid ${on ? colors.dark : colors.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
            <div style={{fontSize: 11, fontWeight: 500, opacity: 0.7, letterSpacing: 0.5}}>{lab}</div>
            <div style={{fontSize: 21, fontWeight: 300, marginTop: 1}}>{num}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 234, left: 16, right: 0, display: 'flex', gap: 8, overflow: 'hidden'}}>
        {d.filters.map((c, i) => {
          const on = filterOn ? i === d.pickFilter : i === 0;
          return (
            <div key={c} style={{height: 34, padding: '0 14px', borderRadius: 17, background: on ? rgba(colors.accent, 0.25) : '#fff', border: `1px solid ${on ? colors.accent : colors.line}`, color: on ? colors.accentDark : colors.dark, display: 'flex', alignItems: 'center', fontSize: 13.5, fontWeight: on ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0}}>
              {c}
            </div>
          );
        })}
      </div>
      {!dayOn && <div style={{position: 'absolute', top: CARD_TOP - 26, left: 20, fontSize: 12, color: colors.muted}}>Las clases que ya pasaron no aparecen</div>}
      {list.map((c, i) => {
        const appear = dayOn ? prog(f, T.tapDay + 4 + i * 3, T.tapDay + 14 + i * 3) : 1;
        let top = CARD_TOP + i * CARD_STEP;
        let op = appear;
        if (dayOn && filterOn) {
          if (finalIdx[i] < 0) op = appear * (1 - filterP);
          else top = top + (CARD_TOP + finalIdx[i] * CARD_STEP - top) * filterP;
        }
        if (op <= 0.01) return null;
        return <ClassCard key={c.time + c.name} c={c} top={top + (1 - appear) * 12} opacity={op} active={dayOn && c === chosen && f >= T.tapClass} />;
      })}
    </>
  );
};

const DetailSheet: React.FC<{f: number; d: ClassesData}> = ({f, d}) => {
  const {colors} = useBrand();
  const c = d.classes[d.pickClass];
  const p = prog(f, T.sheetIn, T.sheetIn + 16);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.35 * p})`, zIndex: 40}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120 + (1 - p) * 740, bottom: 0, background: colors.paper, borderRadius: '26px 26px 0 0', zIndex: 41, overflow: 'hidden', boxShadow: '0 -10px 30px rgba(0,0,0,.15)'}}>
        <div style={{width: 40, height: 5, borderRadius: 3, background: colors.line, margin: '8px auto'}} />
        <div style={{margin: '4px 16px 0', height: 180, borderRadius: 18, overflow: 'hidden'}}>
          <Img src={staticFile(d.classPhoto)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)'}} />
        </div>
        <div style={{padding: '16px 20px 0'}}>
          <div style={{fontSize: 29, ...fontThin}}>{c.name}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 10}}>
            <div style={{width: 36, height: 36, borderRadius: '50%', background: rgba(colors.accent, 0.35), color: colors.accentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600}}>{c.coach[0]}</div>
            <div>
              <div style={{fontSize: 14.5, fontWeight: 500}}>{c.coach}</div>
              <div style={{fontSize: 12, color: colors.muted}}>{d.detail.coachRole ?? 'Instructora'}</div>
            </div>
          </div>
          <div style={{display: 'flex', gap: 6, marginTop: 14}}>
            {[d.detail.duration, d.detail.level, d.detail.focus].map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>
          <div style={{fontSize: 14, lineHeight: 1.45, color: '#55534e', marginTop: 12}}>{d.detail.description}</div>
          <div style={{marginTop: 14, padding: '10px 12px', borderRadius: 12, background: '#fff', border: `1px solid ${colors.line}`, fontSize: 13.5, display: 'flex', justifyContent: 'space-between'}}>
            <span>
              {d.detail.dayLong} · {c.time}
            </span>
            <span style={{color: colors.accentDark, fontWeight: 600}}>{spotsLabel(c.spots)}</span>
          </div>
        </div>
        <PrimaryBtn label="Reservar mi lugar" top={580} pressed={f >= T.tapReserve} />
      </div>
    </>
  );
};

const Field: React.FC<{label: string; top: number; value: string; focus: boolean; prefix?: string; placeholder: string; f: number}> = ({label, top, value, focus, prefix, placeholder, f}) => {
  const {colors} = useBrand();
  return (
    <>
      <div style={{position: 'absolute', top: top - 22, left: 20, fontSize: 12.5, color: colors.muted}}>{label}</div>
      <div style={{position: 'absolute', top, left: 20, right: 20, height: 52, borderRadius: 14, background: '#fff', border: `${focus ? 1.5 : 1}px solid ${focus ? colors.accentDark : colors.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 17, boxSizing: 'border-box', gap: 8}}>
        {prefix && <span style={{fontWeight: 500}}>{prefix}</span>}
        {value ? <span>{value}</span> : <span style={{color: '#b5b1a8'}}>{focus ? '' : placeholder}</span>}
        {focus && f % 30 < 18 && <span style={{width: 1.5, height: 22, background: colors.accentDark, marginLeft: -6}} />}
      </div>
    </>
  );
};

const Identify: React.FC<{f: number; d: ClassesData}> = ({f, d}) => {
  const {colors} = useBrand();
  const name = typed(d.customer.name, f, T.tapName + 4, T.tapName + 20);
  const phone = typed(d.customer.phone, f, T.tapPhone + 3, T.tapPhone + 22);
  const codeView = f >= T.tapSend + 8;
  const cv = prog(f, T.tapSend + 8, T.tapSend + 20);
  const banner = Math.min(prog(f, T.codeBanner, T.codeBanner + 10), 1 - prog(f, T.codeBanner + 50, T.codeBanner + 60));
  const digits = Array.from(d.customer.code);
  return (
    <>
      <Header title="Identifícate" sub="Con tu WhatsApp. Sin contraseñas ni descargas." />
      <div style={{opacity: 1 - cv}}>
        <Field label="Nombre" top={210} value={name} focus={f >= T.tapName && f < T.tapPhone} placeholder="Tu nombre" f={f} />
        <Field label="WhatsApp" top={300} value={phone} focus={f >= T.tapPhone && f < T.tapSend} prefix="🇲🇽 +52" placeholder="10 dígitos" f={f} />
        <PrimaryBtn label="Enviarme código" pressed={f >= T.tapSend} />
      </div>
      {codeView && (
        <div style={{position: 'absolute', inset: 0, opacity: cv, transform: `translateX(${(1 - cv) * 40}px)`}}>
          <div style={{position: 'absolute', top: 196, left: 20, right: 20, fontSize: 14.5, color: '#55534e', lineHeight: 1.45}}>
            Te enviamos un código de 4 dígitos a tu WhatsApp
            <br />
            <b style={{fontWeight: 600}}>+52 {d.customer.phone}</b>
          </div>
          <div style={{position: 'absolute', top: 268, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12}}>
            {digits.map((ch, i) => {
              const on = f >= T.codeFill + i * 4;
              return (
                <div key={i} style={{width: 60, height: 70, borderRadius: 16, background: '#fff', border: `1.5px solid ${on ? colors.accentDark : colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 300, transform: `scale(${on ? 1 + 0.08 * (1 - prog(f, T.codeFill + i * 4, T.codeFill + i * 4 + 6)) : 1})`}}>
                  {on ? ch : ''}
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: colors.accentDark, opacity: prog(f, T.codeFill + 16, T.codeFill + 24)}}>✓ Código autocompletado</div>
        </div>
      )}
      <WaBanner p={banner} from={d.codeFrom}>
        Tu código de acceso es {d.customer.code}
      </WaBanner>
    </>
  );
};

const Pay: React.FC<{f: number; d: ClassesData}> = ({f, d}) => {
  const {colors} = useBrand();
  const c = d.classes[d.pickClass];
  const picked = f >= T.tapPack;
  const btnP = prog(f, T.tapPack + 4, T.tapPack + 16);
  const sheet = prog(f, T.paySheet, T.paySheet + 14);
  const ok = f >= T.payOk;
  const opts = d.pay.options.slice(0, 5);
  const chosenOpt = opts[d.pay.pick];
  return (
    <>
      <Header title="" />
      <div style={{position: 'absolute', top: 104, left: 20, right: 20, fontSize: 23, ...fontThin, lineHeight: 1.2}}>
        Hola, {d.customer.name.split(' ')[0]} 👋
        <br />
        ¿cómo quieres pagar esta clase?
      </div>
      <div style={{position: 'absolute', top: 172, left: 20, right: 20, fontSize: 13, color: colors.muted}}>
        {c.name} · {d.days[d.pickDay][0][0] + d.days[d.pickDay][0].slice(1).toLowerCase()} {d.days[d.pickDay][1]} · {c.time} · {c.coach}
      </div>
      {opts.map((o, i) => {
        const on = picked && i === d.pay.pick;
        return (
          <div key={o.title} style={{position: 'absolute', left: 16, right: 16, top: OPT_TOP + i * OPT_STEP, height: OPT_STEP - 10, borderRadius: 18, background: on ? rgba(colors.accent, 0.14) : '#fff', border: `${on ? 1.5 : 1}px solid ${on ? colors.accentDark : colors.line}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, opacity: o.disabled ? 0.45 : 1, boxSizing: 'border-box'}}>
            <div style={{width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${on ? colors.accentDark : '#c9c5bd'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {on && <div style={{width: 12, height: 12, borderRadius: '50%', background: colors.accentDark}} />}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 16, fontWeight: 500}}>{o.title}</div>
              {o.badge && <div style={{position: 'absolute', top: -9, right: 16, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, padding: '3px 10px', borderRadius: 999, background: colors.dark, color: '#fff'}}>{o.badge}</div>}
              <div style={{fontSize: 12.5, color: colors.muted, marginTop: 3}}>{o.sub}</div>
            </div>
            {o.price && <div style={{fontSize: 18, fontWeight: 300}}>{o.price}</div>}
          </div>
        );
      })}
      <div style={{opacity: btnP, transform: `translateY(${(1 - btnP) * 16}px)`}}>
        <PrimaryBtn
          top={640}
          dark
          pressed={f >= T.tapApplePay && f < T.tapApplePay + 8}
          label={
            <>
              Pagar con <b style={{fontWeight: 600}}>Apple Pay</b>
            </>
          }
        />
        <PrimaryBtn top={702} outline label="Pagar con tarjeta" />
      </div>
      {sheet > 0 && (
        <>
          <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.3 * sheet})`, zIndex: 40}} />
          <div style={{position: 'absolute', left: 8, right: 8, bottom: 80, height: 310, borderRadius: 32, background: '#f2f2f2', zIndex: 41, transform: `translateY(${(1 - sheet) * 420}px)`, padding: '18px 22px', boxSizing: 'border-box', color: '#111'}}>
            <div style={{fontSize: 21, fontWeight: 600}}>Apple Pay</div>
            <div style={{marginTop: 14, borderRadius: 14, background: '#fff', padding: '12px 14px', fontSize: 14.5, display: 'flex', flexDirection: 'column', gap: 8}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#777'}}>Tarjeta</span>
                <span>Visa •••• 4242</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#777'}}>{d.title}</span>
                <span>{chosenOpt.title}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 600}}>
                <span>Total</span>
                <span>{chosenOpt.price} MXN</span>
              </div>
            </div>
            <div style={{marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
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

const Done: React.FC<{f: number; d: ClassesData}> = ({f, d}) => {
  const {colors} = useBrand();
  const s = T.done[0];
  const c = d.classes[d.pickClass];
  const p = prog(f, s + 2, s + 16);
  const draw = prog(f, s + 10, s + 26);
  const dayShort = d.days[d.pickDay][0][0] + d.days[d.pickDay][0].slice(1).toLowerCase();
  const banner = prog(f, s + 44, s + 56);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 170}}>
      <WaBanner p={banner} from={d.codeFrom}>
        ¡Lugar apartado, {d.customer.name.split(' ')[0]}! ✅ {c.name} con {c.coach} · {dayShort} {d.days[d.pickDay][1]} · {c.time}
      </WaBanner>
      <div style={{width: 116, height: 116, borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * p})`, opacity: p, boxShadow: `0 0 0 ${18 * p}px ${rgba(colors.accent, 0.18)}`}}>
        <svg width="60" height="60" viewBox="0 0 64 64">
          <path d="M16 33l11 11 22-24" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - draw)} />
        </svg>
      </div>
      <div style={{marginTop: 30, fontSize: 32, ...fontThin, opacity: prog(f, s + 12, s + 22)}}>¡Lugar apartado!</div>
      <div style={{marginTop: 10, fontSize: 16, opacity: prog(f, s + 16, s + 26)}}>
        {c.name} · {dayShort} {d.days[d.pickDay][1]} · {c.time} · {c.coach}
      </div>
      <div style={{marginTop: 6, fontSize: 13, color: colors.muted, opacity: prog(f, s + 18, s + 28)}}>{d.pay.remainingAfter}</div>
      <div style={{position: 'absolute', left: 20, right: 20, top: 520, display: 'flex', flexDirection: 'column', gap: 10, opacity: prog(f, s + 24, s + 36)}}>
        {['📅  Agregar a calendario', '📍  Cómo llegar'].map((l) => (
          <div key={l} style={{height: 52, borderRadius: 26, border: `1px solid ${colors.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15.5}}>{l}</div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ marco
const ClassesScreen: React.FC<{d: ClassesData}> = ({d}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const steps: {a: number; b: number; render: () => React.ReactNode}[] = [
    {a: T.cover[0], b: T.cover[1], render: () => <Cover f={f} d={d} />},
    {
      a: T.schedule[0],
      b: T.identify[0],
      render: () => (
        <>
          <Schedule f={f} d={d} />
          {f >= T.sheetIn && <DetailSheet f={f} d={d} />}
        </>
      ),
    },
    {a: T.identify[0], b: T.identify[1], render: () => <Identify f={f} d={d} />},
    {a: T.pay[0], b: T.pay[1], render: () => <Pay f={f} d={d} />},
    {a: T.done[0], b: T.done[1] + 20, render: () => <Done f={f} d={d} />},
  ];
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
      <StatusBar time={d.statusTime ?? '10:15'} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, background: colors.paper, borderTop: `1px solid ${colors.line}`, zIndex: 30}}>
        <div style={{margin: '8px auto 0', width: SW - 32, height: 38, borderRadius: 12, background: '#fff', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, gap: 6, color: '#333'}}>
          <span style={{fontSize: 11}}>🔒</span> {d.url}
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
};

export const classesStorefront = (d: ClassesData): PhoneScene => {
  const sub = d.subtitles ?? {};
  const chosenFilteredIdx = d.classes.filter((c) => c.coach === d.filters[d.pickFilter] || (c.tags ?? []).includes(d.filters[d.pickFilter])).indexOf(d.classes[d.pickClass]);
  // ancho aprox. de cada chip para ubicar el toque
  const chipX = (i: number) => {
    let x = 16;
    for (let k = 0; k < i; k++) x += d.filters[k].length * 7.6 + 28 + 8;
    return x + (d.filters[i].length * 7.6 + 28) / 2;
  };
  return {
    id: 'storefront-clases',
    duration: T.done[1],
    enter: 'up',
    Component: () => <ClassesScreen d={d} />,
    taps: [
      {f: T.tapCover, x: 195, y: 499},
      {f: T.tapDay, x: DAY_X(d.pickDay), y: 181},
      {f: T.tapFilter, x: chipX(d.pickFilter), y: 251},
      {f: T.tapClass, x: 195, y: CARD_TOP + Math.max(0, chosenFilteredIdx) * CARD_STEP + 38},
      {f: T.tapReserve, x: 195, y: 120 + 580 + 26},
      {f: T.tapName, x: 195, y: 236},
      {f: T.tapPhone, x: 230, y: 326},
      {f: T.tapSend, x: 195, y: 726},
      {f: T.tapPack, x: 195, y: OPT_TOP + d.pay.pick * OPT_STEP + (OPT_STEP - 10) / 2},
      {f: T.tapApplePay, x: 195, y: 666},
    ],
    zooms: [
      {a: 176, b: 262, x: 195, y: 420, s: 1.35},
      {a: 700, b: 778, x: 195, y: 350, s: 1.3},
    ],
    subtitles: [
      {at: T.cover[0], text: sub.cover ?? 'Sin descargar app. Sin crear contraseña.'},
      {at: T.schedule[0], text: sub.schedule ?? 'Ves los lugares disponibles en tiempo real.'},
      {at: T.tapFilter - 8, text: sub.filter ?? 'Filtra por tipo de clase o instructora.'},
      {at: T.sheetIn, text: sub.detail ?? 'Conoces la clase antes de reservar.'},
      {at: T.identify[0], text: sub.identify ?? 'Te identificas con tu WhatsApp.'},
      {at: T.pay[0], text: sub.pay ?? 'Compra tu paquete y reserva en el mismo paso.'},
      {at: T.done[0], text: sub.done ?? 'Listo. Y te confirma por WhatsApp.'},
    ],
  };
};
