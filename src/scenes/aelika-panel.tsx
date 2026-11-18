import React from 'react';
import {useCurrentFrame} from 'remotion';
import {AelikaMark} from '../aelika/Aelika';
import {HomeIndicator, StatusBar} from '../core/Phone';
import {prog} from '../core/theme';
import {PhoneScene} from '../core/types';

/**
 * Lado del negocio: panel de Aelika con la ocupación de una clase/turno y la
 * notificación que recibe el equipo ("Tus clases de hoy").
 */
export type PanelData = {
  business: string;
  dateLabel: string;
  item: {time: string; name: string; who: string; booked: number; capacity: number};
  attendees: string[];
  /** índice del asistente nuevo (se resalta) */
  highlight?: number;
  notification: {app?: string; title: string; lines: string[]};
  statusTime?: string;
  subtitle?: string;
};

const NAVY = '#101a33';
const GRAD = 'linear-gradient(90deg,#0b8cf3,#13bcc9 55%,#7fcf33)';

const PanelScreen: React.FC<{d: PanelData}> = ({d}) => {
  const f = useCurrentFrame();
  const fill = prog(f, 8, 34);
  const booked = Math.round(d.item.booked * fill);
  const notif = prog(f, 66, 80);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f5f7fa', color: NAVY}}>
      <StatusBar time={d.statusTime ?? '5:30'} />
      <div style={{position: 'absolute', top: 58, left: 18, right: 18, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <AelikaMark size={0.16} />
        <div style={{fontSize: 12.5, color: '#6b7488', fontWeight: 600}}>{d.business} · Panel</div>
      </div>
      <div style={{position: 'absolute', top: 110, left: 18, right: 18}}>
        <div style={{fontSize: 13, color: '#6b7488', fontWeight: 600, letterSpacing: 0.5}}>{d.dateLabel.toUpperCase()}</div>
        <div style={{fontSize: 25, fontWeight: 700, letterSpacing: -0.6, marginTop: 2}}>Clases de hoy</div>
      </div>
      <div style={{position: 'absolute', top: 182, left: 14, right: 14, borderRadius: 20, background: '#fff', boxShadow: '0 6px 20px rgba(16,26,51,.08)', padding: 16}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
          <div style={{fontSize: 24, fontWeight: 700}}>{d.item.time}</div>
          <div style={{fontSize: 16, fontWeight: 600}}>{d.item.name}</div>
        </div>
        <div style={{fontSize: 13, color: '#6b7488', marginTop: 2}}>con {d.item.who}</div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 13.5, fontWeight: 600}}>
          <span>Lugares</span>
          <span>
            {booked} de {d.item.capacity}
          </span>
        </div>
        <div style={{height: 10, borderRadius: 5, background: '#e8edf3', marginTop: 6, overflow: 'hidden'}}>
          <div style={{width: `${(booked / d.item.capacity) * 100}%`, height: '100%', borderRadius: 5, background: GRAD}} />
        </div>
        <div style={{marginTop: 14, fontSize: 12.5, color: '#6b7488', fontWeight: 600}}>Asistentes</div>
        <div style={{display: 'flex', flexDirection: 'column', marginTop: 4}}>
          {d.attendees.map((a, i) => {
            const p = prog(f, 14 + i * 3, 24 + i * 3);
            const isNew = i === d.highlight;
            return (
              <div key={a} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < d.attendees.length - 1 ? '1px solid #eef1f5' : 'none', opacity: p}}>
                <div style={{width: 26, height: 26, borderRadius: '50%', background: isNew ? GRAD : '#e8edf3', color: isNew ? '#fff' : '#6b7488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700}}>{a[0]}</div>
                <div style={{flex: 1, fontSize: 14, fontWeight: isNew ? 700 : 500}}>{a}</div>
                {isNew ? (
                  <div style={{fontSize: 11, fontWeight: 700, color: '#0b8cf3', padding: '3px 8px', borderRadius: 999, background: 'rgba(11,140,243,.1)'}}>Nueva · paquete 5</div>
                ) : (
                  <div style={{fontSize: 12, color: '#21a36b', fontWeight: 600}}>✓ Confirmó</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {notif > 0 && (
        <div style={{position: 'absolute', top: 52 + (1 - notif) * -190, left: 10, right: 10, zIndex: 60, borderRadius: 22, background: 'rgba(250,250,250,.97)', boxShadow: '0 10px 30px rgba(0,0,0,.2)', padding: '12px 14px', display: 'flex', gap: 10}}>
          <div style={{width: 36, height: 36, borderRadius: 10, background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="#fff" />
            </svg>
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13.5}}>
              <b style={{fontWeight: 700}}>{d.notification.app ?? 'Aelika'}</b>
              <span style={{color: '#888', fontSize: 12}}>ahora</span>
            </div>
            <div style={{fontSize: 13.5, fontWeight: 600, marginTop: 1}}>{d.notification.title}</div>
            {d.notification.lines.map((l) => (
              <div key={l} style={{fontSize: 13, color: '#333', marginTop: 1}}>
                {l}
              </div>
            ))}
          </div>
        </div>
      )}
      <HomeIndicator />
    </div>
  );
};

export const aelikaPanel = (d: PanelData): PhoneScene => ({
  id: 'aelika-panel',
  duration: 150,
  enter: 'up',
  Component: () => <PanelScreen d={d} />,
  zooms: [{a: 72, b: 146, x: 195, y: 130, s: 1.3}],
  subtitles: [{at: 0, text: d.subtitle ?? 'Y tu estudio lo ve todo en tiempo real.'}],
});
