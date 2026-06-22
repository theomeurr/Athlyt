// athlyt-data.jsx — design tokens, seed data, helpers, icons, small primitives
// Exported to window for the other babel scripts.

/* ----------------------------------------------------------------- Theme */
function makeTheme(dark) {
  if (dark) {
    return {
      dark: true,
      bg: '#0B0D11',
      bg2: '#101319',
      surface: '#161A21',
      surface2: '#1E232C',
      fill: '#222834',
      ink: '#F4F6F9',
      sub: '#9AA3B0',
      faint: '#69727F',
      line: 'rgba(255,255,255,0.09)',
      lineStrong: 'rgba(255,255,255,0.14)',
      accent: '#3B8BFF',
      accentInk: '#FFFFFF',
      accentSoft: 'rgba(59,139,255,0.16)',
      energy1: '#36E0FF',
      energy2: '#3B8BFF',
      good: '#34D399',
      shadow: '0 8px 30px rgba(0,0,0,0.45)',
      shadowSm: '0 1px 2px rgba(0,0,0,0.4)',
      barBg: 'rgba(16,19,25,0.72)',
    };
  }
  return {
    dark: false,
    bg: '#F3F4F7',
    bg2: '#ECEEF2',
    surface: '#FFFFFF',
    surface2: '#FFFFFF',
    fill: '#EEF0F4',
    ink: '#0C1019',
    sub: '#6B7480',
    faint: '#A4ABB6',
    line: 'rgba(12,16,25,0.07)',
    lineStrong: 'rgba(12,16,25,0.12)',
    accent: '#1F6BFF',
    accentInk: '#FFFFFF',
    accentSoft: 'rgba(31,107,255,0.10)',
    energy1: '#22C9F0',
    energy2: '#1F6BFF',
    good: '#10B981',
    shadow: '0 14px 34px rgba(17,24,39,0.10)',
    shadowSm: '0 1px 2px rgba(17,24,39,0.05)',
    barBg: 'rgba(243,244,247,0.80)',
  };
}

const ThemeCtx = React.createContext(makeTheme(false));
const useTheme = () => React.useContext(ThemeCtx);

/* ------------------------------------------------------------- Categories */
const CATEGORIES = [
  { id: 'force',     name: 'Force',      color: '#2F6BFF' },
  { id: 'vitesse',   name: 'Vitesse',    color: '#06B6D4' },
  { id: 'plio',      name: 'Pliométrie', color: '#FF5A5F' },
  { id: 'endurance', name: 'Endurance',  color: '#10B981' },
  { id: 'gainage',   name: 'Gainage',    color: '#F59E0B' },
  { id: 'mobilite',  name: 'Mobilité',   color: '#8B5CF6' },
];
const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

/* ------------------------------------------------------------- Seed data */
let _id = 0;
// ID uniques dans le temps : sinon, après un rechargement, le compteur repart de
// 0 et un nouvel élément réutilise un ID déjà présent (collision → bugs d'édition).
const uid = () => 'x' + Date.now().toString(36) + (++_id).toString(36);

function seedData() {
  // Démarrage vierge : aucune donnée de test (ni exercices, ni séances, ni historique).
  _id = 0;
  return { exercises: [], sessions: [], history: [] };
}

/* ----------------------------------------------------------------- Helpers */
function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtMin(sec) {
  const m = Math.round(sec / 60);
  return `${m} min`;
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
function fmtDateShort(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
function totalSets(s) { return s.blocks.reduce((n, b) => n + (Number(b.sets) || 0), 0); }
function estMinutes(s) {
  // rough: ~45s per set work + rest
  const sets = totalSets(s);
  const rest = s.blocks.reduce((n, b) => n + (Number(b.sets) || 0) * (Number(b.rest) || 0), 0);
  return Math.max(8, Math.round((sets * 45 + rest) / 60));
}

/* ----------------------------------------------------------------- Audio */
let _ac;
function beep(freq = 880, dur = 0.13, vol = 0.2) {
  try {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === 'suspended') _ac.resume();
    const o = _ac.createOscillator(), g = _ac.createGain();
    o.type = 'sine'; o.frequency.value = freq; o.connect(g); g.connect(_ac.destination);
    const t = _ac.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch (e) {}
}
const sTick = () => beep(660, 0.06, 0.13);
const sWork = () => { beep(990, 0.16); setTimeout(() => beep(1320, 0.18), 110); };
const sRest = () => beep(520, 0.18);
const sDone = () => { beep(880, 0.16); setTimeout(() => beep(1175, 0.16), 150); setTimeout(() => beep(1568, 0.3), 300); };

/* ----------------------------------------------------------------- Icons */
function Icon({ name, size = 24, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  const p = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path {...p} d="M4 11.5 12 5l8 6.5"/><path {...p} d="M6 10.5V19h12v-8.5"/></>,
    'home-fill': <path d="M4 11.2 12 4.8l8 6.4V20a1 1 0 0 1-1 1h-4v-5.5h-6V21H5a1 1 0 0 1-1-1z" fill={stroke} stroke="none"/>,
    dumbbell: <><path {...p} d="M6.5 9v6M17.5 9v6M4 10.5v3M20 10.5v3M6.5 12h11"/></>,
    'dumbbell-fill': <g fill={stroke} stroke="none"><rect x="3" y="9.5" width="2.6" height="5" rx="1"/><rect x="5.6" y="8" width="2.4" height="8" rx="1"/><rect x="16" y="8" width="2.4" height="8" rx="1"/><rect x="18.4" y="9.5" width="2.6" height="5" rx="1"/><rect x="7.5" y="11" width="9" height="2" rx="1"/></g>,
    list: <><path {...p} d="M8 7h11M8 12h11M8 17h11"/><circle cx="4.2" cy="7" r="1.1" fill={stroke} stroke="none"/><circle cx="4.2" cy="12" r="1.1" fill={stroke} stroke="none"/><circle cx="4.2" cy="17" r="1.1" fill={stroke} stroke="none"/></>,
    timer: <><circle {...p} cx="12" cy="13.5" r="7.5"/><path {...p} d="M12 13.5V9.5M9.5 3.5h5"/></>,
    'timer-fill': <g><circle cx="12" cy="13.5" r="7.5" fill={stroke} stroke="none"/><path d="M12 13.5V9.5" stroke={fill || '#fff'} strokeWidth="2" strokeLinecap="round"/><path d="M9.5 3.5h5" stroke={stroke} strokeWidth="2" strokeLinecap="round"/></g>,
    chart: <><path {...p} d="M5 19V5"/><path {...p} d="M5 19h14"/><rect x="8" y="11" width="2.6" height="5" rx="0.6" fill={stroke} stroke="none"/><rect x="12.7" y="8" width="2.6" height="8" rx="0.6" fill={stroke} stroke="none"/><rect x="17.4" y="13" width="0" height="0"/></>,
    'chart-fill': <g fill={stroke} stroke="none"><rect x="4" y="13" width="3.4" height="7" rx="1"/><rect x="10.3" y="8" width="3.4" height="12" rx="1"/><rect x="16.6" y="4" width="3.4" height="16" rx="1"/></g>,
    play: <path d="M8 5.5v13l11-6.5z" fill={stroke} stroke="none"/>,
    'play-o': <path {...p} d="M8 5.5v13l11-6.5z"/>,
    plus: <><path {...p} d="M12 5v14M5 12h14"/></>,
    check: <path {...p} d="M5 12.5 10 17.5 19 7"/>,
    chevron: <path {...p} d="M9 5l7 7-7 7"/>,
    'chevron-l': <path {...p} d="M15 5l-7 7 7 7"/>,
    close: <path {...p} d="M6 6l12 12M18 6 6 18"/>,
    search: <><circle {...p} cx="11" cy="11" r="6.5"/><path {...p} d="M16 16l4 4"/></>,
    bolt: <path d="M13 2 4 13.5h6L9 22l9-12h-6z" fill={stroke} stroke="none"/>,
    flame: <path {...p} d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.8-2.5C9.5 9.5 11 8 12 3z"/>,
    bell: <><path {...p} d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path {...p} d="M10 20a2 2 0 0 0 4 0"/></>,
    target: <><circle {...p} cx="12" cy="12" r="8"/><circle {...p} cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.4" fill={stroke} stroke="none"/></>,
    calendar: <><rect {...p} x="4" y="5.5" width="16" height="15" rx="3"/><path {...p} d="M4 10h16M8 3.5v4M16 3.5v4"/></>,
    clock: <><circle {...p} cx="12" cy="12" r="8"/><path {...p} d="M12 7.5V12l3 2"/></>,
    trophy: <><path {...p} d="M7 4h10v4a5 5 0 0 1-10 0z"/><path {...p} d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M9 18h6M10 14.5h4l.5 3.5h-5z"/></>,
    arrow: <><path {...p} d="M5 12h14M13 6l6 6-6 6"/></>,
    settings: <><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.3-1-2 3.4L4.6 11a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 1.7-1l2.3 1 2-3.4z"/></>,
    minus: <path {...p} d="M5 12h14"/>,
    skip: <><path d="M6 5.5v13l9-6.5z" fill={stroke} stroke="none"/><path {...p} d="M17 5.5v13"/></>,
    pause: <><rect x="7" y="5.5" width="3.2" height="13" rx="1.2" fill={stroke} stroke="none"/><rect x="13.8" y="5.5" width="3.2" height="13" rx="1.2" fill={stroke} stroke="none"/></>,
    pencil: <><path {...p} d="M4 20l4-1 10-10-3-3L5 16z"/><path {...p} d="M13.5 6.5l3 3"/></>,
    user: <><circle {...p} cx="12" cy="8.5" r="3.8"/><path {...p} d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name] || null}
    </svg>
  );
}

/* ----------------------------------------------- Progress ring primitive */
function Ring({ size = 84, stroke = 9, value = 0, color, track, children, gradient }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, value)));
  const gid = React.useMemo(() => 'g' + Math.random().toString(36).slice(2, 8), []);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {gradient && (
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={gradient[0]} />
              <stop offset="1" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={gradient ? `url(#${gid})` : color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  makeTheme, ThemeCtx, useTheme, CATEGORIES, catById, seedData, uid,
  fmtClock, fmtMin, fmtDate, fmtDateShort, totalSets, estMinutes,
  sTick, sWork, sRest, sDone, Icon, Ring,
});
