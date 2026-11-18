import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBrand} from '../../core/brand';
import {HomeIndicator, StatusBar} from '../../core/Phone';
import {SW, prog} from '../../core/theme';

/**
 * Piezas comunes a cualquier storefront (citas, pedidos, tienda…):
 * el marco con barra de navegador, el encabezado de paso, botones y campos.
 */
export type Step = {range: readonly [number, number] | readonly number[]; render: (f: number) => React.ReactNode};

export const StorefrontShell: React.FC<{steps: Step[]; url: string; time: string; darkTopUntil?: number}> = ({steps, url, time, darkTopUntil = 0}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', inset: 0, background: colors.paper, color: colors.dark, overflow: 'hidden'}}>
      {steps.map((s, i) => {
        const [a, b] = s.range;
        if (f < a || f >= b + 12) return null;
        const enter = i === 0 ? 1 : prog(f, a, a + 12);
        const exit = i === steps.length - 1 ? 0 : prog(f, b, b + 12);
        return (
          <div key={i} style={{position: 'absolute', inset: 0, background: colors.paper, transform: `translateX(${(1 - enter) * SW - exit * 120}px)`, opacity: 1 - exit * 0.6, boxShadow: enter < 1 ? '-10px 0 30px rgba(0,0,0,.12)' : 'none'}}>
            {s.render(f)}
          </div>
        );
      })}
      <StatusBar time={time} dark={f < darkTopUntil} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, background: colors.paper, borderTop: `1px solid ${colors.line}`}}>
        <div style={{margin: '8px auto 0', width: SW - 32, height: 38, borderRadius: 12, background: '#fff', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, gap: 6, color: '#333'}}>
          <span style={{fontSize: 11}}>🔒</span> {url}
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
};

export const StepHeader: React.FC<{step: number; of?: number; title: string; sub?: string}> = ({step, of = 5, title, sub}) => {
  const brand = useBrand();
  const {colors} = brand;
  return (
    <>
      <div style={{position: 'absolute', top: 58, left: 16, right: 16, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <svg width="12" height="20" viewBox="0 0 12 20">
          <path d="M10 2 2 10l8 8" fill="none" stroke={colors.dark} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <div style={{fontFamily: brand.displayFont, fontWeight: 700, fontSize: 15, letterSpacing: 2}}>{brand.name.toUpperCase()}</div>
        <div style={{fontSize: 12, color: colors.muted}}>
          Paso {step}/{of}
        </div>
      </div>
      <div style={{position: 'absolute', top: 98, left: 16, right: 16, height: 4, borderRadius: 2, background: colors.line}}>
        <div style={{width: `${(step / of) * 100}%`, height: '100%', borderRadius: 2, background: colors.accent}} />
      </div>
      <div style={{position: 'absolute', top: 110, left: 20, fontFamily: brand.displayFont, fontSize: 26, fontWeight: 700}}>{title}</div>
      {sub && <div style={{position: 'absolute', top: 146, left: 20, right: 20, fontSize: 14, color: colors.muted, whiteSpace: 'nowrap', overflow: 'hidden'}}>{sub}</div>}
    </>
  );
};

export const Cta: React.FC<{label: string; active: boolean; pressed: boolean; top?: number}> = ({label, active, pressed, top = 700}) => {
  const {colors} = useBrand();
  return (
    <div style={{position: 'absolute', left: 20, right: 20, top, height: 52, borderRadius: 14, background: active ? colors.dark : '#d9d0c4', color: active ? colors.light : '#8a8178', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: pressed ? 'scale(.97)' : 'none', boxShadow: active ? '0 8px 18px rgba(0,0,0,.18)' : 'none'}}>
      {label}
    </div>
  );
};

export const Field: React.FC<{label: string; top: number; value: string; focus: boolean; prefix?: string; placeholder: string; f: number}> = ({label, top, value, focus, prefix, placeholder, f}) => {
  const {colors} = useBrand();
  return (
    <>
      <div style={{position: 'absolute', top: top - 22, left: 20, fontSize: 13, fontWeight: 600, color: colors.muted}}>{label}</div>
      <div style={{position: 'absolute', top, left: 20, right: 20, height: 54, borderRadius: 14, background: '#fff', border: `${focus ? 2 : 1}px solid ${focus ? colors.accent : colors.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 17, boxSizing: 'border-box', gap: 8}}>
        {prefix && <span style={{fontWeight: 600}}>{prefix}</span>}
        {value ? <span>{value}</span> : <span style={{color: '#b8ada0'}}>{focus ? '' : placeholder}</span>}
        {focus && f % 30 < 18 && <span style={{width: 2, height: 22, background: colors.accent, marginLeft: -6}} />}
      </div>
    </>
  );
};

export const Success: React.FC<{f: number; start: number; title: string; lines: string[]}> = ({f, start, title, lines}) => {
  const brand = useBrand();
  const {colors} = brand;
  const p = prog(f, start + 2, start + 16);
  const draw = prog(f, start + 10, start + 26);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 190}}>
      <div style={{width: 120, height: 120, borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * p})`, opacity: p, boxShadow: `0 0 0 ${18 * p}px ${colors.accent}26`}}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <path d="M16 33l11 11 22-24" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - draw)} />
        </svg>
      </div>
      <div style={{marginTop: 34, fontFamily: brand.displayFont, fontSize: 28, fontWeight: 700, textAlign: 'center', opacity: prog(f, start + 12, start + 22), padding: '0 24px'}}>{title}</div>
      <div style={{marginTop: 12, fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 1.5, opacity: prog(f, start + 16, start + 26)}}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
};
