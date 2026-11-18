import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {BrandAvatar, HomeIndicator, ICONS as I, Icon, StatusBar} from '../core/Phone';
import {useBrand} from '../core/brand';
import {SW, prog} from '../core/theme';
import {PhoneScene} from '../core/types';

const DARK = '#0c1014';

// ================================================================== POST
export type InstagramPostData = {
  /** foto del post (4:5), dentro de /public */
  image: string;
  username: string;
  caption: string;
  likes?: number;
  date?: string;
  time?: string;
  subtitle?: string;
};

const LIKE = 22;
const USER_TAP = 62;

const PostScreen: React.FC<{d: InstagramPostData}> = ({d}) => {
  const f = useCurrentFrame();
  const liked = f >= LIKE;
  const burst = prog(f, LIKE, LIKE + 8);
  const burstOut = prog(f, LIKE + 22, LIKE + 32);
  const likes = (d.likes ?? 1284) + (liked ? 1 : 0);
  return (
    <div style={{position: 'absolute', inset: 0, background: DARK, color: '#f5f5f5'}}>
      <StatusBar time={d.time ?? '7:24'} dark />
      <div style={{position: 'absolute', top: 58, left: 12, right: 12, height: 52, display: 'flex', alignItems: 'center'}}>
        <div style={{width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon d={I.back} size={22} />
        </div>
        <div style={{flex: 1, textAlign: 'center', lineHeight: 1.15}}>
          <div style={{fontWeight: 700, fontSize: 17}}>Publicaciones</div>
          <div style={{fontSize: 13}}>{d.username}</div>
        </div>
        <div style={{height: 40, padding: '0 18px', borderRadius: 20, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 15}}>Seguir</div>
      </div>
      <div style={{position: 'absolute', top: 120, left: 10, right: 12, height: 44, display: 'flex', alignItems: 'center', gap: 10}}>
        <BrandAvatar size={34} />
        <div style={{fontWeight: 600, fontSize: 15, flex: 1}}>
          <span style={{padding: '2px 4px', marginLeft: -4, borderRadius: 6, background: f >= USER_TAP ? 'rgba(255,255,255,.2)' : 'transparent'}}>{d.username}</span>
        </div>
        <Icon d="M5 9h14M9 15h10" size={24} sw={2.2} />
      </div>
      <div style={{position: 'absolute', top: 166, left: 0, width: SW, height: SW * 1.25, overflow: 'hidden'}}>
        <Img src={staticFile(d.image)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + f * 0.0008})`}} />
        {f >= LIKE && f < LIKE + 34 && (
          <div style={{position: 'absolute', left: SW / 2 - 50, top: 190, transform: `scale(${0.3 + burst * 0.8 - burstOut * 0.2}) rotate(${(1 - burst) * -15}deg)`, opacity: 1 - burstOut, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.4))'}}>
            <Icon d={I.heart} size={100} fill color="#fff" />
          </div>
        )}
      </div>
      <div style={{position: 'absolute', top: 662, left: 14, right: 14, height: 34, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{transform: `scale(${liked ? 1 + 0.25 * (1 - prog(f, LIKE, LIKE + 10)) : 1})`}}>
          <Icon d={I.heart} size={27} fill={liked} color={liked ? '#ff3040' : '#f5f5f5'} />
        </div>
        <Icon d={I.bubble} size={26} />
        <Icon d={I.repost} size={25} />
        <Icon d={I.send} size={25} />
        <div style={{flex: 1}} />
        <Icon d={I.bookmark} size={26} />
      </div>
      <div style={{position: 'absolute', top: 704, left: 14, right: 14, fontSize: 14.5, lineHeight: '19px'}}>
        <div>
          Les gusta a <b>{likes.toLocaleString('en-US')}</b> personas
        </div>
        <div style={{marginTop: 3}}>
          <b>{d.username}</b> {d.caption} <span style={{color: '#a8a8a8'}}>más</span>
        </div>
        <div style={{marginTop: 4, fontSize: 13, color: '#a8a8a8'}}>{d.date ?? ''}</div>
      </div>
      <div style={{position: 'absolute', top: 806, left: 10, right: 12, display: 'flex', alignItems: 'center', gap: 10}}>
        <BrandAvatar size={34} />
        <div style={{fontWeight: 600, fontSize: 15}}>{d.username}</div>
      </div>
      <HomeIndicator dark />
    </div>
  );
};

/** Post de Instagram: doble toque (like) y toque al nombre de la cuenta. 3 s. */
export const instagramPost = (d: InstagramPostData): PhoneScene => ({
  id: 'ig-post',
  duration: 90,
  enter: 'none',
  Component: () => <PostScreen d={d} />,
  taps: [
    {f: LIKE, x: 200, y: 400},
    {f: USER_TAP, x: 100, y: 142},
  ],
  subtitles: [{at: 0, text: d.subtitle ?? 'Ves un post que te late.'}],
});

// ================================================================== PERFIL
export type InstagramProfileData = {
  username: string;
  /** nombre visible, p. ej. "Casa Occidente | Barbería & Bar" */
  name: string;
  stats: [string, string, string]; // publicaciones, seguidores, seguidos
  bio: string[];
  /** texto del link de la bio */
  link: string;
  chips?: string[];
  highlights?: {image: string; label: string}[];
  /** 9 fotos del feed (3:4) */
  grid: string[];
  time?: string;
  subtitle?: string;
};

const LINK_TAP = 85;

const profileLayout = (bioLines: number) => {
  const linkTop = 220 + bioLines * 18.5 + 3;
  const chips = linkTop + 29;
  const buttons = chips + 48;
  const highlights = buttons + 52;
  const tabs = highlights + 98;
  return {linkTop, chips, buttons, highlights, tabs, grid: tabs + 44};
};

const ProfileScreen: React.FC<{d: InstagramProfileData}> = ({d}) => {
  const f = useCurrentFrame();
  const {colors} = useBrand();
  const L = profileLayout(d.bio.length);
  const scrollX = -prog(f, 35, 55) * 36;
  const linkTap = f >= LINK_TAP;
  const btn = (label: React.ReactNode, w: number | string, blue?: boolean) => (
    <div style={{width: w, flex: typeof w === 'string' ? 1 : undefined, height: 33, borderRadius: 9, background: blue ? '#4a5df9' : '#25292e', color: '#fff', fontWeight: 600, fontSize: 14.5, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{label}</div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, background: DARK, color: '#f5f5f5'}}>
      <StatusBar time={d.time ?? '7:24'} dark />
      <div style={{position: 'absolute', top: 60, left: 12, right: 14, height: 46, display: 'flex', alignItems: 'center', gap: 22}}>
        <Icon d={I.back} size={26} />
        <div style={{fontWeight: 700, fontSize: 21, flex: 1, letterSpacing: -0.3}}>{d.username}</div>
        <Icon d={I.dots} size={26} sw={3} />
      </div>
      <div style={{position: 'absolute', top: 120, left: 14}}>
        <BrandAvatar size={86} />
      </div>
      <div style={{position: 'absolute', top: 126, left: 122, right: 10}}>
        <div style={{fontWeight: 600, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{d.name}</div>
        <div style={{display: 'flex', gap: 20, marginTop: 10}}>
          {d.stats.map((n, i) => (
            <div key={i} style={{lineHeight: 1.15}}>
              <div style={{fontWeight: 700, fontSize: 17}}>{n}</div>
              <div style={{fontSize: 13.5}}>{['publicaciones', 'seguidores', 'seguidos'][i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', top: 220, left: 16, right: 16, fontSize: 14.5, lineHeight: '18.5px'}}>
        {d.bio.map((l, i) => (
          <div key={i} style={{whiteSpace: 'nowrap', overflow: 'hidden'}}>
            {l}
            {i === d.bio.length - 1 && <span style={{color: '#a8a8a8'}}> … más</span>}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: L.linkTop, left: 11, display: 'inline-flex', alignItems: 'center', gap: 5, color: '#a3b4ff', fontSize: 14.5, padding: '1px 5px', borderRadius: 6, background: linkTap ? 'rgba(163,180,255,.2)' : 'transparent'}}>
        <Icon d={I.link} color="#a3b4ff" size={16} sw={2.2} /> {d.link}
      </div>
      {d.chips && (
        <div style={{position: 'absolute', top: L.chips, left: 16, display: 'flex', gap: 8}}>
          {d.chips.map((t) => (
            <div key={t} style={{height: 30, padding: '0 12px', borderRadius: 15, border: '1px solid #363a3f', display: 'flex', alignItems: 'center', fontSize: 13.5, fontWeight: 600}}>{t}</div>
          ))}
        </div>
      )}
      <div style={{position: 'absolute', top: L.buttons, left: 16, right: 16, display: 'flex', gap: 6}}>
        {btn('Seguir', '1', true)}
        {btn('Mensaje', '1')}
        {btn('Llamar', '1')}
        {btn(<Icon d={I.addUser} size={18} sw={2} />, 34)}
      </div>
      <div style={{position: 'absolute', top: L.highlights, left: 0, right: 0, height: 92, overflow: 'hidden'}}>
        <div style={{display: 'flex', gap: 12, paddingLeft: 14, transform: `translateX(${scrollX}px)`}}>
          {(d.highlights ?? []).map((h) => (
            <div key={h.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 70}}>
              <div style={{width: 64, height: 64, borderRadius: '50%', border: '2px solid #4a5160', padding: 3, boxSizing: 'border-box'}}>
                <div style={{width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden'}}>
                  <Img src={staticFile(h.image)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.14)'}} />
                </div>
              </div>
              <div style={{fontSize: 12, whiteSpace: 'nowrap'}}>{h.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', top: L.tabs, left: 0, right: 0, height: 42, display: 'flex', borderBottom: '1px solid #25292e'}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{flex: 1, borderBottom: i === 0 ? '1.5px solid #fff' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 20, height: 20, border: '2px solid ' + (i === 0 ? '#fff' : '#777'), borderRadius: 4}} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: L.grid, left: 0, right: 0, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2}}>
        {d.grid.slice(0, 9).map((img, i) => (
          <div key={i} style={{height: 172, backgroundImage: `url(${staticFile(img)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: colors.dark2}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, background: DARK, borderTop: '1px solid #25292e', display: 'flex', justifyContent: 'space-around', paddingTop: 8}}>
        {[I.home, I.search, I.reels, I.bag].map((p, i) => (
          <Icon key={i} d={p} size={26} />
        ))}
        <div style={{width: 26, height: 26, borderRadius: '50%', background: '#555'}} />
      </div>
      <HomeIndicator dark />
    </div>
  );
};

/** Perfil de Instagram: desliza las historias destacadas y toca el link de la bio. 4 s. */
export const instagramProfile = (d: InstagramProfileData): PhoneScene => {
  const L = profileLayout(d.bio.length);
  return {
    id: 'ig-profile',
    duration: 120,
    enter: 'left',
    Component: () => <ProfileScreen d={d} />,
    taps: [
      {f: 35, x: 300, y: L.highlights + 32, to: {x: 250, y: L.highlights + 32, d: 18}},
      {f: LINK_TAP, x: 140, y: L.linkTop + 10},
    ],
    subtitles: [{at: 0, text: d.subtitle ?? 'Entras a su perfil.'}],
  };
};
