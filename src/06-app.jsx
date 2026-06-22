// athlyt-app.jsx — application root.
// Adapté du design Claude pour une vraie PWA plein écran :
// le cadre « iPhone » de la maquette (IOSDevice) et le panneau d'édition (Tweaks)
// sont retirés ; le reste de l'app du design est conservé tel quel.

const { useState, useEffect, useMemo } = React;

const STORE = 'athlyt-v2';
const ACCENT = '#1F6BFF'; // accent du design (modifiable)

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function buildTheme(dark, accent) {
  const base = makeTheme(dark);
  return { ...base, accent, accentSoft: hexA(accent, dark ? 0.18 : 0.10), energy2: accent };
}
function loadStore() {
  try { const r = localStorage.getItem(STORE); if (r) return JSON.parse(r); } catch (e) {}
  return null;
}
function prefersDark() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
}

function App() {
  const persisted = useMemo(loadStore, []);
  const [data, setData] = useState(() => persisted?.data || seedData());
  const [onboarded, setOnboarded] = useState(() => persisted?.onboarded || false);
  const [tab, setTab] = useState(() => persisted?.tab || 'home');
  const [dark] = useState(() => persisted?.dark ?? prefersDark());

  // overlays / sheets
  const [guidedId, setGuidedId] = useState(null);
  const [timerMode, setTimerMode] = useState(null);
  const [editSessionId, setEditSessionId] = useState(null);
  const [exDetail, setExDetail] = useState(null);
  const [exEdit, setExEdit] = useState(undefined); // undefined = fermé, null = nouveau, obj = édition
  const [toastMsg, setToastMsg] = useState(null);

  const theme = useMemo(() => buildTheme(dark, ACCENT), [dark]);

  // recherche d'exercice exposée aux helpers d'écran
  useEffect(() => { window.__exLookup = (id) => data.exercises.find((e) => e.id === id); }, [data]);
  window.__exLookup = window.__exLookup || ((id) => data.exercises.find((e) => e.id === id));

  // persistance
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify({ data, onboarded, tab, dark })); } catch (e) {}
  }, [data, onboarded, tab, dark]);

  // fond + couleur de barre système alignés sur le thème
  useEffect(() => {
    document.documentElement.style.background = theme.bg2;
    document.body.style.background = theme.bg2;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.bg);
  }, [theme]);

  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2200); };

  // data ops
  const upsertExercise = (ex) => setData((d) => {
    const exists = d.exercises.some((e) => e.id === ex.id);
    return { ...d, exercises: exists ? d.exercises.map((e) => e.id === ex.id ? ex : e) : [...d.exercises, ex] };
  });
  const deleteExercise = (id) => setData((d) => ({ ...d,
    exercises: d.exercises.filter((e) => e.id !== id),
    sessions: d.sessions.map((s) => ({ ...s, blocks: s.blocks.filter((b) => b.exerciseId !== id) })) }));
  const updateSession = (s) => setData((d) => ({ ...d, sessions: d.sessions.map((x) => x.id === s.id ? s : x) }));
  const deleteSession = (id) => setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));
  const newSession = () => {
    const s = { id: uid(), name: 'Nouvelle séance', note: '', accent: 'force', blocks: [] };
    setData((d) => ({ ...d, sessions: [...d.sessions, s] }));
    setEditSessionId(s.id);
  };
  const addHistory = (h) => setData((d) => ({ ...d, history: [h, ...d.history] }));

  const actions = {
    goTab: setTab,
    startGuided: (id) => setGuidedId(id),
    openSession: (id) => setEditSessionId(id),
    openTimer: (mode) => setTimerMode(mode),
  };

  const guidedSession = guidedId && data.sessions.find((s) => s.id === guidedId);
  const editSession = editSessionId && data.sessions.find((s) => s.id === editSessionId);

  let screen;
  if (tab === 'home') screen = <HomeScreen data={data} actions={actions} />;
  else if (tab === 'sessions') screen = <SessionsScreen data={data} actions={actions} onNew={newSession} />;
  else if (tab === 'exercises') screen = <ExercisesScreen data={data} onOpenExercise={setExDetail} onNew={() => setExEdit(null)} />;
  else if (tab === 'timer') screen = <TimerScreen onOpenTimer={actions.openTimer} />;
  else screen = <ActivityScreen data={data} />;

  return (
    <ThemeCtx.Provider value={theme}>
      <div style={{ position: 'relative', height: '100dvh', width: '100%', maxWidth: 460, margin: '0 auto',
        background: theme.bg, color: theme.ink, overflow: 'hidden',
        boxShadow: theme.dark ? 'none' : '0 0 0 1px rgba(12,16,25,0.06)' }}>
        <div key={tab} style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 92, animation: 'athScreen .25s ease' }}>
          {screen}
        </div>
        <TabBar tab={tab} onTab={setTab} />

        {guidedSession && (
          <GuidedSession session={guidedSession} exercises={data.exercises}
            onClose={() => setGuidedId(null)}
            onFinish={(h) => { addHistory(h); setGuidedId(null); setTab('activity'); toast('Séance enregistrée 💪'); }} />
        )}
        {timerMode && <IntervalTimer initialMode={timerMode} onClose={() => setTimerMode(null)} />}
        {editSession && (
          <SessionEditor session={editSession} exercises={data.exercises}
            onChange={updateSession} onDelete={(id) => { deleteSession(id); setEditSessionId(null); }}
            onStart={(id) => { setEditSessionId(null); setGuidedId(id); }}
            onClose={() => setEditSessionId(null)} />
        )}
        {exDetail && (
          <ExerciseDetail exercise={exDetail} onClose={() => setExDetail(null)}
            onEdit={() => { const e = exDetail; setExDetail(null); setExEdit(e); }} />
        )}
        {exEdit !== undefined && (
          <ExerciseEditor exercise={exEdit} onSave={upsertExercise} onDelete={deleteExercise} onClose={() => setExEdit(undefined)} />
        )}

        {!onboarded && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 120 }}>
            <Onboarding onDone={() => { setOnboarded(true); setTab('home'); }} />
          </div>
        )}

        {toastMsg && (
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 104, zIndex: 130,
            background: theme.ink, color: theme.bg, borderRadius: 99, padding: '12px 20px', fontSize: 14.5, fontWeight: 650,
            boxShadow: '0 12px 28px rgba(0,0,0,0.3)', animation: 'athUp .25s ease' }}>{toastMsg}</div>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
