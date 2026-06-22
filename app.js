// ⚠️ FICHIER GÉNÉRÉ par build.js — ne pas éditer à la main.
// Source : src/*.jsx — régénérer avec `npm run build`.
'use strict';

/* ======================= 01-data.jsx ======================= */
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
      barBg: 'rgba(16,19,25,0.72)'
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
    barBg: 'rgba(243,244,247,0.80)'
  };
}
const ThemeCtx = React.createContext(makeTheme(false));
const useTheme = () => React.useContext(ThemeCtx);

/* ------------------------------------------------------------- Categories */
const CATEGORIES = [{
  id: 'force',
  name: 'Force',
  color: '#2F6BFF'
}, {
  id: 'vitesse',
  name: 'Vitesse',
  color: '#06B6D4'
}, {
  id: 'plio',
  name: 'Pliométrie',
  color: '#FF5A5F'
}, {
  id: 'endurance',
  name: 'Endurance',
  color: '#10B981'
}, {
  id: 'gainage',
  name: 'Gainage',
  color: '#F59E0B'
}, {
  id: 'mobilite',
  name: 'Mobilité',
  color: '#8B5CF6'
}];
const catById = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

/* ------------------------------------------------------------- Seed data */
let _id = 0;
// ID uniques dans le temps : sinon, après un rechargement, le compteur repart de
// 0 et un nouvel élément réutilise un ID déjà présent (collision → bugs d'édition).
const uid = () => 'x' + Date.now().toString(36) + (++_id).toString(36);
function seedData() {
  // Démarrage vierge : aucune donnée de test (ni exercices, ni séances, ni historique).
  _id = 0;
  return {
    exercises: [],
    sessions: [],
    history: []
  };
}

/* ----------------------------------------------------------------- Helpers */
function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60),
    s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtMin(sec) {
  const m = Math.round(sec / 60);
  return `${m} min`;
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}
function fmtDateShort(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}
function totalSets(s) {
  return s.blocks.reduce((n, b) => n + (Number(b.sets) || 0), 0);
}
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
    const o = _ac.createOscillator(),
      g = _ac.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(g);
    g.connect(_ac.destination);
    const t = _ac.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch (e) {}
}
const sTick = () => beep(660, 0.06, 0.13);
const sWork = () => {
  beep(990, 0.16);
  setTimeout(() => beep(1320, 0.18), 110);
};
const sRest = () => beep(520, 0.18);
const sDone = () => {
  beep(880, 0.16);
  setTimeout(() => beep(1175, 0.16), 150);
  setTimeout(() => beep(1568, 0.3), 300);
};

/* ----------------------------------------------------------------- Icons */
function Icon({
  name,
  size = 24,
  stroke = 'currentColor',
  sw = 1.8,
  fill = 'none'
}) {
  const p = {
    fill: 'none',
    stroke,
    strokeWidth: sw,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  const paths = {
    home: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M4 11.5 12 5l8 6.5"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M6 10.5V19h12v-8.5"
    }))),
    'home-fill': /*#__PURE__*/React.createElement("path", {
      d: "M4 11.2 12 4.8l8 6.4V20a1 1 0 0 1-1 1h-4v-5.5h-6V21H5a1 1 0 0 1-1-1z",
      fill: stroke,
      stroke: "none"
    }),
    dumbbell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M6.5 9v6M17.5 9v6M4 10.5v3M20 10.5v3M6.5 12h11"
    }))),
    'dumbbell-fill': /*#__PURE__*/React.createElement("g", {
      fill: stroke,
      stroke: "none"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "9.5",
      width: "2.6",
      height: "5",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "5.6",
      y: "8",
      width: "2.4",
      height: "8",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "16",
      y: "8",
      width: "2.4",
      height: "8",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "18.4",
      y: "9.5",
      width: "2.6",
      height: "5",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "7.5",
      y: "11",
      width: "9",
      height: "2",
      rx: "1"
    })),
    list: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M8 7h11M8 12h11M8 17h11"
    })), /*#__PURE__*/React.createElement("circle", {
      cx: "4.2",
      cy: "7",
      r: "1.1",
      fill: stroke,
      stroke: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "4.2",
      cy: "12",
      r: "1.1",
      fill: stroke,
      stroke: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "4.2",
      cy: "17",
      r: "1.1",
      fill: stroke,
      stroke: "none"
    })),
    timer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", _extends({}, p, {
      cx: "12",
      cy: "13.5",
      r: "7.5"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M12 13.5V9.5M9.5 3.5h5"
    }))),
    'timer-fill': /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "13.5",
      r: "7.5",
      fill: stroke,
      stroke: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 13.5V9.5",
      stroke: fill || '#fff',
      strokeWidth: "2",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9.5 3.5h5",
      stroke: stroke,
      strokeWidth: "2",
      strokeLinecap: "round"
    })),
    chart: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M5 19V5"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M5 19h14"
    })), /*#__PURE__*/React.createElement("rect", {
      x: "8",
      y: "11",
      width: "2.6",
      height: "5",
      rx: "0.6",
      fill: stroke,
      stroke: "none"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "12.7",
      y: "8",
      width: "2.6",
      height: "8",
      rx: "0.6",
      fill: stroke,
      stroke: "none"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "17.4",
      y: "13",
      width: "0",
      height: "0"
    })),
    'chart-fill': /*#__PURE__*/React.createElement("g", {
      fill: stroke,
      stroke: "none"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "4",
      y: "13",
      width: "3.4",
      height: "7",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "10.3",
      y: "8",
      width: "3.4",
      height: "12",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "16.6",
      y: "4",
      width: "3.4",
      height: "16",
      rx: "1"
    })),
    play: /*#__PURE__*/React.createElement("path", {
      d: "M8 5.5v13l11-6.5z",
      fill: stroke,
      stroke: "none"
    }),
    'play-o': /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M8 5.5v13l11-6.5z"
    })),
    plus: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M12 5v14M5 12h14"
    }))),
    check: /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M5 12.5 10 17.5 19 7"
    })),
    chevron: /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M9 5l7 7-7 7"
    })),
    'chevron-l': /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M15 5l-7 7 7 7"
    })),
    close: /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M6 6l12 12M18 6 6 18"
    })),
    search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", _extends({}, p, {
      cx: "11",
      cy: "11",
      r: "6.5"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M16 16l4 4"
    }))),
    bolt: /*#__PURE__*/React.createElement("path", {
      d: "M13 2 4 13.5h6L9 22l9-12h-6z",
      fill: stroke,
      stroke: "none"
    }),
    flame: /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.8-2.5C9.5 9.5 11 8 12 3z"
    })),
    bell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M10 20a2 2 0 0 0 4 0"
    }))),
    target: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", _extends({}, p, {
      cx: "12",
      cy: "12",
      r: "8"
    })), /*#__PURE__*/React.createElement("circle", _extends({}, p, {
      cx: "12",
      cy: "12",
      r: "4"
    })), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "1.4",
      fill: stroke,
      stroke: "none"
    })),
    calendar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", _extends({}, p, {
      x: "4",
      y: "5.5",
      width: "16",
      height: "15",
      rx: "3"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M4 10h16M8 3.5v4M16 3.5v4"
    }))),
    clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", _extends({}, p, {
      cx: "12",
      cy: "12",
      r: "8"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M12 7.5V12l3 2"
    }))),
    trophy: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M7 4h10v4a5 5 0 0 1-10 0z"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M9 18h6M10 14.5h4l.5 3.5h-5z"
    }))),
    arrow: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M5 12h14M13 6l6 6-6 6"
    }))),
    settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", _extends({}, p, {
      cx: "12",
      cy: "12",
      r: "3"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.3-1-2 3.4L4.6 11a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 1.7-1l2.3 1 2-3.4z"
    }))),
    minus: /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M5 12h14"
    })),
    skip: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M6 5.5v13l9-6.5z",
      fill: stroke,
      stroke: "none"
    }), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M17 5.5v13"
    }))),
    pause: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "7",
      y: "5.5",
      width: "3.2",
      height: "13",
      rx: "1.2",
      fill: stroke,
      stroke: "none"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "13.8",
      y: "5.5",
      width: "3.2",
      height: "13",
      rx: "1.2",
      fill: stroke,
      stroke: "none"
    })),
    pencil: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M4 20l4-1 10-10-3-3L5 16z"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M13.5 6.5l3 3"
    }))),
    user: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", _extends({}, p, {
      cx: "12",
      cy: "8.5",
      r: "3.8"
    })), /*#__PURE__*/React.createElement("path", _extends({}, p, {
      d: "M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"
    })))
  };
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    style: {
      display: 'block',
      flexShrink: 0
    }
  }, paths[name] || null);
}

/* ----------------------------------------------- Progress ring primitive */
function Ring({
  size = 84,
  stroke = 9,
  value = 0,
  color,
  track,
  children,
  gradient
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, value)));
  const gid = React.useMemo(() => 'g' + Math.random().toString(36).slice(2, 8), []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, gradient && /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gid,
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: gradient[0]
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: gradient[1]
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: track,
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: gradient ? `url(#${gid})` : color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: off,
    style: {
      transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)'
    }
  })), children && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, children));
}
Object.assign(window, {
  makeTheme,
  ThemeCtx,
  useTheme,
  CATEGORIES,
  catById,
  seedData,
  uid,
  fmtClock,
  fmtMin,
  fmtDate,
  fmtDateShort,
  totalSets,
  estMinutes,
  sTick,
  sWork,
  sRest,
  sDone,
  Icon,
  Ring
});

/* ======================= 02-onboarding.jsx ======================= */
// athlyt-ui-kit.jsx — primitives partagées (réutilisées par l'écran Paramètres).
// L'ancien flux d'onboarding/connexion a été retiré : l'app démarre directement.

function BigBtn({
  label,
  onClick,
  disabled,
  sub,
  icon = 'arrow'
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    style: {
      width: '100%',
      border: 'none',
      cursor: disabled ? 'default' : 'pointer',
      borderRadius: 18,
      padding: sub ? '14px 20px' : '17px 20px',
      background: disabled ? t.fill : t.accent,
      color: disabled ? t.faint : t.accentInk,
      fontSize: 17,
      fontWeight: 650,
      letterSpacing: -0.2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      boxShadow: disabled ? 'none' : '0 8px 22px rgba(31,107,255,0.30)',
      transition: 'background .2s, box-shadow .2s, transform .1s'
    }
  }, /*#__PURE__*/React.createElement("span", null, label), icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    sw: 2.1,
    stroke: disabled ? t.faint : t.accentInk
  }));
}
function SelectCard({
  active,
  color,
  title,
  sub,
  onClick,
  check = true
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      border: `1.5px solid ${active ? color || t.accent : t.line}`,
      background: active ? color ? color + '14' : t.accentSoft : t.surface,
      borderRadius: 18,
      padding: '15px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'all .18s',
      boxShadow: active ? 'none' : t.shadowSm
    }
  }, color && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 4,
      background: color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 640,
      color: t.ink,
      letterSpacing: -0.2
    }
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: t.sub,
      marginTop: 2
    }
  }, sub)), check && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: 99,
      flexShrink: 0,
      border: `2px solid ${active ? color || t.accent : t.lineStrong}`,
      background: active ? color || t.accent : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, active && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14,
    sw: 3,
    stroke: "#fff"
  })));
}
function Label({
  text
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      color: t.faint,
      marginBottom: 10
    }
  }, text);
}
function Segmented({
  options,
  value,
  onChange
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: t.fill,
      borderRadius: 14,
      padding: 4,
      gap: 4
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    onClick: () => onChange(o),
    style: {
      flex: 1,
      border: 'none',
      cursor: 'pointer',
      borderRadius: 10,
      padding: '10px 4px',
      background: value === o ? t.surface : 'transparent',
      color: value === o ? t.ink : t.sub,
      fontSize: 14.5,
      fontWeight: 640,
      boxShadow: value === o ? t.shadowSm : 'none',
      transition: 'all .18s'
    }
  }, o)));
}
function FreqStepper({
  value,
  onChange
}) {
  const t = useTheme();
  const btn = (label, fn, disabled) => /*#__PURE__*/React.createElement("button", {
    onClick: fn,
    disabled: disabled,
    style: {
      width: 52,
      height: 52,
      borderRadius: 16,
      cursor: disabled ? 'default' : 'pointer',
      border: `1px solid ${t.line}`,
      background: t.surface,
      color: disabled ? t.faint : t.ink,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: label,
    size: 22,
    sw: 2.4,
    stroke: disabled ? t.faint : t.ink
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 18,
      padding: '14px 16px',
      boxShadow: t.shadowSm
    }
  }, btn('minus', () => onChange(Math.max(1, value - 1)), value <= 1), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 38,
      fontWeight: 780,
      color: t.ink,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: t.sub,
      marginTop: 4,
      fontWeight: 600
    }
  }, "jours / semaine")), btn('plus', () => onChange(Math.min(7, value + 1)), value >= 7));
}
function Switch({
  on,
  onClick
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: 52,
      height: 31,
      borderRadius: 99,
      border: 'none',
      cursor: 'pointer',
      flexShrink: 0,
      background: on ? t.accent : t.lineStrong,
      position: 'relative',
      transition: 'background .2s',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2.5,
      left: on ? 23.5 : 2.5,
      width: 26,
      height: 26,
      borderRadius: 99,
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      transition: 'left .2s cubic-bezier(.2,.8,.2,1)'
    }
  }));
}
function Wordmark({
  big
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: big ? 44 : 32,
      height: big ? 44 : 32,
      borderRadius: big ? 13 : 10,
      background: t.accent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 16px rgba(31,107,255,0.35)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bolt",
    size: big ? 26 : 19,
    stroke: "#fff"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: big ? 27 : 21,
      fontWeight: 800,
      letterSpacing: -0.8,
      color: t.ink
    }
  }, "Athlyt"));
}
Object.assign(window, {
  Switch,
  Segmented,
  Label,
  FreqStepper,
  SelectCard,
  BigBtn,
  Wordmark
});

/* ======================= 03-overlays.jsx ======================= */
// athlyt-overlays.jsx — full-screen guided session + interval timer

/* ===================================================================== */
/* Guided session                                                        */
/* ===================================================================== */
function GuidedSession({
  session,
  exercises,
  onClose,
  onFinish
}) {
  const t = useTheme();
  const exById = id => exercises.find(e => e.id === id);
  const [idx, setIdx] = React.useState(0);
  const [done, setDone] = React.useState(() => session.blocks.map(b => Array(Number(b.sets) || 1).fill(false)));
  const [rest, setRest] = React.useState(0);
  const [restMax, setRestMax] = React.useState(0);
  const [showFinish, setShowFinish] = React.useState(false);
  const [rpe, setRpe] = React.useState(7);
  const startedAt = React.useRef(Date.now());
  const restRef = React.useRef(null);
  const block = session.blocks[idx];
  const ex = exById(block.exerciseId);
  const cat = catById(ex?.category);
  const nSets = Number(block.sets) || 1;
  const total = session.blocks.reduce((n, b) => n + (Number(b.sets) || 1), 0);
  const doneCount = done.reduce((n, arr) => n + arr.filter(Boolean).length, 0);
  const isLast = idx === session.blocks.length - 1;
  const stopRest = () => {
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
    setRest(0);
  };
  React.useEffect(() => () => stopRest(), []);
  const startRest = sec => {
    stopRest();
    setRest(sec);
    setRestMax(sec);
    restRef.current = setInterval(() => {
      setRest(r => {
        if (r <= 1) {
          sWork();
          clearInterval(restRef.current);
          restRef.current = null;
          return 0;
        }
        if (r <= 4) sTick();
        return r - 1;
      });
    }, 1000);
  };
  const toggleSet = i => {
    setDone(prev => {
      const next = prev.map(a => a.slice());
      next[idx][i] = !next[idx][i];
      const lastSet = isLast && i === nSets - 1;
      if (next[idx][i] && Number(block.rest) > 0 && !lastSet) startRest(Number(block.rest));
      return next;
    });
  };
  const move = d => {
    stopRest();
    setIdx(v => Math.min(session.blocks.length - 1, Math.max(0, v + d)));
  };
  const finish = () => {
    stopRest();
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    onFinish({
      id: uid(),
      name: session.name,
      date: new Date().toISOString(),
      durationSec,
      totalSets: total,
      doneSets: doneCount,
      rpe
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 80,
      background: t.bg,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: iconBtn(t)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 20,
    sw: 2.2,
    stroke: t.ink
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: t.sub
    }
  }, session.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: t.faint
    }
  }, "Exercice ", idx + 1, " sur ", session.blocks.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: t.accent
    }
  }, doneCount, "/", total)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 99,
      background: t.fill,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${doneCount / total * 100}%`,
      borderRadius: 99,
      background: `linear-gradient(90deg, ${t.energy1}, ${t.energy2})`,
      transition: 'width .4s'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '18px 20px 20px',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      background: cat.color + '18',
      color: cat.color,
      borderRadius: 99,
      padding: '6px 12px',
      fontSize: 13,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: cat.color
    }
  }), " ", cat.name), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '14px 0 0',
      fontSize: 32,
      fontWeight: 780,
      letterSpacing: -0.8,
      color: t.ink,
      lineHeight: 1.08
    }
  }, ex ? ex.name : 'Exercice'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 17,
      color: t.sub
    }
  }, "Objectif ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: t.ink
    }
  }, block.sets, " \xD7 ", block.reps || '—'), block.load && block.load !== 'PdC' ? /*#__PURE__*/React.createElement("span", null, " \xB7 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: t.accent
    }
  }, block.load)) : null), ex && ex.instructions && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 14,
      padding: '13px 15px',
      fontSize: 14.5,
      lineHeight: 1.5,
      color: t.sub,
      boxShadow: t.shadowSm
    }
  }, ex.instructions), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, Array.from({
    length: nSets
  }).map((_, i) => {
    const on = done[idx][i];
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => toggleSet(i),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        textAlign: 'left',
        border: `1.5px solid ${on ? t.good : t.line}`,
        background: on ? t.dark ? 'rgba(16,185,129,0.12)' : '#ECFDF5' : t.surface,
        borderRadius: 16,
        padding: '15px 16px',
        transition: 'all .15s',
        boxShadow: t.shadowSm
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 9,
        flexShrink: 0,
        border: `2px solid ${on ? t.good : t.lineStrong}`,
        background: on ? t.good : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, on && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 17,
      sw: 3,
      stroke: "#fff"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 16,
        fontWeight: 680,
        color: t.ink
      }
    }, "S\xE9rie ", i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: t.sub,
        fontWeight: 500
      }
    }, [block.reps && `${block.reps} reps`, block.load && block.load !== 'PdC' ? block.load : null].filter(Boolean).join(' · ') || 'PdC'));
  }))), rest > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: 104,
      zIndex: 90,
      background: t.ink,
      color: t.bg,
      borderRadius: 99,
      padding: '11px 12px 11px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 12px 28px rgba(0,0,0,0.28)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.5,
      opacity: 0.7
    }
  }, "REPOS"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
      minWidth: 52,
      textAlign: 'center'
    }
  }, fmtClock(rest)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setRest(r => r + 15),
    style: {
      border: 'none',
      background: 'rgba(255,255,255,0.16)',
      color: 'inherit',
      borderRadius: 99,
      padding: '7px 11px',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "+15s"), /*#__PURE__*/React.createElement("button", {
    onClick: stopRest,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'inherit',
      opacity: 0.7,
      padding: '7px 9px',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Passer")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: '8px 20px calc(24px + env(safe-area-inset-bottom))'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => move(-1),
    disabled: idx === 0,
    style: {
      ...navBtn(t, false),
      opacity: idx === 0 ? 0.4 : 1,
      flex: '0 0 auto',
      width: 56,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-l",
    size: 22,
    sw: 2.2,
    stroke: t.ink
  })), isLast ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFinish(true),
    style: navBtn(t, true)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 20,
    sw: 2.6,
    stroke: "#fff"
  }), " Terminer") : /*#__PURE__*/React.createElement("button", {
    onClick: () => move(1),
    style: navBtn(t, true)
  }, "Suivant ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron",
    size: 20,
    sw: 2.4,
    stroke: "#fff"
  }))), showFinish && /*#__PURE__*/React.createElement(Sheet, {
    onClose: () => setShowFinish(false),
    title: "S\xE9ance termin\xE9e"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Ring, {
    size: 104,
    stroke: 11,
    value: doneCount / total,
    gradient: [t.energy1, t.energy2],
    track: t.fill
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trophy",
    size: 40,
    stroke: t.accent
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    big: true,
    label: "S\xE9ries",
    value: `${doneCount}/${total}`
  }), /*#__PURE__*/React.createElement(Stat, {
    big: true,
    label: "Dur\xE9e",
    value: fmtClock(Math.round((Date.now() - startedAt.current) / 1000))
  })), /*#__PURE__*/React.createElement(Label, {
    text: "Intensit\xE9 ressentie (RPE)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setRpe(v => Math.max(1, v - 1)),
    style: stepBtn(t)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "minus",
    size: 20,
    sw: 2.4,
    stroke: t.ink
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 34,
      fontWeight: 800,
      color: t.ink,
      fontVariantNumeric: 'tabular-nums'
    }
  }, rpe), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      color: t.faint,
      fontWeight: 600
    }
  }, " / 10")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setRpe(v => Math.min(10, v + 1)),
    style: stepBtn(t)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 20,
    sw: 2.4,
    stroke: t.ink
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: finish,
    style: navBtn(t, true)
  }, "Enregistrer la s\xE9ance")));
}

/* ===================================================================== */
/* Interval timer                                                        */
/* ===================================================================== */
const TIMER_PRESETS = {
  tabata: {
    mode: 'tabata',
    work: 20,
    rest: 10,
    rounds: 8,
    prep: 5
  },
  fractionne: {
    mode: 'fractionne',
    work: 30,
    rest: 30,
    rounds: 10,
    prep: 5
  },
  emom: {
    mode: 'emom',
    interval: 60,
    rounds: 10,
    prep: 5
  },
  amrap: {
    mode: 'amrap',
    amrap: 600,
    prep: 5
  }
};
function buildPhases(cfg) {
  const p = [];
  if (cfg.prep > 0) p.push({
    type: 'prep',
    label: 'Prêt ?',
    dur: cfg.prep
  });
  if (cfg.mode === 'tabata' || cfg.mode === 'fractionne') {
    for (let r = 1; r <= cfg.rounds; r++) {
      p.push({
        type: 'work',
        label: `Effort ${r}/${cfg.rounds}`,
        dur: cfg.work
      });
      if (cfg.rest > 0 && r < cfg.rounds) p.push({
        type: 'rest',
        label: `Repos ${r}/${cfg.rounds}`,
        dur: cfg.rest
      });
    }
  } else if (cfg.mode === 'emom') {
    for (let r = 1; r <= cfg.rounds; r++) p.push({
      type: 'work',
      label: `Minute ${r}/${cfg.rounds}`,
      dur: cfg.interval
    });
  } else if (cfg.mode === 'amrap') {
    p.push({
      type: 'work',
      label: 'AMRAP',
      dur: cfg.amrap
    });
  }
  p.push({
    type: 'done',
    label: 'Terminé',
    dur: 0
  });
  return p;
}
function IntervalTimer({
  initialMode,
  onClose
}) {
  const t = useTheme();
  const [cfg, setCfg] = React.useState(() => ({
    ...TIMER_PRESETS[initialMode || 'tabata']
  }));
  const [phase, setPhase] = React.useState('config'); // config | run
  const [phases, setPhases] = React.useState([]);
  const [pi, setPi] = React.useState(0);
  const [rem, setRem] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const tickRef = React.useRef(null);
  const phaseColor = type => ({
    work: t.accent,
    rest: t.energy1,
    prep: '#F59E0B',
    done: t.good
  })[type] || t.accent;
  React.useEffect(() => () => clearInterval(tickRef.current), []);
  const start = () => {
    const ph = buildPhases(cfg);
    setPhases(ph);
    setPi(0);
    setRem(ph[0].dur);
    setRunning(true);
    setPhase('run');
  };
  React.useEffect(() => {
    if (phase !== 'run' || !running) {
      clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setRem(r => {
        if (r <= 1) return 0;
        if (r <= 4) sTick();
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [phase, running, pi]);
  React.useEffect(() => {
    if (phase === 'run' && rem === 0 && running) {
      const nextI = pi + 1;
      if (nextI >= phases.length - 1) {
        setPi(phases.length - 1);
        setRunning(false);
        sDone();
      } else {
        const np = phases[nextI];
        if (np.type === 'work') sWork();else if (np.type === 'rest') sRest();
        setPi(nextI);
        setRem(np.dur);
      }
    }
  }, [rem]);
  const totalEst = buildPhases(cfg).reduce((n, p) => n + p.dur, 0);
  if (phase === 'config') {
    const modes = [['tabata', 'Tabata'], ['fractionne', 'Fractionné'], ['emom', 'EMOM'], ['amrap', 'AMRAP']];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: t.bg,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '60px 20px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: iconBtn(t)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close",
      size: 20,
      sw: 2.2,
      stroke: t.ink
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 19,
        fontWeight: 740,
        color: t.ink,
        letterSpacing: -0.4
      }
    }, "Minuteur")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '12px 20px 20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        flexWrap: 'wrap'
      }
    }, modes.map(([id, name]) => /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setCfg({
        ...TIMER_PRESETS[id]
      }),
      style: {
        flex: '1 0 calc(50% - 4px)',
        border: `1.5px solid ${cfg.mode === id ? t.accent : t.line}`,
        background: cfg.mode === id ? t.accent : t.surface,
        color: cfg.mode === id ? '#fff' : t.ink,
        borderRadius: 14,
        padding: '13px',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all .15s'
      }
    }, name))), (cfg.mode === 'tabata' || cfg.mode === 'fractionne') && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BigStepper, {
      label: "Effort",
      unit: "sec",
      value: cfg.work,
      step: 5,
      min: 5,
      max: 600,
      onChange: v => setCfg({
        ...cfg,
        work: v
      })
    }), /*#__PURE__*/React.createElement(BigStepper, {
      label: "Repos",
      unit: "sec",
      value: cfg.rest,
      step: 5,
      min: 0,
      max: 600,
      onChange: v => setCfg({
        ...cfg,
        rest: v
      })
    }), /*#__PURE__*/React.createElement(BigStepper, {
      label: "Rounds",
      unit: "tours",
      value: cfg.rounds,
      step: 1,
      min: 1,
      max: 50,
      onChange: v => setCfg({
        ...cfg,
        rounds: v
      })
    })), cfg.mode === 'emom' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BigStepper, {
      label: "Intervalle",
      unit: "sec",
      value: cfg.interval,
      step: 5,
      min: 10,
      max: 600,
      onChange: v => setCfg({
        ...cfg,
        interval: v
      })
    }), /*#__PURE__*/React.createElement(BigStepper, {
      label: "Rounds",
      unit: "minutes",
      value: cfg.rounds,
      step: 1,
      min: 1,
      max: 60,
      onChange: v => setCfg({
        ...cfg,
        rounds: v
      })
    })), cfg.mode === 'amrap' && /*#__PURE__*/React.createElement(BigStepper, {
      label: "Dur\xE9e totale",
      unit: "min",
      value: Math.round(cfg.amrap / 60),
      step: 1,
      min: 1,
      max: 90,
      onChange: v => setCfg({
        ...cfg,
        amrap: v * 60
      })
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 20px calc(24px + env(safe-area-inset-bottom))'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 14,
        color: t.sub,
        marginBottom: 12
      }
    }, "Dur\xE9e estim\xE9e \xB7 ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: t.ink
      }
    }, fmtClock(totalEst))), /*#__PURE__*/React.createElement("button", {
      onClick: start,
      style: navBtn(t, true)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "play",
      size: 20,
      stroke: "#fff"
    }), " D\xE9marrer")));
  }

  // run
  const ph = phases[pi];
  const col = phaseColor(ph.type);
  const frac = ph.dur > 0 ? rem / ph.dur : ph.type === 'done' ? 1 : 0;
  const isDone = ph.type === 'done';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 80,
      background: t.dark ? '#000' : t.ink,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.55)',
      textTransform: 'capitalize'
    }
  }, cfg.mode), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      ...iconBtn(t),
      background: 'rgba(255,255,255,0.12)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 20,
    sw: 2.2,
    stroke: "#fff"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      color: col
    }
  }, ph.label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 280,
      height: 280
    }
  }, /*#__PURE__*/React.createElement(Ring, {
    size: 280,
    stroke: 14,
    value: frac,
    color: col,
    track: "rgba(255,255,255,0.12)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 84,
      fontWeight: 820,
      color: '#fff',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: -3,
      lineHeight: 1
    }
  }, isDone ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 88,
    sw: 2.4,
    stroke: t.good
  }) : fmtClock(rem)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: 'rgba(255,255,255,0.5)'
    }
  }, !isDone && (ph.type === 'prep' ? 'Préparation' : cfg.mode === 'amrap' ? 'En cours' : phaseCount(phases, pi)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      padding: '8px 20px calc(28px + env(safe-area-inset-bottom))'
    }
  }, isDone ? /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      ...navBtn(t, true),
      maxWidth: 240
    }
  }, "Terminer") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setRem(0);
    },
    style: darkBtn()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "skip",
    size: 20,
    stroke: "#fff"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setRunning(r => !r),
    style: {
      ...darkBtn(),
      width: 92,
      background: col
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: running ? 'pause' : 'play',
    size: 22,
    stroke: "#fff"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: darkBtn()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 20,
    sw: 2.2,
    stroke: "#fff"
  })))));
}
function phaseCount(phases, pi) {
  const real = phases.filter(p => p.type === 'work' || p.type === 'rest');
  const upto = phases.slice(0, pi + 1).filter(p => p.type === 'work' || p.type === 'rest').length;
  return real.length ? `Phase ${upto} / ${real.length}` : '';
}
function BigStepper({
  label,
  unit,
  value,
  step,
  min,
  max,
  onChange
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Label, {
    text: label
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 18,
      padding: '12px 14px',
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(Math.max(min, value - step)),
    disabled: value <= min,
    style: {
      ...stepBtn(t),
      opacity: value <= min ? 0.4 : 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "minus",
    size: 20,
    sw: 2.4,
    stroke: t.ink
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 30,
      fontWeight: 800,
      color: t.ink,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: t.sub,
      fontWeight: 600
    }
  }, " ", unit)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(Math.min(max, value + step)),
    disabled: value >= max,
    style: {
      ...stepBtn(t),
      opacity: value >= max ? 0.4 : 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 20,
    sw: 2.4,
    stroke: t.ink
  }))));
}

/* ===================================================================== */
/* Shared bits                                                           */
/* ===================================================================== */
function Sheet({
  title,
  children,
  onClose
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    },
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'flex-end',
      animation: 'athFade .2s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: t.surface,
      borderRadius: '26px 26px 0 0',
      padding: '10px 22px calc(26px + env(safe-area-inset-bottom))',
      animation: 'athUp .28s cubic-bezier(.2,.85,.25,1)',
      maxHeight: '88%',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 5,
      borderRadius: 99,
      background: t.lineStrong,
      margin: '0 auto 16px'
    }
  }), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px',
      fontSize: 21,
      fontWeight: 760,
      color: t.ink,
      letterSpacing: -0.4
    }
  }, title), children));
}
function Stat({
  label,
  value,
  big
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: t.fill,
      borderRadius: 14,
      padding: big ? '14px 16px' : '11px 13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: big ? 26 : 20,
      fontWeight: 800,
      color: t.ink,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: -0.5
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: t.sub,
      fontWeight: 600,
      marginTop: 2
    }
  }, label));
}
const iconBtn = t => ({
  width: 38,
  height: 38,
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  background: t.surface,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: t.shadowSm,
  flexShrink: 0
});
const stepBtn = t => ({
  width: 50,
  height: 50,
  borderRadius: 14,
  border: `1px solid ${t.line}`,
  cursor: 'pointer',
  background: t.dark ? t.fill : t.bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
});
const navBtn = (t, primary) => ({
  flex: 1,
  border: 'none',
  cursor: 'pointer',
  borderRadius: 16,
  padding: '16px',
  background: primary ? t.accent : t.surface,
  color: primary ? '#fff' : t.ink,
  fontSize: 16.5,
  fontWeight: 680,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: primary ? '0 8px 20px rgba(31,107,255,0.28)' : t.shadowSm
});
const darkBtn = () => ({
  width: 64,
  height: 64,
  borderRadius: 99,
  border: 'none',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.14)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
});
Object.assign(window, {
  GuidedSession,
  IntervalTimer,
  Sheet,
  Stat,
  iconBtn,
  stepBtn,
  navBtn,
  darkBtn
});

/* ======================= 04-editors.jsx ======================= */
// athlyt-editors.jsx — exercise editor, session editor, exercise picker

function Field({
  label,
  children
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      color: t.faint,
      marginBottom: 7
    }
  }, label), children);
}
function inputStyle(t) {
  return {
    width: '100%',
    boxSizing: 'border-box',
    border: `1px solid ${t.line}`,
    background: t.dark ? t.fill : t.bg,
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 16,
    color: t.ink,
    fontFamily: 'inherit',
    outline: 'none'
  };
}

/* --------------------------------------------------- Exercise editor */
function ExerciseEditor({
  exercise,
  onSave,
  onDelete,
  onClose
}) {
  const t = useTheme();
  const editing = !!exercise;
  const [name, setName] = React.useState(exercise?.name || '');
  const [cat, setCat] = React.useState(exercise?.category || 'force');
  const [muscles, setMuscles] = React.useState(exercise?.muscles || '');
  const [instr, setInstr] = React.useState(exercise?.instructions || '');
  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: exercise?.id || uid(),
      name: name.trim(),
      category: cat,
      muscles: muscles.trim(),
      instructions: instr.trim()
    });
    onClose();
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    title: editing ? 'Modifier l’exercice' : 'Nouvel exercice',
    onClose: onClose
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nom"
  }, /*#__PURE__*/React.createElement("input", {
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Ex : Squat bulgare",
    style: inputStyle(t),
    autoFocus: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Cat\xE9gorie"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, CATEGORIES.map(c => {
    const on = cat === c.id;
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: () => setCat(c.id),
      style: {
        cursor: 'pointer',
        border: `1.5px solid ${on ? c.color : t.line}`,
        background: on ? c.color : t.surface,
        color: on ? '#fff' : t.sub,
        borderRadius: 99,
        padding: '8px 14px',
        fontSize: 13.5,
        fontWeight: 680,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 99,
        background: on ? '#fff' : c.color
      }
    }), " ", c.name);
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Muscles cibl\xE9s"
  }, /*#__PURE__*/React.createElement("input", {
    value: muscles,
    onChange: e => setMuscles(e.target.value),
    placeholder: "Quadriceps \xB7 Fessiers",
    style: inputStyle(t)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Consignes"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: instr,
    onChange: e => setInstr(e.target.value),
    placeholder: "Consignes d\u2019ex\xE9cution (optionnel)",
    style: {
      ...inputStyle(t),
      minHeight: 80,
      resize: 'vertical',
      lineHeight: 1.45
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 8
    }
  }, editing && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onDelete(exercise.id);
      onClose();
    },
    style: {
      border: 'none',
      cursor: 'pointer',
      background: t.dark ? 'rgba(255,90,95,0.14)' : '#FFF1F1',
      color: '#FF5A5F',
      borderRadius: 14,
      padding: '15px 18px',
      fontSize: 15.5,
      fontWeight: 680
    }
  }, "Supprimer"), /*#__PURE__*/React.createElement("button", {
    onClick: save,
    disabled: !name.trim(),
    style: {
      flex: 1,
      border: 'none',
      cursor: 'pointer',
      background: name.trim() ? t.accent : t.fill,
      color: name.trim() ? '#fff' : t.faint,
      borderRadius: 14,
      padding: '15px',
      fontSize: 16,
      fontWeight: 700,
      boxShadow: name.trim() ? '0 8px 20px rgba(31,107,255,0.26)' : 'none'
    }
  }, editing ? 'Enregistrer' : 'Ajouter')));
}

/* --------------------------------------------------- Exercise detail (read) */
function ExerciseDetail({
  exercise,
  onEdit,
  onClose
}) {
  const t = useTheme();
  const c = catById(exercise.category);
  return /*#__PURE__*/React.createElement(Sheet, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 15,
      background: c.color + '18',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "dumbbell",
    size: 26,
    stroke: c.color
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 780,
      color: t.ink,
      letterSpacing: -0.4
    }
  }, exercise.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: c.color,
      background: c.color + '14',
      borderRadius: 99,
      padding: '4px 10px',
      display: 'inline-block',
      marginTop: 5
    }
  }, c.name))), exercise.muscles && /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.fill,
      borderRadius: 14,
      padding: '13px 15px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: t.faint,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      marginBottom: 4
    }
  }, "Muscles"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15.5,
      color: t.ink,
      fontWeight: 600
    }
  }, exercise.muscles)), exercise.instructions && /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.fill,
      borderRadius: 14,
      padding: '13px 15px',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: t.faint,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      marginBottom: 4
    }
  }, "Ex\xE9cution"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: t.sub,
      lineHeight: 1.5
    }
  }, exercise.instructions)), /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      width: '100%',
      border: `1px solid ${t.line}`,
      cursor: 'pointer',
      background: t.surface,
      color: t.ink,
      borderRadius: 14,
      padding: '14px',
      fontSize: 15.5,
      fontWeight: 680,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 18,
    stroke: t.ink
  }), " Modifier"));
}

/* --------------------------------------------------- Exercise picker */
function ExercisePicker({
  exercises,
  onPick,
  onClose
}) {
  const t = useTheme();
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const items = exercises.filter(e => filter === 'all' || e.category === filter).filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "Ajouter un exercice",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: t.fill,
      borderRadius: 12,
      padding: '10px 13px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 18,
    stroke: t.faint
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Rechercher\u2026",
    autoFocus: true,
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 16,
      color: t.ink,
      fontFamily: 'inherit'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      overflowX: 'auto',
      marginBottom: 12,
      paddingBottom: 2,
      scrollbarWidth: 'none'
    }
  }, [{
    id: 'all',
    name: 'Tous',
    color: t.accent
  }, ...CATEGORIES].map(c => {
    const on = filter === c.id;
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: () => setFilter(c.id),
      style: {
        flexShrink: 0,
        cursor: 'pointer',
        border: `1.5px solid ${on ? c.color : t.line}`,
        background: on ? c.color : t.surface,
        color: on ? '#fff' : t.sub,
        borderRadius: 99,
        padding: '7px 13px',
        fontSize: 13,
        fontWeight: 650
      }
    }, c.name);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: '46vh',
      overflowY: 'auto',
      margin: '0 -4px',
      padding: '0 4px'
    }
  }, items.map(ex => {
    const c = catById(ex.category);
    return /*#__PURE__*/React.createElement("button", {
      key: ex.id,
      onClick: () => {
        onPick(ex);
        onClose();
      },
      style: {
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 13,
        padding: '12px 14px',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 99,
        background: c.color,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 15.5,
        fontWeight: 650,
        color: t.ink
      }
    }, ex.name), /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 19,
      sw: 2.2,
      stroke: t.accent
    }));
  })));
}

/* --------------------------------------------------- Session editor (full screen) */
function SessionEditor({
  session,
  exercises,
  onChange,
  onDelete,
  onStart,
  onClose
}) {
  const t = useTheme();
  const exById = id => exercises.find(e => e.id === id);
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(session)));
  const [picking, setPicking] = React.useState(false);
  const commit = d => {
    setDraft(d);
    onChange(d);
  };
  const setField = (k, v) => commit({
    ...draft,
    [k]: v
  });
  const setBlock = (i, k, v) => {
    const blocks = draft.blocks.map((b, j) => j === i ? {
      ...b,
      [k]: v
    } : b);
    commit({
      ...draft,
      blocks
    });
  };
  const removeBlock = i => commit({
    ...draft,
    blocks: draft.blocks.filter((_, j) => j !== i)
  });
  const moveBlock = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= draft.blocks.length) return;
    const blocks = draft.blocks.slice();
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    commit({
      ...draft,
      blocks
    });
  };
  const addBlock = ex => commit({
    ...draft,
    blocks: [...draft.blocks, {
      exerciseId: ex.id,
      sets: 3,
      reps: '10',
      load: 'PdC',
      rest: 90
    }]
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 70,
      background: t.bg,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '58px 20px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: iconBtn(t)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-l",
    size: 20,
    sw: 2.2,
    stroke: t.ink
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 17,
      fontWeight: 700,
      color: t.sub
    }
  }, "Modifier la s\xE9ance"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onDelete(draft.id);
      onClose();
    },
    style: {
      ...iconBtn(t),
      background: t.dark ? 'rgba(255,90,95,0.14)' : '#FFF1F1'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 18,
    sw: 2.2,
    stroke: "#FF5A5F"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '10px 20px 20px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: draft.name,
    onChange: e => setField('name', e.target.value),
    placeholder: "Nom de la s\xE9ance",
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: -0.6,
      color: t.ink,
      fontFamily: 'inherit',
      padding: 0
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: draft.note || '',
    onChange: e => setField('note', e.target.value),
    placeholder: "Note / objectif\u2026",
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 15.5,
      color: t.sub,
      fontFamily: 'inherit',
      padding: '6px 0 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: t.line,
      margin: '16px 0'
    }
  }), draft.blocks.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0',
      color: t.faint,
      fontSize: 14.5
    }
  }, "Aucun exercice. Ajoute-en un ci-dessous."), draft.blocks.map((b, i) => {
    const ex = exById(b.exerciseId);
    const c = catById(ex?.category);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        boxShadow: t.shadowSm
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 99,
        background: c.color,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 16,
        fontWeight: 700,
        color: t.ink
      }
    }, ex ? ex.name : 'Exercice supprimé'), /*#__PURE__*/React.createElement("button", {
      onClick: () => moveBlock(i, -1),
      disabled: i === 0,
      style: miniBtn(t, i === 0)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-l",
      size: 16,
      sw: 2.4,
      stroke: t.sub,
      style: {
        transform: 'rotate(90deg)'
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => moveBlock(i, 1),
      disabled: i === draft.blocks.length - 1,
      style: miniBtn(t, i === draft.blocks.length - 1)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron",
      size: 16,
      sw: 2.4,
      stroke: t.sub,
      style: {
        transform: 'rotate(90deg)'
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => removeBlock(i),
      style: miniBtn(t)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close",
      size: 15,
      sw: 2.4,
      stroke: "#FF5A5F"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(MiniField, {
      label: "S\xE9ries",
      value: b.sets,
      onChange: v => setBlock(i, 'sets', parseInt(v) || 0),
      num: true
    }), /*#__PURE__*/React.createElement(MiniField, {
      label: "Reps",
      value: b.reps,
      onChange: v => setBlock(i, 'reps', v)
    }), /*#__PURE__*/React.createElement(MiniField, {
      label: "Charge",
      value: b.load,
      onChange: v => setBlock(i, 'load', v)
    }), /*#__PURE__*/React.createElement(MiniField, {
      label: "Repos",
      value: b.rest,
      onChange: v => setBlock(i, 'rest', parseInt(v) || 0),
      num: true
    })));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPicking(true),
    style: {
      width: '100%',
      border: `1.5px dashed ${t.lineStrong}`,
      cursor: 'pointer',
      background: 'transparent',
      color: t.accent,
      borderRadius: 14,
      padding: '14px',
      fontSize: 15.5,
      fontWeight: 680,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 19,
    sw: 2.2,
    stroke: t.accent
  }), " Ajouter un exercice")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 20px calc(24px + env(safe-area-inset-bottom))'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (draft.blocks.length) onStart(draft.id);
    },
    disabled: !draft.blocks.length,
    style: {
      ...navBtn(t, true),
      opacity: draft.blocks.length ? 1 : 0.5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 19,
    stroke: "#fff"
  }), " D\xE9marrer la s\xE9ance")), picking && /*#__PURE__*/React.createElement(ExercisePicker, {
    exercises: exercises,
    onPick: addBlock,
    onClose: () => setPicking(false)
  }));
}
function MiniField({
  label,
  value,
  onChange,
  num
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      color: t.faint,
      textTransform: 'uppercase',
      letterSpacing: 0.2,
      marginBottom: 5,
      textAlign: 'center'
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => onChange(e.target.value),
    inputMode: num ? 'numeric' : 'text',
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: `1px solid ${t.line}`,
      background: t.dark ? t.fill : t.bg,
      borderRadius: 10,
      padding: '9px 4px',
      fontSize: 14.5,
      fontWeight: 600,
      color: t.ink,
      fontFamily: 'inherit',
      outline: 'none',
      textAlign: 'center'
    }
  }));
}
const miniBtn = (t, disabled) => ({
  width: 32,
  height: 32,
  borderRadius: 9,
  border: `1px solid ${t.line}`,
  cursor: disabled ? 'default' : 'pointer',
  background: t.dark ? t.fill : t.bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  opacity: disabled ? 0.4 : 1
});
Object.assign(window, {
  ExerciseEditor,
  ExerciseDetail,
  ExercisePicker,
  SessionEditor,
  Field,
  inputStyle
});

/* ======================= 05-screens.jsx ======================= */
// athlyt-screens.jsx — main tabs: Accueil, Séances, Exercices, Minuteur, Activité + TabBar

/* ----------------------------------------------------------- Shared bits */
function ScreenHeader({
  title,
  sub,
  trailing
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '58px 20px 6px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: t.sub,
      marginBottom: 2
    }
  }, sub), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 32,
      fontWeight: 800,
      letterSpacing: -0.9,
      color: t.ink,
      lineHeight: 1.05
    }
  }, title)), trailing);
}
function CircleBtn({
  name,
  onClick,
  accent
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: 42,
      height: 42,
      borderRadius: 99,
      border: 'none',
      cursor: 'pointer',
      background: accent ? t.accent : t.surface,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: accent ? '0 6px 16px rgba(31,107,255,0.3)' : t.shadowSm,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: name,
    size: accent ? 22 : 21,
    sw: 2.2,
    stroke: accent ? '#fff' : t.ink
  }));
}
function CatDots({
  blocks,
  size = 7
}) {
  const cols = [...new Set(blocks.map(b => catById(window.__exLookup(b.exerciseId)?.category).color))].slice(0, 5);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, cols.map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: size,
      height: size,
      borderRadius: 99,
      background: c
    }
  })));
}
function SessionCard({
  session,
  onStart,
  onOpen,
  exercises
}) {
  const t = useTheme();
  const sets = totalSets(session);
  const mins = estMinutes(session);
  const cat = catById(session.accent || window.__exLookup(session.blocks[0]?.exerciseId)?.category);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onOpen,
    style: {
      background: t.surface,
      borderRadius: 22,
      border: `1px solid ${t.line}`,
      padding: 16,
      marginBottom: 12,
      boxShadow: t.shadowSm,
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 4,
      height: '100%',
      background: cat.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 740,
      color: t.ink,
      letterSpacing: -0.3
    }
  }, session.name), session.note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: t.sub,
      marginTop: 2
    }
  }, session.note)), /*#__PURE__*/React.createElement(CatDots, {
    blocks: session.blocks
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Meta, {
    icon: "list",
    text: `${session.blocks.length} exos`
  }), /*#__PURE__*/React.createElement(Meta, {
    icon: "target",
    text: `${sets} séries`
  }), /*#__PURE__*/React.createElement(Meta, {
    icon: "clock",
    text: `~${mins} min`
  })), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onStart();
    },
    style: {
      marginTop: 14,
      width: '100%',
      border: 'none',
      cursor: 'pointer',
      borderRadius: 14,
      padding: '12px',
      background: t.accent,
      color: '#fff',
      fontSize: 15.5,
      fontWeight: 680,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      boxShadow: '0 6px 16px rgba(31,107,255,0.26)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 18,
    stroke: "#fff"
  }), " D\xE9marrer"));
}
function Meta({
  icon,
  text
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13.5,
      color: t.sub,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    stroke: t.faint
  }), " ", text);
}

/* ----------------------------------------------------------- Accueil */
function HomeScreen({
  data,
  actions,
  prefs
}) {
  const t = useTheme();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = data.history.filter(h => new Date(h.date).getTime() >= weekAgo);
  const goalWk = prefs && prefs.freq || 4;
  // série réelle : nb de jours consécutifs (jusqu'à aujourd'hui) avec ≥1 séance
  const dayKeys = new Set(data.history.map(h => new Date(h.date).toDateString()));
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    if (dayKeys.has(d.toDateString())) streak++;else if (i > 0) break; // une absence aujourd'hui (i=0) n'interrompt pas la série
  }
  const suggested = data.sessions[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: greet,
    sub: "Pr\xEAt \xE0 te d\xE9passer ?",
    trailing: /*#__PURE__*/React.createElement("button", {
      onClick: () => actions.openSettings(),
      "aria-label": "Param\xE8tres",
      style: {
        width: 42,
        height: 42,
        borderRadius: 99,
        background: t.fill,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "settings",
      size: 21,
      stroke: t.ink
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.surface,
      borderRadius: 24,
      border: `1px solid ${t.line}`,
      padding: 18,
      boxShadow: t.shadowSm,
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Ring, {
    size: 96,
    stroke: 11,
    value: thisWeek.length / goalWk,
    gradient: [t.energy1, t.energy2],
    track: t.fill
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 820,
      color: t.ink,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums'
    }
  }, thisWeek.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: t.sub,
      fontWeight: 600
    }
  }, "/ ", goalWk))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: t.accent,
      letterSpacing: 0.2
    }
  }, "CETTE SEMAINE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 740,
      color: t.ink,
      marginTop: 3,
      letterSpacing: -0.3
    }
  }, thisWeek.length >= goalWk ? 'Objectif atteint 💪' : `${goalWk - thisWeek.length} séance${goalWk - thisWeek.length > 1 ? 's' : ''} restante${goalWk - thisWeek.length > 1 ? 's' : ''}`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      fontSize: 13.5,
      color: t.sub,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame",
    size: 16,
    stroke: "#F59E0B"
  }), " ", streak > 0 ? `Série de ${streak} jour${streak > 1 ? 's' : ''}` : 'Commence ta série'))), suggested ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '22px 0 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: sectionTitle(t)
  }, "S\xE9ance du jour"), /*#__PURE__*/React.createElement("button", {
    onClick: () => actions.goTab('sessions'),
    style: linkBtn(t)
  }, "Tout voir")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 24,
      overflow: 'hidden',
      background: t.ink,
      position: 'relative',
      boxShadow: t.shadow
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(120% 120% at 85% 0%, ${t.accent}55, transparent 60%)`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      background: 'rgba(255,255,255,0.14)',
      color: '#fff',
      borderRadius: 99,
      padding: '5px 11px',
      fontSize: 12.5,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bolt",
    size: 14,
    stroke: "#fff"
  }), " RECOMMAND\xC9"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 25,
      fontWeight: 800,
      color: '#fff',
      marginTop: 14,
      letterSpacing: -0.5
    }
  }, suggested.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: 'rgba(255,255,255,0.7)',
      marginTop: 3
    }
  }, suggested.note), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(DarkMeta, {
    value: suggested.blocks.length,
    label: "exercices"
  }), /*#__PURE__*/React.createElement(DarkMeta, {
    value: totalSets(suggested),
    label: "s\xE9ries"
  }), /*#__PURE__*/React.createElement(DarkMeta, {
    value: `~${estMinutes(suggested)}'`,
    label: "dur\xE9e"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => actions.startGuided(suggested.id),
    style: {
      marginTop: 18,
      width: '100%',
      border: 'none',
      cursor: 'pointer',
      borderRadius: 14,
      padding: '14px',
      background: '#fff',
      color: t.ink,
      fontSize: 16,
      fontWeight: 720,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 19,
    stroke: t.ink
  }), " D\xE9marrer la s\xE9ance")))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      ...sectionTitle(t),
      margin: '22px 0 10px'
    }
  }, "Commencer"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 24,
      padding: '24px 20px',
      textAlign: 'center',
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 15,
      background: t.accentSoft,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "dumbbell",
    size: 26,
    stroke: t.accent
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 740,
      color: t.ink
    }
  }, "Cr\xE9e ta premi\xE8re s\xE9ance"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: t.sub,
      marginTop: 4,
      lineHeight: 1.45
    }
  }, "Ajoute des exercices, puis lance-toi en mode guid\xE9."), /*#__PURE__*/React.createElement("button", {
    onClick: () => actions.goTab('sessions'),
    style: {
      marginTop: 16,
      border: 'none',
      cursor: 'pointer',
      borderRadius: 14,
      padding: '12px 22px',
      background: t.accent,
      color: '#fff',
      fontSize: 15.5,
      fontWeight: 680,
      boxShadow: '0 6px 16px rgba(31,107,255,0.26)'
    }
  }, "Nouvelle s\xE9ance"))), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...sectionTitle(t),
      margin: '24px 0 10px'
    }
  }, "Acc\xE8s rapide"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(QuickAction, {
    icon: "timer",
    color: "#F59E0B",
    title: "Minuteur",
    sub: "Tabata, EMOM\u2026",
    onClick: () => actions.goTab('timer')
  }), /*#__PURE__*/React.createElement(QuickAction, {
    icon: "dumbbell",
    color: t.accent,
    title: "Exercices",
    sub: "Biblioth\xE8que",
    onClick: () => actions.goTab('exercises')
  })), data.history.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '24px 0 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: sectionTitle(t)
  }, "Activit\xE9 r\xE9cente"), /*#__PURE__*/React.createElement("button", {
    onClick: () => actions.goTab('activity'),
    style: linkBtn(t)
  }, "Tout voir")), data.history.slice(0, 2).map(h => /*#__PURE__*/React.createElement(HistoryRow, {
    key: h.id,
    h: h
  })))));
}
function DarkMeta({
  value,
  label
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#fff',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: -0.4
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.6)',
      fontWeight: 600
    }
  }, label));
}
function QuickAction({
  icon,
  color,
  title,
  sub,
  onClick
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      flex: 1,
      textAlign: 'left',
      cursor: 'pointer',
      border: `1px solid ${t.line}`,
      background: t.surface,
      borderRadius: 20,
      padding: 16,
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: color + '18',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22,
    stroke: color
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 720,
      color: t.ink,
      marginTop: 12,
      letterSpacing: -0.2
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: t.sub,
      marginTop: 1
    }
  }, sub));
}

/* ----------------------------------------------------------- Séances */
function SessionsScreen({
  data,
  actions,
  onNew
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "S\xE9ances",
    sub: "Tes entra\xEEnements",
    trailing: /*#__PURE__*/React.createElement(CircleBtn, {
      name: "plus",
      accent: true,
      onClick: onNew
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 0'
    }
  }, data.sessions.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: "list",
    title: "Aucune s\xE9ance",
    text: "Cr\xE9e ta premi\xE8re s\xE9ance et ajoute des exercices.",
    action: "Nouvelle s\xE9ance",
    onAction: onNew
  }) : data.sessions.map(s => /*#__PURE__*/React.createElement(SessionCard, {
    key: s.id,
    session: s,
    exercises: data.exercises,
    onStart: () => actions.startGuided(s.id),
    onOpen: () => actions.openSession(s.id)
  }))));
}

/* ----------------------------------------------------------- Exercices */
function ExercisesScreen({
  data,
  onOpenExercise,
  onNew
}) {
  const t = useTheme();
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const items = data.exercises.filter(e => filter === 'all' || e.category === filter).filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase()) || (e.muscles || '').toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Exercices",
    sub: `${data.exercises.length} mouvements`,
    trailing: /*#__PURE__*/React.createElement(CircleBtn, {
      name: "plus",
      accent: true,
      onClick: onNew
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: t.fill,
      borderRadius: 14,
      padding: '11px 14px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 19,
    stroke: t.faint
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Rechercher un exercice\u2026",
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 16,
      color: t.ink,
      fontFamily: 'inherit'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '14px 20px 4px',
      scrollbarWidth: 'none'
    }
  }, [{
    id: 'all',
    name: 'Tous',
    color: t.accent
  }, ...CATEGORIES].map(c => {
    const on = filter === c.id;
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: () => setFilter(c.id),
      style: {
        flexShrink: 0,
        cursor: 'pointer',
        border: `1.5px solid ${on ? c.color : t.line}`,
        background: on ? c.color : t.surface,
        color: on ? '#fff' : t.sub,
        borderRadius: 99,
        padding: '8px 15px',
        fontSize: 14,
        fontWeight: 680,
        transition: 'all .15s'
      }
    }, c.name);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 20px 0'
    }
  }, items.length === 0 ? data.exercises.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: "dumbbell",
    title: "Aucun exercice",
    text: "Ajoute ton premier mouvement \xE0 ta biblioth\xE8que.",
    action: "Nouvel exercice",
    onAction: onNew
  }) : /*#__PURE__*/React.createElement(Empty, {
    icon: "search",
    title: "Aucun r\xE9sultat",
    text: "Modifie ta recherche ou essaie une autre cat\xE9gorie."
  }) : items.map(ex => {
    const c = catById(ex.category);
    return /*#__PURE__*/React.createElement("button", {
      key: ex.id,
      onClick: () => onOpenExercise(ex),
      style: {
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        background: t.surface,
        border: `1px solid ${t.line}`,
        borderRadius: 16,
        padding: '14px 16px',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: t.shadowSm
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 12,
        background: c.color + '18',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "dumbbell",
      size: 22,
      stroke: c.color
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: t.ink,
        letterSpacing: -0.2
      }
    }, ex.name), ex.muscles && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: t.sub,
        marginTop: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, ex.muscles)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 700,
        color: c.color,
        background: c.color + '14',
        borderRadius: 99,
        padding: '4px 9px',
        flexShrink: 0
      }
    }, c.name));
  })));
}

/* ----------------------------------------------------------- Minuteur */
function TimerScreen({
  onOpenTimer
}) {
  const t = useTheme();
  const cards = [{
    mode: 'tabata',
    color: '#FF5A5F',
    title: 'Tabata',
    desc: '20 s effort / 10 s repos × 8'
  }, {
    mode: 'fractionne',
    color: t.accent,
    title: 'Fractionné',
    desc: 'Effort / repos personnalisables'
  }, {
    mode: 'emom',
    color: '#10B981',
    title: 'EMOM',
    desc: 'Un bloc à lancer chaque minute'
  }, {
    mode: 'amrap',
    color: '#8B5CF6',
    title: 'AMRAP',
    desc: 'Max de tours sur un temps donné'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Minuteur",
    sub: "Intervalles & conditionnement"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 0'
    }
  }, cards.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.mode,
    onClick: () => onOpenTimer(c.mode),
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 20,
      padding: 18,
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 15,
      background: c.color + '18',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "timer",
    size: 26,
    stroke: c.color
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 740,
      color: t.ink,
      letterSpacing: -0.3
    }
  }, c.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: t.sub,
      marginTop: 2
    }
  }, c.desc)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 99,
      background: c.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 18,
    stroke: "#fff"
  }))))));
}

/* ----------------------------------------------------------- Activité */
function ActivityScreen({
  data,
  t: tt
}) {
  const t = useTheme();
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = data.history.filter(h => new Date(h.date).getTime() >= weekAgo).length;
  const totalMin = Math.round(data.history.reduce((n, h) => n + h.durationSec, 0) / 60);
  const recent = data.history.slice(0, 8).slice().reverse();
  const max = Math.max(1, ...recent.map(h => h.doneSets));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Activit\xE9",
    sub: "Ta progression"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 0'
    }
  }, data.history.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: "chart",
    title: "Pas encore de s\xE9ance",
    text: "D\xE9marre une s\xE9ance et termine-la pour la retrouver ici."
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(BigStat, {
    value: data.history.length,
    label: "s\xE9ances"
  }), /*#__PURE__*/React.createElement(BigStat, {
    value: thisWeek,
    label: "cette semaine",
    accent: true
  }), /*#__PURE__*/React.createElement(BigStat, {
    value: totalMin >= 60 ? `${Math.round(totalMin / 60)}h` : `${totalMin}'`,
    label: "temps total"
  })), recent.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.surface,
      borderRadius: 22,
      border: `1px solid ${t.line}`,
      padding: 18,
      marginBottom: 18,
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: t.sub,
      marginBottom: 16
    }
  }, "S\xE9ries par s\xE9ance"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8,
      height: 110
    }
  }, recent.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: h.id,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 26,
      height: `${h.doneSets / max * 86}px`,
      borderRadius: 7,
      background: `linear-gradient(180deg, ${t.energy1}, ${t.energy2})`,
      minHeight: 6
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: t.faint,
      fontWeight: 600
    }
  }, new Date(h.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  }).replace('.', '')))))), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...sectionTitle(t),
      margin: '4px 0 10px'
    }
  }, "Historique"), data.history.map(h => /*#__PURE__*/React.createElement(HistoryRow, {
    key: h.id,
    h: h
  })))));
}
function BigStat({
  value,
  label,
  accent
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: accent ? t.accent : t.surface,
      border: `1px solid ${accent ? t.accent : t.line}`,
      borderRadius: 18,
      padding: '14px 12px',
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 25,
      fontWeight: 820,
      color: accent ? '#fff' : t.ink,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: -0.6
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: accent ? 'rgba(255,255,255,0.8)' : t.sub,
      fontWeight: 600,
      marginTop: 2
    }
  }, label));
}
function HistoryRow({
  h
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 10,
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 720,
      color: t.ink,
      letterSpacing: -0.2
    }
  }, h.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: t.sub,
      marginTop: 1,
      textTransform: 'capitalize'
    }
  }, fmtDateShort(h.date))), h.rpe && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: t.accent,
      background: t.accentSoft,
      borderRadius: 99,
      padding: '5px 10px'
    }
  }, "RPE ", h.rpe)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Meta, {
    icon: "target",
    text: `${h.doneSets}/${h.totalSets} séries`
  }), /*#__PURE__*/React.createElement(Meta, {
    icon: "clock",
    text: fmtClock(h.durationSec)
  })));
}
function Empty({
  icon,
  title,
  text,
  action,
  onAction
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '50px 24px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 20,
      background: t.fill,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 30,
    stroke: t.faint
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 740,
      color: t.ink
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: t.sub,
      marginTop: 6,
      lineHeight: 1.45
    }
  }, text), action && /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      marginTop: 18,
      border: 'none',
      cursor: 'pointer',
      borderRadius: 14,
      padding: '12px 22px',
      background: t.accent,
      color: '#fff',
      fontSize: 15.5,
      fontWeight: 680,
      boxShadow: '0 6px 16px rgba(31,107,255,0.26)'
    }
  }, action));
}

/* ----------------------------------------------------------- Tab bar */
function TabBar({
  tab,
  onTab
}) {
  const t = useTheme();
  const tabs = [{
    id: 'home',
    icon: 'home',
    label: 'Accueil'
  }, {
    id: 'sessions',
    icon: 'dumbbell',
    label: 'Séances'
  }, {
    id: 'exercises',
    icon: 'list',
    label: 'Exos'
  }, {
    id: 'timer',
    icon: 'timer',
    label: 'Minuteur'
  }, {
    id: 'activity',
    icon: 'chart',
    label: 'Activité'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
      paddingTop: 8,
      background: t.barBg,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `0.5px solid ${t.line}`,
      display: 'flex'
    }
  }, tabs.map(tb => {
    const on = tab === tb.id;
    return /*#__PURE__*/React.createElement("button", {
      key: tb.id,
      onClick: () => onTab(tb.id),
      style: {
        flex: 1,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '2px 0'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: on ? tb.icon + '-fill' : tb.icon,
      size: 25,
      stroke: on ? t.accent : t.faint,
      sw: 2
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: 600,
        color: on ? t.accent : t.faint,
        letterSpacing: -0.1
      }
    }, tb.label));
  }));
}
const sectionTitle = t => ({
  margin: 0,
  fontSize: 19,
  fontWeight: 780,
  color: t.ink,
  letterSpacing: -0.4
});
const linkBtn = t => ({
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: t.accent,
  fontSize: 14.5,
  fontWeight: 650
});
Object.assign(window, {
  HomeScreen,
  SessionsScreen,
  ExercisesScreen,
  TimerScreen,
  ActivityScreen,
  TabBar,
  ScreenHeader,
  CircleBtn,
  SessionCard,
  HistoryRow,
  Empty,
  Meta
});

/* ======================= 06-app.jsx ======================= */
// athlyt-app.jsx — application root.
// Adapté du design Claude pour une vraie PWA plein écran : le cadre « iPhone »
// de la maquette, le panneau d'édition et l'onboarding/connexion ont été retirés.
// Les réglages de l'onboarding sont désormais dans l'écran Paramètres.

const {
  useState,
  useEffect,
  useMemo
} = React;
const STORE = 'athlyt-v3'; // bump = on repart d'un état vierge (purge des données de test)
const ACCENT = '#1F6BFF'; // accent par défaut (modifiable dans Paramètres)
const DEFAULT_PREFS = {
  disciplines: ['force', 'vitesse'],
  goal: 'explosivite',
  level: 'Intermédiaire',
  freq: 4,
  reminders: false,
  days: [1, 3, 5],
  time: '18:30'
};
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16),
    g = parseInt(h.slice(2, 4), 16),
    b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function buildTheme(dark, accent) {
  const base = makeTheme(dark);
  return {
    ...base,
    accent,
    accentSoft: hexA(accent, dark ? 0.18 : 0.10),
    energy2: accent
  };
}
function loadStore() {
  try {
    const r = localStorage.getItem(STORE);
    if (r) return JSON.parse(r);
  } catch (e) {}
  return null;
}
function prefersDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    return false;
  }
}
function App() {
  const persisted = useMemo(loadStore, []);
  const [data, setData] = useState(() => persisted?.data || seedData());
  const [tab, setTab] = useState(() => persisted?.tab || 'home');
  const [dark, setDark] = useState(() => persisted?.dark ?? prefersDark());
  const [accent, setAccent] = useState(() => persisted?.accent || ACCENT);
  const [prefs, setPrefs] = useState(() => ({
    ...DEFAULT_PREFS,
    ...(persisted?.prefs || {})
  }));

  // overlays / sheets
  const [guidedId, setGuidedId] = useState(null);
  const [timerMode, setTimerMode] = useState(null);
  const [editSessionId, setEditSessionId] = useState(null);
  const [exDetail, setExDetail] = useState(null);
  const [exEdit, setExEdit] = useState(undefined); // undefined = fermé, null = nouveau, obj = édition
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const theme = useMemo(() => buildTheme(dark, accent), [dark, accent]);

  // recherche d'exercice exposée aux helpers d'écran
  useEffect(() => {
    window.__exLookup = id => data.exercises.find(e => e.id === id);
  }, [data]);
  window.__exLookup = window.__exLookup || (id => data.exercises.find(e => e.id === id));

  // persistance
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        data,
        tab,
        dark,
        accent,
        prefs
      }));
    } catch (e) {}
  }, [data, tab, dark, accent, prefs]);

  // fond + couleur de barre système alignés sur le thème
  useEffect(() => {
    document.documentElement.style.background = theme.bg2;
    document.body.style.background = theme.bg2;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.bg);
  }, [theme]);
  const toast = m => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // data ops
  const upsertExercise = ex => setData(d => {
    const exists = d.exercises.some(e => e.id === ex.id);
    return {
      ...d,
      exercises: exists ? d.exercises.map(e => e.id === ex.id ? ex : e) : [...d.exercises, ex]
    };
  });
  const deleteExercise = id => setData(d => ({
    ...d,
    exercises: d.exercises.filter(e => e.id !== id),
    sessions: d.sessions.map(s => ({
      ...s,
      blocks: s.blocks.filter(b => b.exerciseId !== id)
    }))
  }));
  const updateSession = s => setData(d => ({
    ...d,
    sessions: d.sessions.map(x => x.id === s.id ? s : x)
  }));
  const deleteSession = id => setData(d => ({
    ...d,
    sessions: d.sessions.filter(s => s.id !== id)
  }));
  const newSession = () => {
    const s = {
      id: uid(),
      name: 'Nouvelle séance',
      note: '',
      accent: 'force',
      blocks: []
    };
    setData(d => ({
      ...d,
      sessions: [...d.sessions, s]
    }));
    setEditSessionId(s.id);
  };
  const addHistory = h => setData(d => ({
    ...d,
    history: [h, ...d.history]
  }));
  const resetAll = () => {
    setData(seedData());
    setTab('home');
    toast('Données effacées');
  };
  const actions = {
    goTab: setTab,
    startGuided: id => setGuidedId(id),
    openSession: id => setEditSessionId(id),
    openTimer: mode => setTimerMode(mode),
    openSettings: () => setSettingsOpen(true)
  };
  const guidedSession = guidedId && data.sessions.find(s => s.id === guidedId);
  const editSession = editSessionId && data.sessions.find(s => s.id === editSessionId);
  let screen;
  if (tab === 'home') screen = /*#__PURE__*/React.createElement(HomeScreen, {
    data: data,
    actions: actions,
    prefs: prefs
  });else if (tab === 'sessions') screen = /*#__PURE__*/React.createElement(SessionsScreen, {
    data: data,
    actions: actions,
    onNew: newSession
  });else if (tab === 'exercises') screen = /*#__PURE__*/React.createElement(ExercisesScreen, {
    data: data,
    onOpenExercise: setExDetail,
    onNew: () => setExEdit(null)
  });else if (tab === 'timer') screen = /*#__PURE__*/React.createElement(TimerScreen, {
    onOpenTimer: actions.openTimer
  });else screen = /*#__PURE__*/React.createElement(ActivityScreen, {
    data: data
  });
  return /*#__PURE__*/React.createElement(ThemeCtx.Provider, {
    value: theme
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-shell",
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: 460,
      margin: '0 auto',
      background: theme.bg,
      color: theme.ink,
      overflow: 'hidden',
      boxShadow: theme.dark ? 'none' : '0 0 0 1px rgba(12,16,25,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    key: tab,
    style: {
      position: 'absolute',
      inset: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
      animation: 'athScreen .25s ease'
    }
  }, screen), /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    onTab: setTab
  }), guidedSession && /*#__PURE__*/React.createElement(GuidedSession, {
    session: guidedSession,
    exercises: data.exercises,
    onClose: () => setGuidedId(null),
    onFinish: h => {
      addHistory(h);
      setGuidedId(null);
      setTab('activity');
      toast('Séance enregistrée 💪');
    }
  }), timerMode && /*#__PURE__*/React.createElement(IntervalTimer, {
    initialMode: timerMode,
    onClose: () => setTimerMode(null)
  }), editSession && /*#__PURE__*/React.createElement(SessionEditor, {
    session: editSession,
    exercises: data.exercises,
    onChange: updateSession,
    onDelete: id => {
      deleteSession(id);
      setEditSessionId(null);
    },
    onStart: id => {
      setEditSessionId(null);
      setGuidedId(id);
    },
    onClose: () => setEditSessionId(null)
  }), exDetail && /*#__PURE__*/React.createElement(ExerciseDetail, {
    exercise: exDetail,
    onClose: () => setExDetail(null),
    onEdit: () => {
      const e = exDetail;
      setExDetail(null);
      setExEdit(e);
    }
  }), exEdit !== undefined && /*#__PURE__*/React.createElement(ExerciseEditor, {
    exercise: exEdit,
    onSave: upsertExercise,
    onDelete: deleteExercise,
    onClose: () => setExEdit(undefined)
  }), settingsOpen && /*#__PURE__*/React.createElement(SettingsScreen, {
    dark: dark,
    setDark: setDark,
    accent: accent,
    setAccent: setAccent,
    prefs: prefs,
    setPrefs: setPrefs,
    onReset: resetAll,
    onClose: () => setSettingsOpen(false)
  }), toastMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: 104,
      zIndex: 130,
      background: theme.ink,
      color: theme.bg,
      borderRadius: 99,
      padding: '12px 20px',
      fontSize: 14.5,
      fontWeight: 650,
      boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
      animation: 'athUp .25s ease'
    }
  }, toastMsg)));
}

/* ======================= 07-settings.jsx ======================= */
// athlyt-settings.jsx — écran Paramètres.
// Regroupe les réglages que proposait l'ancien écran de démarrage (disciplines,
// objectif, niveau, fréquence, rappels) + l'apparence (thème, accent) + données.

const ACCENT_OPTIONS = ['#1F6BFF', '#06B6D4', '#FF5A3C', '#7C5CFF', '#10B981'];
const GOAL_OPTIONS = [{
  id: 'performance',
  title: 'Performance',
  sub: 'Progresser sur mes charges & chronos'
}, {
  id: 'explosivite',
  title: 'Explosivité',
  sub: 'Gagner en vitesse et en puissance'
}, {
  id: 'endurance',
  title: 'Endurance',
  sub: 'Tenir l’effort plus longtemps'
}, {
  id: 'forme',
  title: 'Remise en forme',
  sub: 'Bouger régulièrement, me sentir bien'
}];
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
function SettingsSection({
  title,
  children
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: t.faint,
      margin: '0 4px 12px'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, children));
}
function RowCard({
  icon,
  iconColor,
  title,
  sub,
  children
}) {
  const t = useTheme();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: t.shadowSm
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 11,
      background: (iconColor || t.accent) + '18',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    stroke: iconColor || t.accent
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 640,
      color: t.ink
    }
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: t.sub,
      marginTop: 1
    }
  }, sub)), children);
}
function SettingsScreen({
  dark,
  setDark,
  accent,
  setAccent,
  prefs,
  setPrefs,
  onReset,
  onClose
}) {
  const t = useTheme();
  const [confirm, setConfirm] = React.useState(false);
  const setP = (k, v) => setPrefs(p => ({
    ...p,
    [k]: v
  }));
  const toggleIn = (key, v) => setPrefs(p => {
    const arr = p[key] || [];
    return {
      ...p,
      [key]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 110,
      background: t.bg,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '58px 20px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: iconBtn(t)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-l",
    size: 20,
    sw: 2.2,
    stroke: t.ink
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: -0.5,
      color: t.ink
    }
  }, "Param\xE8tres")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      padding: '14px 20px calc(28px + env(safe-area-inset-bottom))'
    }
  }, /*#__PURE__*/React.createElement(SettingsSection, {
    title: "Apparence"
  }, /*#__PURE__*/React.createElement(RowCard, {
    icon: "bolt",
    title: "Mode sombre",
    sub: "Suivre le syst\xE8me ou forcer"
  }, /*#__PURE__*/React.createElement(Switch, {
    on: dark,
    onClick: () => setDark(!dark)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 16,
      padding: '14px 16px',
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement(Label, {
    text: "Couleur d\u2019accent"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, ACCENT_OPTIONS.map(c => {
    const on = c.toLowerCase() === accent.toLowerCase();
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      onClick: () => setAccent(c),
      "aria-label": c,
      style: {
        width: 40,
        height: 40,
        borderRadius: 99,
        background: c,
        cursor: 'pointer',
        border: on ? `3px solid ${t.surface}` : 'none',
        boxShadow: on ? `0 0 0 2px ${c}` : t.shadowSm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, on && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18,
      sw: 3,
      stroke: "#fff"
    }));
  })))), /*#__PURE__*/React.createElement(SettingsSection, {
    title: "Entra\xEEnement"
  }, /*#__PURE__*/React.createElement(Label, {
    text: "Mes disciplines"
  }), CATEGORIES.map(c => /*#__PURE__*/React.createElement(SelectCard, {
    key: c.id,
    color: c.color,
    title: c.name,
    active: (prefs.disciplines || []).includes(c.id),
    onClick: () => toggleIn('disciplines', c.id)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4
    }
  }), /*#__PURE__*/React.createElement(Label, {
    text: "Objectif principal"
  }), GOAL_OPTIONS.map(g => /*#__PURE__*/React.createElement(SelectCard, {
    key: g.id,
    title: g.title,
    sub: g.sub,
    active: prefs.goal === g.id,
    onClick: () => setP('goal', g.id)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  }), /*#__PURE__*/React.createElement(Label, {
    text: "Niveau"
  }), /*#__PURE__*/React.createElement(Segmented, {
    options: ['Débutant', 'Intermédiaire', 'Avancé'],
    value: prefs.level,
    onChange: v => setP('level', v)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  }), /*#__PURE__*/React.createElement(Label, {
    text: "S\xE9ances par semaine"
  }), /*#__PURE__*/React.createElement(FreqStepper, {
    value: prefs.freq,
    onChange: v => setP('freq', v)
  })), /*#__PURE__*/React.createElement(SettingsSection, {
    title: "Rappels"
  }, /*#__PURE__*/React.createElement(RowCard, {
    icon: "bell",
    title: "Activer les rappels",
    sub: "Les jours d\u2019entra\xEEnement"
  }, /*#__PURE__*/React.createElement(Switch, {
    on: prefs.reminders,
    onClick: () => setP('reminders', !prefs.reminders)
  })), prefs.reminders && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 16,
      padding: '14px 16px',
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement(Label, {
    text: "Jours"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, DAY_LABELS.map((d, i) => {
    const on = (prefs.days || []).includes(i);
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => toggleIn('days', i),
      style: {
        flex: 1,
        aspectRatio: '1',
        borderRadius: 13,
        cursor: 'pointer',
        border: `1.5px solid ${on ? t.accent : t.line}`,
        background: on ? t.accent : t.bg,
        color: on ? '#fff' : t.sub,
        fontSize: 15,
        fontWeight: 700,
        transition: 'all .15s'
      }
    }, d);
  }))), /*#__PURE__*/React.createElement(RowCard, {
    icon: "clock",
    iconColor: t.sub,
    title: "Heure du rappel"
  }, /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: prefs.time,
    onChange: e => setP('time', e.target.value),
    style: {
      border: `1px solid ${t.line}`,
      background: t.bg,
      color: t.ink,
      borderRadius: 10,
      padding: '8px 10px',
      fontSize: 16,
      fontWeight: 700,
      fontFamily: 'inherit',
      outline: 'none'
    }
  })))), /*#__PURE__*/React.createElement(SettingsSection, {
    title: "Donn\xE9es"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirm(true),
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: t.shadowSm
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 11,
      background: 'rgba(255,90,95,0.14)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 18,
    sw: 2.4,
    stroke: "#FF5A5F"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 640,
      color: '#FF5A5F'
    }
  }, "Tout effacer"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: t.sub,
      marginTop: 1
    }
  }, "Supprime s\xE9ances, exercices et historique")))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: t.faint,
      fontSize: 12.5,
      marginTop: 4
    }
  }, "Athlyt \xB7 v1")), confirm && /*#__PURE__*/React.createElement(Sheet, {
    title: "Tout effacer ?",
    onClose: () => setConfirm(false)
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 18px',
      fontSize: 15,
      lineHeight: 1.5,
      color: t.sub
    }
  }, "Tes s\xE9ances, exercices et historique seront d\xE9finitivement supprim\xE9s. Action irr\xE9versible."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirm(false),
    style: {
      flex: 1,
      border: `1px solid ${t.line}`,
      cursor: 'pointer',
      background: t.surface,
      color: t.ink,
      borderRadius: 14,
      padding: '15px',
      fontSize: 16,
      fontWeight: 680
    }
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onReset();
      setConfirm(false);
      onClose();
    },
    style: {
      flex: 1,
      border: 'none',
      cursor: 'pointer',
      background: '#FF5A5F',
      color: '#fff',
      borderRadius: 14,
      padding: '15px',
      fontSize: 16,
      fontWeight: 700
    }
  }, "Tout effacer"))));
}
Object.assign(window, {
  SettingsScreen
});

/* ======================= 99-mount.jsx ======================= */
// athlyt-mount.jsx — point d'entrée. Doit être chargé EN DERNIER (après tous les
// composants) : le rendu déclenche App qui référence tous les écrans/overlays.
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
